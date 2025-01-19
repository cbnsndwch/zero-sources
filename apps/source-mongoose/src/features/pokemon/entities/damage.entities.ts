import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsString, IsOptional, IsNumber } from 'class-validator';

@Schema({ _id: false })
export class Damage {
    @Prop({ type: Number })
    @IsNumber()
    normal!: number;

    @Prop({ type: Number })
    @IsNumber()
    fire!: number;

    @Prop({ type: Number })
    @IsNumber()
    water!: number;

    @Prop({ type: Number })
    @IsNumber()
    electric!: number;

    @Prop({ type: Number })
    @IsNumber()
    grass!: number;

    @Prop({ type: Number })
    @IsNumber()
    ice!: number;

    @Prop({ type: Number })
    @IsNumber()
    fight!: number;

    @Prop({ type: Number })
    @IsNumber()
    poison!: number;

    @Prop({ type: Number })
    @IsNumber()
    ground!: number;

    @Prop({ type: Number })
    @IsNumber()
    flying!: number;

    @Prop({ type: Number })
    @IsNumber()
    psychic!: number;

    @Prop({ type: Number })
    @IsNumber()
    bug!: number;

    @Prop({ type: Number })
    @IsNumber()
    rock!: number;

    @Prop({ type: Number })
    @IsNumber()
    ghost!: number;

    @Prop({ type: Number })
    @IsNumber()
    dragon!: number;

    @Prop({ type: Number })
    @IsNumber()
    dark!: number;

    @Prop({ type: Number })
    @IsNumber()
    steel!: number;
}

export const DamageSchema = SchemaFactory.createForClass(Damage);
