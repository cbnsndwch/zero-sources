import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery } from 'mongoose';
import type {
    ExternalUserId,
    UserPresenceStatus
} from '@cbnsndwch/zchat-contracts';

import { User } from '../entities/index.js';
import { CreateUserInput, UpdateUserInput } from '../models/index.js';

@Injectable()
export class UserService {
    #model: Model<User>;

    constructor(@InjectModel(User.name) userModel: Model<User>) {
        this.#model = userModel;
    }

    //#region CRUD

    async create(input: CreateUserInput): Promise<User> {
        const now = new Date();
        const user = new this.#model({
            ...input,
            createdAt: now,
            updatedAt: now
        });
        return user.save();
    }

    async findAll(query: RootFilterQuery<User> = {}): Promise<User[]> {
        return this.#model.find(query).exec();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.#model.findById(id).exec();
        if (!user) {
            throw new NotFoundException(`User #${id} not found`);
        }
        return user;
    }

    async update(id: string, input: UpdateUserInput): Promise<User> {
        const user = await this.#model
            .findByIdAndUpdate(id, input, { new: true })
            .exec();

        if (!user) {
            throw new NotFoundException(`User #${id} not found`);
        }

        return user;
    }

    async remove(id: string): Promise<User> {
        const user = await this.#model.findByIdAndDelete(id).exec();

        if (!user) {
            throw new NotFoundException(`User #${id} not found`);
        }

        return user;
    }

    //#endregion CRUD

    //#region Custom Methods

    async findByUsername(username: string): Promise<User | null> {
        return this.#model.findOne({ username }).exec();
    }

    async findByExternalId(providerId: ExternalUserId): Promise<User | null> {
        return this.#model.findOne({ providerId }).exec();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.#model.findOne({ email }).exec();
    }

    async updatePresence(
        id: string,
        presenceStatus: UserPresenceStatus
    ): Promise<User> {
        const user = await this.#model
            .findByIdAndUpdate(id, { presenceStatus }, { new: true })
            .exec();

        if (!user) {
            throw new NotFoundException(`User ${id} not found`);
        }

        return user;
    }

    //#endregion Custom Methods
}
