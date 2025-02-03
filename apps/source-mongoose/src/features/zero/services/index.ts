import { ChangeMakerV0 } from './change-maker-v0.js';
import { WatermarkService, changeSequenceKvProvider } from './watermark.service.js';

export * from './change-source-v0.js';
export * from './watermark.service.js';

export const zeroServices = [ChangeMakerV0, WatermarkService, changeSequenceKvProvider];
