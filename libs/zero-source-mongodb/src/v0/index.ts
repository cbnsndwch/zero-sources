import { ChangeMakerV0, TOKEN_CHANGE_MAKER_V0 } from './change-maker-v0.js';
import { ChangesGatewayV0 } from './changes-v0.gateway.js';
import {
    TOKEN_TABLE_MAPPING_SERVICE,
    TableMappingService
} from './table-mapping.service.js';

export * from './change-source-v0.js';
export * from './table-mapping.service.js';

export const v0ChangeSourceServices = [
    ChangesGatewayV0,
    {
        provide: TOKEN_CHANGE_MAKER_V0,
        useClass: ChangeMakerV0
    },
    {
        provide: TOKEN_TABLE_MAPPING_SERVICE,
        useClass: TableMappingService
    }
];
