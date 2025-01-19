import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsArray, IsOptional } from 'class-validator';

@Schema({ _id: false })
export class Abilities {
    @Prop({ type: [String] })
    @IsArray()
    @IsOptional()
    normal!: string[];

    @Prop({ type: [String] })
    @IsArray()
    @IsOptional()
    hidden!: string[];
}

export const AbilitiesSchema = SchemaFactory.createForClass(Abilities);
