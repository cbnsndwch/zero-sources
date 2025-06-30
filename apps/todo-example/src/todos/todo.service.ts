import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from '../entities/todo.entity.js';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto.js';

@Injectable()
export class TodoService {
    constructor(
        @InjectModel(Todo.name) private readonly todoModel: Model<Todo>
    ) {}

    async create(createTodoDto: CreateTodoDto): Promise<Todo> {
        const todo = new this.todoModel({
            title: createTodoDto.title,
            description: createTodoDto.description,
            completed: false,
            priority: createTodoDto.priority || 'medium',
            dueDate: createTodoDto.dueDate ? new Date(createTodoDto.dueDate) : undefined
        });
        
        return todo.save();
    }

    async findAll(): Promise<Todo[]> {
        return this.todoModel
            .find()
            .sort({ createdAt: -1 })
            .exec();
    }

    async findById(id: string): Promise<Todo> {
        const todo = await this.todoModel.findById(id).exec();
        if (!todo) {
            throw new NotFoundException(`Todo with ID ${id} not found`);
        }
        return todo;
    }

    async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
        const updateData: Partial<Todo> = {};
        
        if (updateTodoDto.title !== undefined) {
            updateData.title = updateTodoDto.title;
        }
        if (updateTodoDto.description !== undefined) {
            updateData.description = updateTodoDto.description;
        }
        if (updateTodoDto.completed !== undefined) {
            updateData.completed = updateTodoDto.completed;
        }
        if (updateTodoDto.priority !== undefined) {
            updateData.priority = updateTodoDto.priority;
        }
        if (updateTodoDto.dueDate !== undefined) {
            updateData.dueDate = new Date(updateTodoDto.dueDate);
        }

        const todo = await this.todoModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
            
        if (!todo) {
            throw new NotFoundException(`Todo with ID ${id} not found`);
        }
        
        return todo;
    }

    async delete(id: string): Promise<void> {
        const result = await this.todoModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Todo with ID ${id} not found`);
        }
    }

    async toggleCompleted(id: string): Promise<Todo> {
        const todo = await this.findById(id);
        return this.update(id, { completed: !todo.completed });
    }

    async findByStatus(completed: boolean): Promise<Todo[]> {
        return this.todoModel
            .find({ completed })
            .sort({ createdAt: -1 })
            .exec();
    }

    async findByPriority(priority: 'low' | 'medium' | 'high'): Promise<Todo[]> {
        return this.todoModel
            .find({ priority })
            .sort({ createdAt: -1 })
            .exec();
    }
}
