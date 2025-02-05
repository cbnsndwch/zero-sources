import { natsKvBucketProvider } from './nats-kv-bucket.provider.js';
import { natsKvWatermarkServiceProvider } from './nats-watermark-service.provider.js';

export const natsKvWatermarkProviders = [natsKvBucketProvider, natsKvWatermarkServiceProvider];
