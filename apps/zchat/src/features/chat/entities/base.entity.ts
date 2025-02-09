import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import type { IEntityBase } from '../contracts/base.contracts.js';

export abstract class EntityBase extends Document<string> implements IEntityBase {
    @Prop({ type: Date, default: Date.now })
    updatedAt!: Date;
}
