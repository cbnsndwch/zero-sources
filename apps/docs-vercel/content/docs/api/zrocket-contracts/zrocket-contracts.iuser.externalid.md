---
title: 'IUser.externalId property'
---

[Home](./index.md) &gt; [@cbnsndwch/zrocket-contracts](./zrocket-contracts.md) &gt; [IUser](./zrocket-contracts.iuser.md) &gt; [externalId](./zrocket-contracts.iuser.externalid.md)

## IUser.externalId property

If the user signed up using an external provider, this field contains the user's id on that provider.

The format is `<providerId>/<userId>`<!-- -->, e.g. `google/1234567890` where `google` is the provider id and `1234567890` is the user's Google Id.

**Signature:**

```typescript
externalId?: ExternalUserId;
```
