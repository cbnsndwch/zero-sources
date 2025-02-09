import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    HttpStatus,
    HttpException,
    UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { IUser } from '../contracts/index.js';
import { User } from '../entities/user.entity.js';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../models/user.models.js';

@ApiTags('users')
@Controller('users')
// @UseGuards(JwtAuthGuard)
export class UserController {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async create(@Body() input: CreateUserDto): Promise<User> {
        try {
            const now = new Date();
            const user = new this.userModel({
                ...input,
                createdAt: now,
                updatedAt: now
            } satisfies Omit<IUser, '_id'>);
            return await user.save();
        } catch (err: any) {
            throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Return all users' })
    async findAll(@Query() query: UserQueryDto): Promise<User[]> {
        const { limit = 10, skip = 0, active, role } = query;
        const filter: any = {};

        if (typeof active === 'boolean') {
            filter.active = active;
        }

        if (role) {
            filter.roles = role;
        }

        return this.userModel.find(filter).limit(limit).skip(skip).exec();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a user by id' })
    @ApiResponse({ status: 200, description: 'Return the user' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findOne(@Param('id') id: string): Promise<User> {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a user' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .exec();
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async remove(@Param('id') id: string): Promise<User> {
        const user = await this.userModel.findByIdAndDelete(id).exec();
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
    }

    @Get('username/:username')
    @ApiOperation({ summary: 'Get a user by username' })
    @ApiResponse({ status: 200, description: 'Return the user' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findByUsername(@Param('username') username: string): Promise<User> {
        const user = await this.userModel.findOne({ username }).exec();
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
    }

    @Put(':id/status')
    @ApiOperation({ summary: 'Update user status' })
    @ApiResponse({ status: 200, description: 'Status updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async updateStatus(@Param('id') id: string, @Body('status') status: string): Promise<User> {
        const user = await this.userModel
            .findByIdAndUpdate(
                id,
                { status, statusText: '', presenceStatus: status },
                { new: true }
            )
            .exec();
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
    }
}
