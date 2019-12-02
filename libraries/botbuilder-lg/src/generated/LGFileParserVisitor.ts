// Generated from ../LGFileParser.g4 by ANTLR 4.6-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { SwitchCaseBodyContext } from "./LGFileParser";
import { NormalBodyContext } from "./LGFileParser";
import { StructuredBodyContext } from "./LGFileParser";
import { IfElseBodyContext } from "./LGFileParser";
import { FileContext } from "./LGFileParser";
import { ParagraphContext } from "./LGFileParser";
import { NewlineContext } from "./LGFileParser";
import { TemplateDefinitionContext } from "./LGFileParser";
import { TemplateNameLineContext } from "./LGFileParser";
import { ErrorTemplateNameContext } from "./LGFileParser";
import { TemplateNameContext } from "./LGFileParser";
import { ParametersContext } from "./LGFileParser";
import { TemplateBodyContext } from "./LGFileParser";
import { StructuredTemplateBodyContext } from "./LGFileParser";
import { StructuredBodyNameLineContext } from "./LGFileParser";
import { StructuredBodyContentLineContext } from "./LGFileParser";
import { StructuredBodyEndLineContext } from "./LGFileParser";
import { NormalTemplateBodyContext } from "./LGFileParser";
import { TemplateStringContext } from "./LGFileParser";
import { NormalTemplateStringContext } from "./LGFileParser";
import { ErrorTemplateStringContext } from "./LGFileParser";
import { IfElseTemplateBodyContext } from "./LGFileParser";
import { IfConditionRuleContext } from "./LGFileParser";
import { IfConditionContext } from "./LGFileParser";
import { SwitchCaseTemplateBodyContext } from "./LGFileParser";
import { SwitchCaseRuleContext } from "./LGFileParser";
import { SwitchCaseStatContext } from "./LGFileParser";
import { ImportDefinitionContext } from "./LGFileParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `LGFileParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface LGFileParserVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `switchCaseBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSwitchCaseBody?: (ctx: SwitchCaseBodyContext) => Result;

	/**
	 * Visit a parse tree produced by the `normalBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNormalBody?: (ctx: NormalBodyContext) => Result;

	/**
	 * Visit a parse tree produced by the `structuredBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStructuredBody?: (ctx: StructuredBodyContext) => Result;

	/**
	 * Visit a parse tree produced by the `ifElseBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIfElseBody?: (ctx: IfElseBodyContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.file`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFile?: (ctx: FileContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.paragraph`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParagraph?: (ctx: ParagraphContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.newline`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNewline?: (ctx: NewlineContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.templateDefinition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemplateDefinition?: (ctx: TemplateDefinitionContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.templateNameLine`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemplateNameLine?: (ctx: TemplateNameLineContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.errorTemplateName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitErrorTemplateName?: (ctx: ErrorTemplateNameContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.templateName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemplateName?: (ctx: TemplateNameContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.parameters`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParameters?: (ctx: ParametersContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemplateBody?: (ctx: TemplateBodyContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.structuredTemplateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStructuredTemplateBody?: (ctx: StructuredTemplateBodyContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.structuredBodyNameLine`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStructuredBodyNameLine?: (ctx: StructuredBodyNameLineContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.structuredBodyContentLine`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStructuredBodyContentLine?: (ctx: StructuredBodyContentLineContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.structuredBodyEndLine`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStructuredBodyEndLine?: (ctx: StructuredBodyEndLineContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.normalTemplateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNormalTemplateBody?: (ctx: NormalTemplateBodyContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.templateString`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemplateString?: (ctx: TemplateStringContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.normalTemplateString`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNormalTemplateString?: (ctx: NormalTemplateStringContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.errorTemplateString`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitErrorTemplateString?: (ctx: ErrorTemplateStringContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.ifElseTemplateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIfElseTemplateBody?: (ctx: IfElseTemplateBodyContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.ifConditionRule`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIfConditionRule?: (ctx: IfConditionRuleContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.ifCondition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIfCondition?: (ctx: IfConditionContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.switchCaseTemplateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSwitchCaseTemplateBody?: (ctx: SwitchCaseTemplateBodyContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.switchCaseRule`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSwitchCaseRule?: (ctx: SwitchCaseRuleContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.switchCaseStat`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSwitchCaseStat?: (ctx: SwitchCaseStatContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.importDefinition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitImportDefinition?: (ctx: ImportDefinitionContext) => Result;
}

