/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { SequenceContext, StepChangeType, StepChangeList } from '../sequenceContext';
import { ExpressionPropertyValue, ExpressionProperty } from '../expressionProperty';

/**
 * Configuration info passed to a `ForEachPage` step.
 */
export interface ForEachPageConfiguration extends DialogConfiguration {
    /**
     * Expression used to compute the list that should be enumerated.
     */
    list?: ExpressionPropertyValue<any[]|object>;

    /**
     * (Optional) expression to compute number of items per page. Defaults to "10".
     */
    pageSize?: ExpressionPropertyValue<number>;

    /**
     * In-memory property that will contain the current items value. Defaults to `dialog.value`.
     */
    valueProperty?: string;

    /**
     * Steps to be run for each page of items.
     */
    steps?: Dialog[];
}

/**
 * Executes a set of steps once for each page of results in an in-memory list or collection.
 * 
 * @remarks
 * The list or collection at [property](#property) will be broken up into pages and stored in
 * `dialog.page` for each iteration of the loop. The size of each page is determined by [maxSize](#maxsize)
 * and defaults to a size of 10. The loop can be exited early by including either a `EndDialog` or
 * `GotoDialog` step.
 */
export class ForEachPage extends DialogCommand {

    /**
     * Creates a new `ForEachPage` instance.
     * @param list Expression used to compute the list that should be enumerated.
     * @param pageSize (Optional) number of items per page. Defaults to a value of 10.
     * @param steps Steps to be run for each page of items. 
     */
    constructor();
    constructor(list: ExpressionPropertyValue<any[]|object>, steps: Dialog[]);
    constructor(list: ExpressionPropertyValue<any[]|object>, pageSize: ExpressionPropertyValue<number>, steps: Dialog[]);
    constructor(list?: ExpressionPropertyValue<any[]|object>, pageSizeOrSteps?: ExpressionPropertyValue<number>|Dialog[], steps?: Dialog[]) {
        super();
        if (Array.isArray(pageSizeOrSteps)) {
            steps = pageSizeOrSteps;
            pageSizeOrSteps = undefined;
        }
        if (list) { this.list = new ExpressionProperty(list) }
        if (pageSizeOrSteps) { this.pageSize = new ExpressionProperty(pageSizeOrSteps as any) }
        if (steps) { this.steps = steps } 
    }

    protected onComputeID(): string {
        const label = this.list ? this.list.toString() : '';
        return `forEachPage[${this.hashedLabel(label)}]`;
    }

    /**
     * Expression used to compute the list that should be enumerated.
     */
    public list: ExpressionProperty<any[]|object>;

    /**
     * Number of items per page. Defaults to a value of 10.
     */
    public pageSize: ExpressionProperty<number> = new ExpressionProperty("10");

    /**
     * In-memory property that will contain the current items value. Defaults to `dialog.value`.
     */
    public valueProperty: string = 'dialog.value';

    /**
     * Steps to be run for each page of items.
     */
    public steps: Dialog[] = [];

    public configure(config: ForEachPageConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch(key) {
                    case 'list':
                        this.list = new ExpressionProperty(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    public getDependencies(): Dialog[] {
        return this.steps;
    }

    protected async onRunCommand(sequence: SequenceContext, options: ForEachPageOptions): Promise<DialogTurnResult> {
        // Ensure planning context
        if (!(sequence instanceof SequenceContext)) { throw new Error(`${this.id}: should only be used within an AdaptiveDialog.`) }
        if (!this.list) { throw new Error(`${this.id}: no list expression specified.`) }
        if (!this.pageSize) { throw new Error(`${this.id}: no pageSize expression specified.`) }

        // Unpack options
        let { list, offset, pageSize } = options;
        const memory = sequence.state.toJSON();
        if (list == undefined) { list = this.list.evaluate(this.id, memory) }
        if (pageSize == undefined) { pageSize = this.pageSize.evaluate(this.id, memory) }
        if (offset == undefined) { offset = 0 }

        // Get next page of items
        const page = this.getPage(list, offset, pageSize);

        // Update current plan
        if (page.length > 0) {
            sequence.state.setValue(this.valueProperty, page);
            const changes: StepChangeList = {
                changeType: StepChangeType.insertSteps,
                steps: []
            };
            this.steps.forEach((step) => changes.steps.push({ dialogStack: [], dialogId: step.id }));
            if (page.length == pageSize) {
                // Add a call back into forEachPage() at the end of repeated steps.
                // - A new offset is passed in which causes the next page of results to be returned.
                changes.steps.push({ 
                    dialogStack: [], 
                    dialogId: this.id, 
                    options: {
                        list: list,
                        offset: offset + pageSize,
                        pageSize: pageSize
                    }
                });
            }
            sequence.queueChanges(changes);
        }

        return await sequence.endDialog();
    }

    private getPage(list: any[]|object, offset: number, pageSize: number): any[] {
        const page: any[] = [];
        const end = offset + pageSize;
        if (Array.isArray(list)) {
            for (let i = offset; i >= offset && i < end; i++) {
                page.push(list[i]);
            }
        } else if (typeof list === 'object') {
            let i = 0;
            for (const key in list) {
                if (list.hasOwnProperty(key)) {
                    if (i >= offset && i < end) {
                        page.push(list[key]);
                    }
                    i++;
                }
            }
        }
        return page;
    }
}

interface ForEachPageOptions {
    list: any[]|object;
    offset?: number;
    pageSize?: number;
}