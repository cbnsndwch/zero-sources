import { Test, TestingModule } from '@nestjs/testing';

import { HelloService } from '../services/hello.service';

import { HelloController } from './hello.controller';

describe('HelloController', () => {
    let appController: HelloController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [HelloController],
            providers: [HelloService]
        }).compile();

        appController = app.get<HelloController>(HelloController);
    });

    describe('root', () => {
        it('should return "Hello World!"', () => {
            expect(appController.getHello()).toBe('Hello World!');
        });
    });
});
