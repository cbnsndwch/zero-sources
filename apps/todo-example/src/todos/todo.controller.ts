import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    ValidationPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TodoService } from './todo.service.js';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto.js';
import { Todo } from '../entities/todo.entity.js';

@ApiTags('todos')
@Controller('todos')
export class TodoController {
    constructor(private readonly todoService: TodoService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new todo' })
    @ApiResponse({ status: 201, description: 'Todo created successfully', type: Todo })
    async create(@Body(ValidationPipe) createTodoDto: CreateTodoDto): Promise<Todo> {
        return this.todoService.create(createTodoDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all todos or filter by status/priority' })
    @ApiQuery({ name: 'completed', required: false, type: Boolean })
    @ApiQuery({ name: 'priority', required: false, enum: ['low', 'medium', 'high'] })
    @ApiResponse({ status: 200, description: 'List of todos', type: [Todo] })
    async findAll(
        @Query('completed') completed?: string,
        @Query('priority') priority?: 'low' | 'medium' | 'high'
    ): Promise<Todo[]> {
        if (completed !== undefined) {
            return this.todoService.findByStatus(completed === 'true');
        }
        
        if (priority) {
            return this.todoService.findByPriority(priority);
        }
        
        return this.todoService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a todo by ID' })
    @ApiParam({ name: 'id', description: 'Todo ID' })
    @ApiResponse({ status: 200, description: 'Todo found', type: Todo })
    @ApiResponse({ status: 404, description: 'Todo not found' })
    async findOne(@Param('id') id: string): Promise<Todo> {
        return this.todoService.findById(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a todo' })
    @ApiParam({ name: 'id', description: 'Todo ID' })
    @ApiResponse({ status: 200, description: 'Todo updated successfully', type: Todo })
    @ApiResponse({ status: 404, description: 'Todo not found' })
    async update(
        @Param('id') id: string,
        @Body(ValidationPipe) updateTodoDto: UpdateTodoDto
    ): Promise<Todo> {
        return this.todoService.update(id, updateTodoDto);
    }

    @Patch(':id/toggle')
    @ApiOperation({ summary: 'Toggle todo completion status' })
    @ApiParam({ name: 'id', description: 'Todo ID' })
    @ApiResponse({ status: 200, description: 'Todo status toggled', type: Todo })
    @ApiResponse({ status: 404, description: 'Todo not found' })
    async toggleCompleted(@Param('id') id: string): Promise<Todo> {
        return this.todoService.toggleCompleted(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a todo' })
    @ApiParam({ name: 'id', description: 'Todo ID' })
    @ApiResponse({ status: 200, description: 'Todo deleted successfully' })
    @ApiResponse({ status: 404, description: 'Todo not found' })
    async delete(@Param('id') id: string): Promise<{ message: string }> {
        await this.todoService.delete(id);
        return { message: 'Todo deleted successfully' };
    }
}
