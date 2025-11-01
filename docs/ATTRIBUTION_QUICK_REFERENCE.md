# Attribution Quick Reference

A quick guide for contributors on how to properly attribute external code and inspirations.

---

## Decision Tree: Do I Need to Attribute?

```
Did you write 100% original code with no external inspiration?
├─ YES → No attribution needed (just sign CLA)
└─ NO → Continue...

Did you copy/adapt code from another source?
├─ YES → ⚠️ REQUIRED: Inline comment + check license + update ACKNOWLEDGMENTS.md
└─ NO → Continue...

Were you inspired by another project's design/architecture?
├─ YES → ⚠️ REQUIRED: Add to ACKNOWLEDGMENTS.md, consider inline comment
└─ NO → Continue...

Did you learn a technique from documentation/tutorial?
├─ YES → ℹ️ OPTIONAL: Mention in ACKNOWLEDGMENTS.md (best practice)
└─ NO → You're good!
```

---

## Quick Templates

### 1. Direct Code Adaptation (REQUIRED)

```typescript
/**
 * Adapted from: [Project Name] (https://github.com/user/repo)
 * Original License: MIT
 * Changes: Brief description of modifications
 */
export function myFunction() {
    // Your code
}
```

### 2. Design Inspiration (RECOMMENDED)

```typescript
/**
 * Implementation inspired by [Project]'s approach to [feature]
 * See: https://github.com/user/repo/path/to/file
 */
export class MyClass {
    // Your implementation
}
```

### 3. Algorithm Reference (OPTIONAL BUT NICE)

```typescript
// Algorithm based on: https://stackoverflow.com/questions/123456
function efficientSort() {
    // Your implementation
}
```

---

## License Compatibility Cheat Sheet

> [!NOTE]
> The list below is not exhaustive, use it as a reference only. You are ultimately responsible for verifying license compliance.

| Source License                  | Can Use? | Notes                                  |
| ------------------------------- | -------- | -------------------------------------- |
| MIT                             | ✅ YES   | Fully compatible                       |
| Apache-2.0                      | ✅ YES   | Fully compatible, preserve notices     |
| BSD (2/3)                       | ✅ YES   | Fully compatible                       |
| ISC                             | ✅ YES   | Fully compatible                       |
| CC0                             | ✅ YES   | Public domain                          |
| MPL                             | ⚠️ ASK   | File-level copyleft, get approval      |
| GPL/LGPL/AGPL                   | ❌ NO    | Copyleft - not compatible              |
| SSPL                            | ❌ NO    | Server-side copyleft, not OSI-approved |
| FSL (Functional Source License) | ❌ NO    | Time-delayed commercial restriction    |
| BSL (Business Source License)   | ❌ NO    | Time-delayed commercial restriction    |
| Fair Source                     | ❌ NO    | User limit restrictions                |
| Fair Code                       | ❌ NO    | Commercial use restrictions            |
| Elastic License                 | ❌ NO    | Commercial/SaaS restrictions           |
| Commons Clause                  | ❌ NO    | Commercial sale prohibition            |
| CC BY-NC (Non-Commercial)       | ❌ NO    | Non-commercial restriction             |
| "All Rights Reserved"           | ❌ NO    | Proprietary                            |
| No license                      | ❌ NO    | Unclear ownership                      |

---

## Where to Document

| Type                   | Inline Comment | ACKNOWLEDGMENTS.md | PR Template   |
| ---------------------- | -------------- | ------------------ | ------------- |
| Direct code copy/adapt | ✅ REQUIRED    | ✅ If significant  | ✅ REQUIRED   |
| Design inspiration     | ⚠️ Recommended | ✅ REQUIRED        | ✅ REQUIRED   |
| npm dependency         | ❌ Not needed  | ✅ If major        | ❌ Not needed |
| Tutorial/docs learning | ❌ Not needed  | ⚠️ Nice to have    | ❌ Not needed |

---

## Common Scenarios

### Scenario: Found code on Stack Overflow

**Action**:

```typescript
// Solution adapted from: https://stackoverflow.com/a/123456/username
// License: CC BY-SA 4.0 (Stack Overflow default)
```

**Note**: Stack Overflow code is CC BY-SA, which requires attribution. Small snippets usually OK under fair use.

---

### Scenario: Learned pattern from another Zero project

**Action**:

```typescript
/**
 * Change source pattern inspired by @rocicorp/zero documentation
 * See: https://zero.rocicorp.dev/docs/change-sources
 */
```

**Plus**: Add to ACKNOWLEDGMENTS.md if it's a significant pattern.

---

### Scenario: Using official library examples

**Action**: Usually no attribution needed (examples meant to be copied), but nice to add:

```typescript
// Based on example from: https://docs.example.com/guide
```

---

### Scenario: Rocket.Chat-style architecture (like zrocket)

**Action**:

- ✅ Add to ACKNOWLEDGMENTS.md under "Inspirational Sources"
- ✅ Mention in PR description
- ✅ Add comment in key files:

```typescript
/**
 * Entity schema inspired by Rocket.Chat's domain model
 * This is an independent implementation adapted for Zero
 */
```

---

## Red Flags 🚩

Stop and ask for guidance if:

- ❌ Source code has no license
- ❌ License says "no commercial use"
- ❌ License says "no derivatives"
- ❌ You're not sure who owns the code
- ❌ Code is from your employer's private repo
- ❌ License is GPL/AGPL/LGPL
- ❌ You copied more than a few lines without permission

---

## CLA Quick Sign

**First-time contributors** - paste this in your first PR:

```
I have read and agree to the Contributor License Agreement as outlined in CONTRIBUTING.md.
I certify that my contributions are my original work and I have the right to submit them under the MIT License.
I grant cbnsndwch LLC the rights specified in the CLA.

Full Name: [Your Name]
GitHub Username: @[username]
Date: [YYYY-MM-DD]
```

---

## Questions?

- 📖 **Full Guide**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- 📋 **Detailed Attributions**: [ACKNOWLEDGMENTS.md](../ACKNOWLEDGMENTS.md)
- 💬 **Ask**: GitHub Discussions or Discord @cbnsndwch
- ⚖️ **Legal**: <oss@cbnsndwch.com>

---

## Remember

> **When in doubt, attribute.** Over-attribution is always better than under-attribution.

It shows respect for others' work and protects everyone involved.
