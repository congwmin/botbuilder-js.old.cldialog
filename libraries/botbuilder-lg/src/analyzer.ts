
/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, ParseTree, TerminalNode } from 'antlr4ts/tree';
import { Constant, Expression, Extensions, IExpressionParser } from 'botbuilder-expression';
import { ExpressionEngine} from 'botbuilder-expression-parser';
import { flatten, keyBy } from 'lodash';
import { EvaluationTarget, Evaluator } from './evaluator';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { LGTemplate } from './lgTemplate';

export class AnalyzerResult {
    public Variables: string[];
    public TemplateReferences: string[];

    public constructor(variables: string[] = [], templateRefNames: string[] = []) {
        this.Variables = Array.from(new Set(variables));
        this.TemplateReferences = Array.from(new Set(templateRefNames));
    }

    public union(outputItem: AnalyzerResult): this {
        this.Variables = Array.from(new Set(this.Variables.concat(outputItem.Variables)));
        this.TemplateReferences = Array.from(new Set(this.TemplateReferences.concat(outputItem.TemplateReferences)));

        return this;
    }
}

// tslint:disable-next-line: max-classes-per-file
/**
 * Analyzer engine. To analyse which variable may be used
 */
export class Analyzer extends AbstractParseTreeVisitor<AnalyzerResult> implements LGFileParserVisitor<AnalyzerResult> {
    public readonly Templates: LGTemplate[];
    public readonly TemplateMap: {[name: string]: LGTemplate};
    private readonly evalutationTargetStack: EvaluationTarget[] = [];
    private readonly _expressionParser: IExpressionParser;

    constructor(templates: LGTemplate[], expressionEngine: ExpressionEngine) {
        super();
        this.Templates = templates;
        this.TemplateMap = keyBy(templates, (t: LGTemplate) => t.Name);

        // create an evaluator to leverage it's customized function look up for checking
        const evaluator: Evaluator = new Evaluator(this.Templates, expressionEngine);
        this._expressionParser = evaluator.ExpressionEngine;
    }

    public AnalyzeTemplate(templateName: string): AnalyzerResult {
        if (!(templateName in this.TemplateMap)) {
            throw new Error(`No such template: ${templateName}`);
        }

        if (this.evalutationTargetStack.find((u: EvaluationTarget) => u.TemplateName === templateName) !== undefined) {
            throw new Error(`Loop deteced: ${this.evalutationTargetStack.reverse()
                .map((u: EvaluationTarget) => u.TemplateName)
                .join(' => ')}`);
        }

        // Using a stack to track the evalution trace
        this.evalutationTargetStack.push(new EvaluationTarget(templateName, undefined));

        // we don't exclude paratemters any more
        // because given we don't track down for templates have parameters
        // the only scenario that we are still analyzing an parameterized template is
        // this template is root template to anaylze, in this we also don't have exclude parameters
        const dependencies: AnalyzerResult = this.visit(this.TemplateMap[templateName].ParseTree);
        this.evalutationTargetStack.pop();

        return dependencies;
    }

    public visitTemplateDefinition(ctx: lp.TemplateDefinitionContext): AnalyzerResult {
        const templateNameContext: lp.TemplateNameLineContext = ctx.templateNameLine();
        if (templateNameContext.templateName().text === this.currentTarget().TemplateName) {
            if (ctx.templateBody() !== undefined) {
                return this.visit(ctx.templateBody());
            }
        }

        throw Error(`template name match failed`);
    }

    public visitNormalBody(ctx: lp.NormalBodyContext): AnalyzerResult {
        return this.visit(ctx.normalTemplateBody());
    }

    public visitNormalTemplateBody(ctx: lp.NormalTemplateBodyContext) : AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();
        for (const templateStr of ctx.templateString()) {
            result.union(this.visit(templateStr.normalTemplateString()));
        }

        return result;
    }

    public visitIfElseBody(ctx: lp.IfElseBodyContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();

        const ifRules: lp.IfConditionRuleContext[] = ctx.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            const expressions: TerminalNode[] = ifRule.ifCondition().EXPRESSION();
            if (expressions !== undefined && expressions.length > 0) {
                result.union(this.AnalyzeExpression(expressions[0].text));
            }
            if (ifRule.normalTemplateBody() !== undefined) {
                result.union(this.visit(ifRule.normalTemplateBody()));
            }
        }

        return result;
    }

    public visitSwitchCaseBody(ctx: lp.SwitchCaseBodyContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();
        const switchCaseNodes: lp.SwitchCaseRuleContext[] = ctx.switchCaseTemplateBody().switchCaseRule();
        for (const iterNode of switchCaseNodes) {
            const expressions: TerminalNode[] = iterNode.switchCaseStat().EXPRESSION();
            if (expressions.length > 0) {
                result.union(this.AnalyzeExpression(expressions[0].text));
            }
            if (iterNode.normalTemplateBody() !== undefined) {
                result.union(this.visit(iterNode.normalTemplateBody()));
            }
        }

        return result;
    }

    public visitNormalTemplateString(ctx: lp.NormalTemplateStringContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();
        for (const node of ctx.children) {
            const innerNode: TerminalNode =  node as TerminalNode;
            switch (innerNode.symbol.type) {
                case lp.LGFileParser.DASH: break;
                case lp.LGFileParser.EXPRESSION: {
                    result.union(this.AnalyzeExpression(innerNode.text));
                    break;
                }
                case lp.LGFileParser.TEMPLATE_REF: {
                    result.union(this.AnalyzeTemplateRef(innerNode.text));
                    break;
                }
                case lp.LGFileParser.MULTI_LINE_TEXT: {
                    result.union(this.AnalyzeMultiLineText(innerNode.text));
                    break;
                }
                default: {
                    break;
                }
            }
        }

        return result;
    }

    protected defaultResult(): AnalyzerResult {
        return new AnalyzerResult();
    }

    private AnalyzeExpressionDirectly(exp: Expression): AnalyzerResult {
        const result: AnalyzerResult =  new AnalyzerResult();

        if (exp.Type in this.TemplateMap) {
            const templateName: string = exp.Type;
            result.union(new AnalyzerResult([], [templateName]));

            if (this.TemplateMap[templateName].Parameters === undefined || this.TemplateMap[templateName].Parameters.length === 0) {
                result.union(this.AnalyzeTemplate(templateName));
            } else {
                // if template has params, just get the templateref without variables.
                result.union(new AnalyzerResult([], this.AnalyzeTemplate(templateName).TemplateReferences));
            }
        }

        if (exp.Children !== undefined) {
            exp.Children.forEach((e: Expression) => result.union(this.AnalyzeExpressionDirectly(e)));
        }

        return result;
    }

    private AnalyzeExpression(exp: string): AnalyzerResult {
        const result: AnalyzerResult =  new AnalyzerResult();
        exp = exp.replace(/(^@*)/g, '')
                .replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '');
        const parsed: Expression = this._expressionParser.parse(exp);

        const references: ReadonlyArray<string> = Extensions.References(parsed);
        result.union(new AnalyzerResult(references.slice(), []));
        result.union(this.AnalyzeExpressionDirectly(parsed));

        return  result;
    }

    private AnalyzeTemplateRef(exp: string): AnalyzerResult {
        exp = exp.replace(/(^\[*)/g, '')
                .replace(/(\]*$)/g, '');
        exp = exp.indexOf('(') < 0 ? exp.concat('()') : exp;

        return this.AnalyzeExpression(exp);
    }

    private AnalyzeMultiLineText(exp: string): AnalyzerResult {
        const result: AnalyzerResult =  new AnalyzerResult();
        exp = exp.substr(3, exp.length - 6);
        const matches: string[] = exp.match(/@\{[^{}]+\}/g);
        for (const match of matches) {
            result.union(this.AnalyzeExpression(match));
        }

        return result;
    }

    private currentTarget(): EvaluationTarget {
        return this.evalutationTargetStack[this.evalutationTargetStack.length - 1];
    }
}
