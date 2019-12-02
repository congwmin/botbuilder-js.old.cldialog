/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ImportResolver, ImportResolverDelegate } from './importResolver';
import { LGImport } from './lgImport';
import { LGParser } from './lgParser';
import { LGTemplate } from './lgTemplate';

/**
 * LG Resource
 */
export class LGResource {

   public Id: string;

   public Templates: LGTemplate[];

   public Imports: LGImport[];

   public Content: string;

   constructor(templates: LGTemplate[], imports: LGImport[], content: string, id: string = '') {
      this.Templates = templates;
      this.Imports = imports;
      this.Id = id;
      this.Content = content;
   }

   public discoverLGResources(importResolver: ImportResolverDelegate) : LGResource[] {
      const resourcesFound: LGResource[] = [];
      importResolver = importResolver === undefined ? ImportResolver.fileResolver : importResolver;
      this.resolveImportResources(this, importResolver, resourcesFound);

      return resourcesFound;
   }

   /**
    * update an exist template.
    * @param templateName origin template name. the only id of a template.
    * @param parameters new params.
    * @param templateBody new template body.
    * @returns new LG resource.
    */
   public updateTemplate(templateName: string, parameters: string[], templateBody: string): LGResource {
      const template: LGTemplate = this.Templates.find((u: LGTemplate) => u.Name === templateName);
      if (template === undefined) {
         return this;
      }

      const templateNameLine: string = this.buildTemplateNameLine(templateName, parameters);
      const newTemplateBody: string = this.convertTemplateBody(templateBody);
      const content: string = `${templateNameLine}\r\n${newTemplateBody}`;
      const startLine: number = template.ParseTree.start.line - 1;
      const stopLine: number = template.ParseTree.stop.line - 1;

      const newContent: string = this.ReplaceRangeContent(this.Content, startLine, stopLine, content);

      return LGParser.parse(newContent, this.Id);
   }

   /**
    * Add a new template and return LG resource.
    * @param templateName new template name.
    * @param parameters new params.
    * @param templateBody new  template body.
    * @returns new lg resource.
    */
   public addTemplate(templateName: string, parameters: string[], templateBody: string): LGResource {
      const template: LGTemplate = this.Templates.find((u: LGTemplate) => u.Name === templateName);
      if (template !== undefined) {
         throw new Error(`template ${templateName} already exists.`);
      }

      const templateNameLine: string = this.buildTemplateNameLine(templateName, parameters);
      const newTemplateBody: string = this.convertTemplateBody(templateBody);
      const newContent: string = `${this.Content}\r\n${templateNameLine}\r\n${newTemplateBody}`;

      return LGParser.parse(newContent, this.Id);
   }

   /**
    * Delete an exist template.
    * @param templateName which template should delete.
    * @returns return the new lg resource.
    */
   public deleteTemplate(templateName: string): LGResource {
      const template: LGTemplate = this.Templates.find((u: LGTemplate) => u.Name === templateName);
      if (template === undefined) {
         return this;
      }

      const startLine: number = template.ParseTree.start.line - 1;
      const stopLine: number = template.ParseTree.stop.line - 1;

      const newContent: string = this.ReplaceRangeContent(this.Content, startLine, stopLine, undefined);

      return LGParser.parse(newContent, this.Id);
   }

   public toString() : string {
      return this.Content;
   }

   private ReplaceRangeContent(originString: string, startLine: number, stopLine: number, replaceString: string): string {
      const originList: string[] = originString.split('\n');
      const destList: string[] = [];

      if (startLine < 0 || startLine > stopLine || stopLine >= originList.length) {
         throw new Error(`index out of range.`);
      }

      destList.push(...originList.slice(0, startLine));

      if (replaceString !== undefined && replaceString.length > 0) {
         destList.push(replaceString);
      }

      destList.push(...originList.slice(stopLine + 1));

      return destList.join('\n');
   }

   private convertTemplateBody(templateBody: string) : string {
      if (templateBody === undefined || templateBody.length === 0) {
         return '';
      }

      const replaceList: string[] = templateBody.split('\n');
      const wrappedReplaceList: string[] = replaceList.map((u: string) => this.wrapTemplateBodyString(u));

      return wrappedReplaceList.join('\n');
   }

   private wrapTemplateBodyString(replaceItem: string): string {
      // tslint:disable-next-line: newline-per-chained-call
      const isStartWithHash: boolean = replaceItem.trimStart().startsWith('#');
      if (isStartWithHash) {
         return `- ${replaceItem.trimStart()}`;
      } else {
         return replaceItem;
      }
   }

   private buildTemplateNameLine(templateName: string, parameters: string[]): string {
      return `# ${templateName}(${parameters.join(', ')})`;
   }

   private resolveImportResources(start: LGResource, importResolver: ImportResolverDelegate, resourcesFound: LGResource[]): void {
      const resourceIds: string[] = start.Imports.map((lg: LGImport) => lg.Id);
      resourcesFound.push(start);

      resourceIds.forEach((resourceId: string) => {
         try {
            const { content, id } = importResolver(start.Id, resourceId);
            const childResource: LGResource = LGParser.parse(content, id);

            if (!(resourcesFound.some((x: LGResource) => x.Id === childResource.Id))) {
                  this.resolveImportResources(childResource, importResolver, resourcesFound);
            }
         } catch (e) {
            throw new Error(`[Error]${resourceId}:${e.message}`);
         }
      });
   }
}
