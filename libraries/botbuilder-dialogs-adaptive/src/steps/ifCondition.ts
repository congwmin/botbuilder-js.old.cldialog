/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { SequenceContext, StepState, StepChangeType } from '../sequenceContext';
import { ExpressionPropertyValue, ExpressionProperty } from '../expressionProperty';

export interface IfConditionConfiguration extends DialogConfiguration {
    /**
     * The conditional expression to evaluate.
     */
    condition?: ExpressionPropertyValue<boolean>;
    
    /**
     * The steps to run if [condition](#condition) returns true.
     */
    steps?: Dialog[];

    /**
     * The steps to run if [condition](#condition) returns false.
     */
    elseSteps?: Dialog[];
}

export class IfCondition extends DialogCommand {
    /**
     * The conditional expression to evaluate.
     */
    public condition: ExpressionProperty<boolean>;

    /**
     * The steps to run if [condition](#condition) returns true.
     */
    public steps: Dialog[] = [];

    /**
     * The steps to run if [condition](#condition) returns false.
     */
    public elseSteps: Dialog[] = [];

    /**
     * Creates a new `IfCondition` instance.
     * @param condition The conditional expression to evaluate.
     * @param steps The steps to run if the condition returns true. 
     */
    constructor(condition?: ExpressionPropertyValue<boolean>, steps?: Dialog[]) {
        super();
        if (condition) { this.condition = new ExpressionProperty(condition) }
        if (Array.isArray(steps)) { this.steps = steps }
    }

    protected onComputeID(): string {
        const label = this.condition ? this.condition.toString() : '';
        return `if[${this.hashedLabel(label)}]`;
    }

    public configure(config: IfConditionConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch(key) {
                    case 'condition':
                        this.condition = new ExpressionProperty(value);
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
        return this.steps.concat(this.elseSteps);
    }

    public else(steps: Dialog[]): this {
        this.elseSteps = steps;
        return this;
    }

    protected async onRunCommand(sequence: SequenceContext, options: object): Promise<DialogTurnResult> {
        // Ensure planning context and condition
        if (!(sequence instanceof SequenceContext)) { throw new Error(`${this.id}: should only be used within an AdaptiveDialog.`) }
        if (!this.condition) { throw new Error(`${this.id}: no conditional expression specified.`) }

        // Evaluate expression
        const memory = sequence.state.toJSON();
        const value = this.condition.evaluate(this.id, memory);

        // Check for truthy returned value
        const triggered = value ? this.steps : this.elseSteps;

        // Queue up steps that should run after current step
        if (triggered.length > 0) {
            const steps = triggered.map((step) => {
                return {
                    dialogStack: [],
                    dialogId: step.id,
                    options: options
                } as StepState
            });
            await sequence.queueChanges({ changeType: StepChangeType.insertSteps, steps: steps });
        } 

        return await sequence.endDialog();
    }
}
