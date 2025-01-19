import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsNumber } from 'class-validator';

@Schema({ _id: false })
export class Stats {
    @Prop({ required: true })
    @IsNumber()
    hp!: number;

    @Prop({ required: true })
    @IsNumber()
    attack!: number;

    @Prop({ required: true })
    @IsNumber()
    defense!: number;

    @Prop({ required: true })
    @IsNumber()
    specialAttack!: number;

    @Prop({ required: true })
    @IsNumber()
    specialDefense!: number;

    @Prop({ required: true })
    @IsNumber()
    speed!: number;
}

export const StatsSchema = SchemaFactory.createForClass(Stats);
