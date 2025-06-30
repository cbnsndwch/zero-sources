import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString, IsBoolean, IsOptional, IsDateString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Document } from 'mongoose';

@Schema({ 
    collection: 'todos',
    timestamps: true 
})
export class Todo extends Document {
    @Prop({ required: true })
    @IsString()
    @MinLength(1, { message: 'Title cannot be empty' })
    @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
    title: string;

    @Prop({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
    description?: string;

    @Prop({ required: true, default: false })
    @IsBoolean()
    @Transform(({ value }) => Boolean(value))
    completed: boolean;

    @Prop({ required: false })
    @IsOptional()
    @IsDateString()
    dueDate?: Date;

    @Prop({ required: true, default: 'medium' })
    @IsString()
    priority: 'low' | 'medium' | 'high';

    // Timestamps (handled by Mongoose)
    createdAt: Date;
    updatedAt: Date;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);

// Add indexes for better query performance
TodoSchema.index({ completed: 1 });
TodoSchema.index({ priority: 1 });
TodoSchema.index({ dueDate: 1 });
TodoSchema.index({ createdAt: -1 });
