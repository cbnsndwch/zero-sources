import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

import { AbilitiesSchema, Abilities } from './abilities.entity';

@Schema({ _id: false })
export class Misc {
    @Prop({ type: { male: Number, female: Number } })
    sex!: { male: number; female: number };

    @Prop({ type: AbilitiesSchema })
    @Type(() => Abilities)
    abilities!: Abilities;

    @Prop()
    @IsString()
    classification!: string;

    @Prop()
    @IsString()
    height!: string;

    @Prop()
    @IsNumber()
    weight!: number;

    @Prop()
    @IsNumber()
    captureRate!: number;

    @Prop()
    @IsNumber()
    eggSteps!: number;

    @Prop()
    @IsNumber()
    expGrowth!: number;

    @Prop()
    @IsNumber()
    happiness!: number;

    @Prop({ type: [String] })
    @IsArray()
    evPoints!: string[];

    @Prop()
    @IsNumber()
    fleeFlag!: number;

    @Prop()
    @IsNumber()
    entreeForestLevel!: number;
}

export const MiscSchema = SchemaFactory.createForClass(Misc);
