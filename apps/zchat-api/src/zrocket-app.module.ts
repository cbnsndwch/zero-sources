import { Module } from '@nestjs/common';

import zrocketImports from './features/zrocket-index.js';

@Module({ imports: zrocketImports })
export class ZRocketAppModule {}