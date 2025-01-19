import { Module } from '@nestjs/common';

import features from './features';

@Module({ imports: features })
export class AppModule {}
