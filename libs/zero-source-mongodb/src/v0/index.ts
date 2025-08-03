import { ChangesGatewayV0 } from './changes-v0.gateway.js';
import { ChangeMakerV0 } from './change-maker-v0.js';
import { TableMappingService } from './table-mapping.service.js';

export * from './change-source-v0.js';
export * from './table-mapping.service.js';

export const v0ChangeSourceServices = [
    ChangesGatewayV0,
    ChangeMakerV0,
    TableMappingService
];
