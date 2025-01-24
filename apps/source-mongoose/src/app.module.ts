import { Module } from '@nestjs/common';

import features from './features/index.js';

@Module({ imports: features })
export class AppModule {}
