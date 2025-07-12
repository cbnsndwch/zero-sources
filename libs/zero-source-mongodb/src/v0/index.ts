import { ChangesGatewayV0 } from './changes-v0.gateway.js';
import { ChangeMakerV0 } from './change-maker-v0.js';
import { DiscriminatedChangeMakerV0 } from './discriminated-change-maker-v0.js';
import { DiscriminatedTableService } from './discriminated-table.service.js';

export * from './change-source-v0.js';
export * from './discriminated-change-maker-v0.js';
export * from './discriminated-table.service.js';

export const v0ChangeSourceServices = [
    ChangesGatewayV0, 
    ChangeMakerV0, 
    DiscriminatedChangeMakerV0,
    DiscriminatedTableService
];
