import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Type } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

import { ZeroTableSchema } from '@cbnsndwch/zero-nest-mongoose';

import { Moves, MovesSchema } from './move.entity';
import { Stats, StatsSchema } from './stats.entity';
import { Damage, DamageSchema } from './damage.entities';
import { Misc, MiscSchema } from './misc.entity';

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

    @Prop({ type: [String] })
    @IsArray()
    type!: string[];

    @Prop({ type: StatsSchema, required: true })
    @Type(() => Stats)
    stats!: Stats;

    @Prop({ type: MovesSchema })
    @Type(() => Moves)
    moves!: Moves;

    @Prop({ type: DamageSchema })
    @Type(() => Damage)
    damages!: Damage;

    @Prop({ type: MiscSchema })
    @Type(() => Misc)
    misc!: Misc;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);

export const pokemonZeroSchema = ZeroTableSchema.createForClass(Pokemon) ;

// Indices
// PokemonSchema.index({ created: 1 }, { name: 'idx_issue__created' });
// PokemonSchema.index({ modified: 1 }, { name: 'idx_issue__modified' });
// PokemonSchema.index({ modified: 1 }, { name: 'idx_issue__labels' });
// PokemonSchema.index({ open: 1, modified: 1 }, { name: 'idx_issue__open_modified' });
