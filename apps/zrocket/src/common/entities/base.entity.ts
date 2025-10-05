import { Prop, Schema } from '@nestjs/mongoose';
import { IsDate } from 'class-validator';

import type { IEntityBase } from '@cbnsndwch/zrocket-contracts';

@Schema()
export abstract class EntityBase implements IEntityBase {
    _id: string;

    @IsDate()
    @Prop({ type: Date, default: () => new Date() })
    createdAt: Date;

    @IsDate()
    @Prop({ type: Date, default: () => new Date() })
    updatedAt!: Date;
}
