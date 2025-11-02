---
title: 'truncateBytes() function'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [truncateBytes](./zero-contracts.truncatebytes.md)

## truncateBytes() function

Truncates a UTF-8 encoded string to a specified maximum number of bytes. Ensures that the truncation does not cut off a multibyte character.

**Signature:**

```typescript
declare function truncateBytes(msg: string, maxBytes?: number): string;
```

## Parameters

<table><thead><tr><th>

Parameter

</th><th>

Type

</th><th>

Description

</th></tr></thead>
<tbody><tr><td>

msg

</td><td>

string

</td><td>

The string to be truncated.

</td></tr>
<tr><td>

maxBytes

</td><td>

number

</td><td>

_(Optional)_ The maximum number of bytes the truncated string should have. Defaults to 123.

</td></tr>
</tbody></table>

**Returns:**

string

The truncated string if its byte length exceeds the specified limit, otherwise the original string.

## Exceptions

Will throw an error if `msg` is not a string or `maxBytes` is not a number or is less than 1.
