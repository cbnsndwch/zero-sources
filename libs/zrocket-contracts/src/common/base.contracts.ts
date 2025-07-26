export type IHasId = {
    _id: string;
};

export type IHasShortId = {
    id: string;
};

export type IHasUpdatedAt = {
    updatedAt: Date;
};

export type IHasCreatedAt = {
    createdAt: Date;
};

export type IHasDeletedAt = {
    updatedAt: Date;
};

export type IEntityBase = IHasId & IHasCreatedAt & IHasUpdatedAt;

export type IDeletedEntityBase = IEntityBase &
    IHasDeletedAt & {
        __collection__: string;
    };

export type IHasName = {
    name: string;
};

export type IHasUsername = {
    username: string;
};

export type HasClassName = {
    className?: string;
};
