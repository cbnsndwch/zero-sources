import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsString, IsOptional, IsArray } from 'class-validator';

@Schema({ _id: false })
export class Move {
    @Prop({ default: '' })
    @IsString()
    @IsOptional()
    learnedAt!: string;

    @Prop({ required: true })
    @IsString()
    name!: string;

    @Prop({ required: true })
    @IsString()
    gen!: string;
}

export const MoveSchema = SchemaFactory.createForClass(Move);

@Schema({ _id: false })
export class Gen34Move {
    @Prop({ required: true })
    @IsString()
    name!: string;

    @Prop({ required: true })
    @IsString()
    method!: string;
}

export const Gen34MoveSchema = SchemaFactory.createForClass(Gen34Move);

@Schema({ _id: false })
export class Moves {
    @Prop({ type: [Move], required: true, default: [] })
    @IsArray({ each: true })
    level!: Move[];

    @Prop({ type: [Move], required: true, default: [] })
    @IsArray({ each: true })
    tmhm!: Move[];

    @Prop({ type: [Move], required: true, default: [] })
    @IsArray({ each: true })
    egg!: Move[];

    @Prop({ type: [Move], required: true, default: [] })
    @IsArray({ each: true })
    tutor!: Move[];

    @Prop({ type: [Gen34Move], required: true, default: [] })
    @IsArray({ each: true })
    gen34!: Gen34Move[];
}

export const MovesSchema = SchemaFactory.createForClass(Moves);
