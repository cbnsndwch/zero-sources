# MySQL-TS Command Processing Pipeline Refactor: Action Plan

This document tracks the concrete steps for simplifying and modernizing the command processing pipeline, especially around `Connection::handlePacket`, to improve maintainability and TypeScript compatibility.

---

## Phase 1: Extract Single-Responsibility Helpers

- [ ] **SequenceManager**: Centralize all sequence ID validation, bumping, and resetting logic.
- [ ] **PauseBuffer**: Move packet pause/resume and queuing logic out of `Connection`.
- [ ] **PacketDispatcher**: Route packets to the correct command, decoupling dispatch from connection logic.
- [ ] **ErrorChannel**: Centralize all error handling, cleanup, and event emission.
- [ ] Add unit tests for each helper.

## Phase 2: Centralize and Standardize Error Handling

- [ ] Refactor all protocol, fatal, and network error exits to use `ErrorChannel`.
- [ ] Ensure all cleanup (timeouts, socket closure, event emission) is handled in one place.
- [ ] Remove duplicated error handling logic from `Connection` and commands.

## Phase 3: Refactor Dispatcher and Command Queue

- [ ] Move command queue and packet dispatch logic out of `Connection`.
- [ ] Ensure `Connection` only forwards packets to the dispatcher.
- [ ] Add tests for dispatcher behavior and command queueing.

## Phase 4: Typed State Machines for Commands

- [ ] Refactor command state machines to use enums and explicit handler functions.
- [ ] Remove dynamic property access and prototype pointer swapping (`this.next`).
- [ ] Ensure all state transitions are explicit and type-safe.
- [ ] Add tests for command state transitions.

## Phase 5: Improve Packet Typing

- [ ] Replace magic numbers with TypeScript enums and discriminated unions for packet types.
- [ ] Refactor all packet type checks to use enums/constants.
- [ ] Make packet handling exhaustive and type-safe.
- [ ] Add tests for packet type detection and handling.

---

## General Guidelines

- Each phase can be shipped incrementally and guarded by feature flags if needed.
- Add/expand unit tests for all new helpers and refactored logic.
- Document interfaces and responsibilities for each new helper.
- Ensure backwards compatibility during migration.

---

**Benefits:**
- Smaller, more maintainable `Connection` class
- TypeScript can catch unreachable code, missing states, and wrong packet types
- Helpers are easier to test in isolation
- Clear separation of concerns for future contributors

---

_Last updated: 2025-05-29_