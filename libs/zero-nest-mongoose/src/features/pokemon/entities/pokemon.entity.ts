import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Type } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

import { ZeroTableSchema } from '@cbnsndwch/zero-nest-mongoose';

import { serializeSchema, replacer } from '../../../utils/serialization.js';

import { Moves, MovesSchema } from './move.entity.js';
import { Stats, StatsSchema } from './stats.entity.js';
import { Damage, DamageSchema } from './damage.entities.js';
import { Misc, MiscSchema } from './misc.entity.js';

@Schema({ collection: 'pokemon' })
export class Pokemon extends Document<string, any, Pokemon> {
    @IsString()
    declare id: string;

    @Prop({ required: true })
    @IsString()
    name!: string;

    @Prop({ required: true })
    @IsString()
    img!: string;

    @Prop({ type: [String], required: true })
    @IsArray()
    type!: string[];

    @Prop({ type: StatsSchema, required: true })
    @Type(() => Stats)
    stats!: Stats;

    @Prop({ type: MovesSchema, required: true })
    @Type(() => Moves)
    moves!: Moves;

    @Prop({ type: DamageSchema, required: true })
    @Type(() => Damage)
    damages!: Damage;

    @Prop({ type: MiscSchema, required: true })
    @Type(() => Misc)
    misc!: Misc;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);

const schemaJson = serializeSchema(PokemonSchema.obj);

export const pokemonZeroSchema = ZeroTableSchema.createForClass(Pokemon);

// Indices
// PokemonSchema.index({ created: 1 }, { name: 'idx_issue__created' });
// PokemonSchema.index({ modified: 1 }, { name: 'idx_issue__modified' });
// PokemonSchema.index({ modified: 1 }, { name: 'idx_issue__labels' });
// PokemonSchema.index({ open: 1, modified: 1 }, { name: 'idx_issue__open_modified' });
