---
title: 'JwtPayload type'
---

[Home](./index.md) &gt; [@cbnsndwch/zrocket-contracts](./zrocket-contracts.md) &gt; [JwtPayload](./zrocket-contracts.jwtpayload.md)

## JwtPayload type

Claims contained in the JSON Web Token we issue to our authenticated users

**Signature:**

```typescript
type JwtPayload = {
    sub: string;
    iat?: number;
    exp?: number;
    name?: string;
    preferred_username?: string;
    email: string;
    picture?: string;
    roles?: string[];
};
```
