import { IsString, IsBoolean, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';

export class CreateTodoDto {
    @IsString()
    @MinLength(1, { message: 'Title cannot be empty' })
    @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
    title: string;

    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
    description?: string;

    @IsOptional()
    @IsString()
    dueDate?: string; // ISO date string

    @IsOptional()
    @IsString()
    @IsIn(['low', 'medium', 'high'])
    priority?: 'low' | 'medium' | 'high';
}

export class UpdateTodoDto {
    @IsOptional()
    @IsString()
    @MinLength(1, { message: 'Title cannot be empty' })
    @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
    description?: string;

    @IsOptional()
    @IsBoolean()
    completed?: boolean;

    @IsOptional()
    @IsString()
    dueDate?: string; // ISO date string

    @IsOptional()
    @IsString()
    @IsIn(['low', 'medium', 'high'])
    priority?: 'low' | 'medium' | 'high';
}
