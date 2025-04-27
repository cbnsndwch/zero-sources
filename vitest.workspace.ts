import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./libs/zero-watermark-zqlite/vitest.config.ts",
  "./libs/zero-contracts/vitest.config.ts",
  "./libs/zero-source-mongodb/vitest.config.ts",
  "./libs/zero-watermark-nats-kv/vitest.config.ts",
  "./libs/zchat-contracts/vitest.config.ts",
  "./libs/zero-nest-mongoose/vitest.config.ts"
])
