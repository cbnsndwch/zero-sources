import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { userControllers } from './controllers/index.js';
import { userModelDefinition } from './entities/index.js';
import { userServices } from './services/index.js';

@Global()
@Module({
    imports: [MongooseModule.forFeature([userModelDefinition])],
    controllers: [...userControllers],
    providers: [...userServices],
    exports: [...userServices]
})
export class UsersModule {}
