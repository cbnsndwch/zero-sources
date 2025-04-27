import { Logger } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import type { IIssue } from '../contracts/index.js';

const logger = new Logger('IssueEntity');

@Schema({
    collection: 'issue',
    timestamps: {
        createdAt: 'created',
        updatedAt: 'modified'
    }
})
export class Issue extends Document<string> implements IIssue {
    @Prop({ type: String, required: true })
    declare id: string;

    @Prop({ type: Number, required: true, default: null })
    shortID!: number | null;

    @Prop({ type: String, required: true, maxlength: 128 })
    title!: string;

    @Prop({ type: Boolean, required: true })
    open!: boolean;

    @Prop({
        type: Number,
        default: () => Date.now()
    })
    modified!: number;

    @Prop({
        type: Number,
        default: () => Date.now()
    })
    created!: number;

    @Prop({ type: String, required: true })
    creatorID!: string;

    @Prop({ type: String })
    assigneeID!: string;

    @Prop({ type: String, default: '', maxlength: 10240 })
    description!: string;

    @Prop({ type: String, required: true, default: 'public' })
    visibility!: string;

    @Prop({ type: [String], required: true, default: [] })
    labels!: string[];
}

export const IssueSchema = SchemaFactory.createForClass(Issue);

// Indices
IssueSchema.index({ created: 1 }, { name: 'idx_issue__created' });
IssueSchema.index({ modified: 1 }, { name: 'idx_issue__modified' });
IssueSchema.index({ modified: 1 }, { name: 'idx_issue__labels' });
IssueSchema.index(
    { open: 1, modified: 1 },
    { name: 'idx_issue__open_modified' }
);

// if (process.env.NODE_ENV === 'test') {
//     IssueSchema.set('autoIndex', false);
// }

logger.log('process.env.NODE_ENV: ' + process.env.NODE_ENV);
