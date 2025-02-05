import { v0 } from '@rocicorp/zero/change-protocol/v0';

export type ChangeStreamMessage = v0.ChangeStreamMessage;

export type WithWatermark<T> = { data: T; watermark: string };
