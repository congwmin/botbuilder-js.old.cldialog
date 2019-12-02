
/**
 * @module botbuilder-expression-parser
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, ParseTree } from 'antlr4ts/tree';
import { BuiltInFunctions, Constant, EvaluatorLookup, Expression, ExpressionType, IExpressionParser } from 'botbuilder-expression';
import { ErrorListener } from './errorListener';
import { ExpressionLexer, ExpressionParser, ExpressionVisitor } from './generated';
import * as ep from './generated/ExpressionParser';
import { Util } from './util';

/**
 * Parser to turn strings into Expression
 */
export class ExpressionEngine implements IExpressionParser {
    public readonly EvaluatorLookup: EvaluatorLookup;

    // tslint:disable-next-line: typedef
    private readonly ExpressionTransformer = class extends AbstractParseTreeVisitor<Expression> implements ExpressionVisitor<Expression> {
        private readonly ShorthandPrefixMap : Map<string, string> = new Map<string, string>([
            ['#', 'turn.recognized.intents'],
            ['@', 'turn.recognized.entities'],
            ['@@', 'turn.recognized.entities'],
            ['$', 'dialog'],
            ['^', ''],
            ['%', 'dialog.options'],
            ['~', 'dialog.instance']
        ]);

        private readonly _lookup: EvaluatorLookup = undefined;
        public constructor(lookup: EvaluatorLookup) {
            super();
            this._lookup = lookup;
        }

        public Transform = (context: ParseTree): Expression => this.visit(context);

        public visitUnaryOpExp(context: ep.UnaryOpExpContext): Expression {
            const unaryOperationName: string = context.getChild(0).text;
            const operand: Expression = this.visit(context.expression());
            if (unaryOperationName === ExpressionType.Subtract || unaryOperationName === ExpressionType.Add) {
                return this.MakeExpression(unaryOperationName, new Constant(0), operand);
            }

            return this.MakeExpression(unaryOperationName, operand);
        }

        public visitBinaryOpExp(context: ep.BinaryOpExpContext): Expression {
            const binaryOperationName: string = context.getChild(1).text;
            const left: Expression = this.visit(context.expression(0));
            const right: Expression = this.visit(context.expression(1));

            return this.MakeExpression(binaryOperationName, left, right);
        }

        public visitShorthandAccessorExp(context: ep.ShorthandAccessorExpContext): Expression {
            if (context.primaryExpression() instanceof ep.ShorthandAtomContext) {
                const shorthandAtom: ep.ShorthandAtomContext = <ep.ShorthandAtomContext>(context.primaryExpression());
                const shorthandMark: string = shorthandAtom.text;

                if (!this.ShorthandPrefixMap.has(shorthandMark)) {
                    throw new Error(`${shorthandMark} is not a shorthand`);
                }

                const property: Constant = new Constant(context.IDENTIFIER().text);

                if (shorthandMark === '^') {
                    return this.MakeExpression(ExpressionType.Callstack, property);
                }

                const accessorExpression: Expression = this.Transform(ExpressionEngine.AntlrParse(this.ShorthandPrefixMap.get(shorthandMark)));
                const expression: Expression = this.MakeExpression(ExpressionType.Accessor, property, accessorExpression);

                return shorthandMark === '@' ? this.MakeExpression(ExpressionType.SimpleEntity, expression) : expression;
            }
        }

        public visitFuncInvokeExp(context: ep.FuncInvokeExpContext): Expression {
            const parameters: Expression[] = this.ProcessArgsList(context.argsList());

            // Remove the check to check primaryExpression is just an IDENTIFIER to support "." in template name
            const functionName: string = context.primaryExpression().text;

            return this.MakeExpression(functionName, ...parameters);
        }

        public visitIdAtom(context: ep.IdAtomContext): Expression {
            let result: Expression;
            const symbol: string = context.text;

            if (symbol === 'false') {
                result = new Constant(false);
            } else if (symbol === 'true') {
                result = new Constant(true);
            } else if (symbol === 'null' || symbol === 'undefined') {
                result = new Constant(undefined);
            } else {
                result = this.MakeExpression(ExpressionType.Accessor, new Constant(symbol));
            }

            return result;
        }

        public visitIndexAccessExp(context: ep.IndexAccessExpContext): Expression {
            let instance: Expression;
            const property: Expression = this.visit(context.expression());

            if (context.primaryExpression() instanceof ep.ShorthandAtomContext) {
                const shorthandAtom: ep.ShorthandAtomContext = <ep.ShorthandAtomContext>(context.primaryExpression());
                const shorthandMark: string = shorthandAtom.text;

                if (!this.ShorthandPrefixMap.has(shorthandMark)) {
                    throw new Error(`${shorthandMark} is not a shorthand`);
                }

                if (shorthandMark === '^') {
                    return this.MakeExpression(ExpressionType.Callstack, property);
                }

                instance = this.Transform(ExpressionEngine.AntlrParse(this.ShorthandPrefixMap.get(shorthandMark)));
                const expression: Expression = this.MakeExpression(ExpressionType.Element, instance, property);

                return shorthandMark === '@' ? this.MakeExpression(ExpressionType.SimpleEntity, expression) : expression;
            }

            instance = this.visit(context.primaryExpression());

            return this.MakeExpression(ExpressionType.Element, instance, property);
        }

        public visitMemberAccessExp(context: ep.MemberAccessExpContext): Expression {
            const property: string = context.IDENTIFIER().text;
            if (context.primaryExpression() instanceof ep.ShorthandAtomContext) {
                throw new Error(`${context.text} is not a valid shorthand. Maybe you mean '${context.primaryExpression().text}${property}'?`);
            }
            const instance: Expression = this.visit(context.primaryExpression());

            return this.MakeExpression(ExpressionType.Accessor, new Constant(property), instance);
        }

        public visitNumericAtom(context: ep.NumericAtomContext): Expression {
            const numberValue: number = parseFloat(context.text);
            if (typeof numberValue === 'number' && !Number.isNaN(numberValue)) {
                return new Constant(numberValue);
            }

            throw Error(`${context.text} is not a number.`);
        }

        public visitParenthesisExp = (context: ep.ParenthesisExpContext): Expression => this.visit(context.expression());

        public visitStringAtom(context: ep.StringAtomContext): Expression {
            const text: string = context.text;
            if (text.startsWith('\'')) {
                return new Constant(Util.Unescape(Util.Trim(context.text, '\'')));
            } else { // start with ""
                return new Constant(Util.Unescape(Util.Trim(context.text, '"')));
            }
        }

        protected defaultResult = (): Expression => new Constant('');

        private readonly MakeExpression = (type: string, ...children: Expression[]): Expression =>
            Expression.MakeExpression(type, this._lookup(type), ...children)

        private ProcessArgsList(context: ep.ArgsListContext): Expression[] {
            const result: Expression[] = [];
            if (context !== undefined) {
                for (const expression of context.expression()) {
                    result.push(this.visit(expression));
                }
            }

            return result;
        }
    };

    public constructor(lookup?: EvaluatorLookup) {
        this.EvaluatorLookup = lookup === undefined ? BuiltInFunctions.Lookup : lookup;
    }

    protected static AntlrParse(expression: string): ParseTree {
        const inputStream: ANTLRInputStream = new ANTLRInputStream(expression);
        const lexer: ExpressionLexer = new ExpressionLexer(inputStream);
        const tokenStream: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: ExpressionParser = new ExpressionParser(tokenStream);
        parser.removeErrorListeners();
        parser.addErrorListener(ErrorListener.Instance);
        parser.buildParseTree = true;

        return parser.expression();
    }

    public parse(expression: string): Expression {
        try {
            return new this.ExpressionTransformer(this.EvaluatorLookup).Transform(ExpressionEngine.AntlrParse(expression));
        } catch (err) {
            throw new Error(`Parse failed for expression '${expression}', inner error: ${err}`);
        }
    }
}
