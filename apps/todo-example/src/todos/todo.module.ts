import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo, TodoSchema } from '../entities/todo.entity.js';
import { TodoController } from './todo.controller.js';
import { TodoService } from './todo.service.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Todo.name, schema: TodoSchema }
        ])
    ],
    controllers: [TodoController],
    providers: [TodoService],
    exports: [TodoService]
})
export class TodoModule {}
