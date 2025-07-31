import { Module } from '@nestjs/common';

import imports from './features/index.js';

@Module({ imports })
export class ZRocketAppModule {}
