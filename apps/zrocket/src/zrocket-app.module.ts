import { Module } from '@nestjs/common';

import zrocketImports from './features/index.js';

@Module({ imports: zrocketImports })
export class ZRocketAppModule {}
