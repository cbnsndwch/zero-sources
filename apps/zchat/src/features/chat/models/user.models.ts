import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { USER_STATUSES, type UserStatus } from '../contracts/index.js';

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    type!: string;

    @ApiProperty()
    @IsArray()
    roles!: string[];

    @ApiProperty()
    @IsBoolean()
    active!: boolean;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    username?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsEnum(USER_STATUSES)
    @IsOptional()
    status?: UserStatus;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UserQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    skip?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    active?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    role?: string;
}
