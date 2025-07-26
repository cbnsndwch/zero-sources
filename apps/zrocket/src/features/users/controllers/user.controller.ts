import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    HttpStatus,
    HttpException,
    NotFoundException,
    UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { UserPresenceStatus } from '@cbnsndwch/zrocket-contracts';

import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard.js';
import { User } from '../entities/user.entity.js';
import { CreateUserInput, UpdateUserInput } from '../models/index.js';
import { UserService } from '../services/user.service.js';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
    #userService: UserService;

    constructor(userService: UserService) {
        this.#userService = userService;
    }

    //#region CRUD

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async create(@Body() input: CreateUserInput): Promise<User> {
        try {
            const user = await this.#userService.create(input);
            return await user.save();
        } catch (err) {
            throw new HttpException(
                (err as Error).message,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a user by id' })
    @ApiResponse({ status: 200, description: 'Return the user' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findOne(@Param('id') id: string): Promise<User> {
        const user = await this.#userService.findOne(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a user' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async update(
        @Param('id') id: string,
        @Body() input: UpdateUserInput
    ): Promise<User> {
        const user = await this.#userService.update(id, input);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async remove(@Param('id') id: string): Promise<User> {
        const user = await this.#userService.remove(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    //#endregion CRUD

    //#region Presence

    @Put(':id/status')
    @ApiOperation({ summary: 'Update user status' })
    @ApiResponse({ status: 200, description: 'Status updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async updatePresence(
        @Param('id') id: string,
        @Body('presence') presenceStatus: UserPresenceStatus
    ): Promise<User> {
        const user = await this.#userService.updatePresence(id, presenceStatus);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    //#endregion Presence
}
