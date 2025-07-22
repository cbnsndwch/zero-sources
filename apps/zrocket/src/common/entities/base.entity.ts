import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { IEntityBase } from '@cbnsndwch/zchat-contracts';

export abstract class EntityBase
    extends Document<string>
    implements IEntityBase
{
    @Prop({ type: Date, default: () => new Date() })
    updatedAt!: Date;
}
