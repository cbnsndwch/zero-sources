import { Logger, type FactoryProvider } from '@nestjs/common';
import type { ModelDefinition } from '@nestjs/mongoose';

import { invariant } from '@cbnsndwch/zero-nest-mongoose';

export const TOKEN_PUBLISHED_COLLECTIONS = Symbol.for('PUBLISHED_COLLECTIONS');

const logger = new Logger('PublishedCollectionsProvider');

export function providePublishedCollections(models: ModelDefinition[]): FactoryProvider<string[]> {
    return {
        provide: TOKEN_PUBLISHED_COLLECTIONS,
        useFactory() {
            const collectionNames = models
                .map(e => {
                    if (e.collection) {
                        return e.collection;
                    }

                    logger.warn(
                        `ModelDefinition for entity ${e.name} does not have a collection name, please provide one. Collection data will not be replicated.`
                    );
                    return '';
                })
                .filter(Boolean);

            invariant(
                collectionNames.length > 0,
                'No published collections found. Did you forget to provide map your entities?'
            );

            return collectionNames;
        }
    };
}
