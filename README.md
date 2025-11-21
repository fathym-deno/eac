---
FrontmatterVersion: 1
DocumentType: Guide
Title: Fathym Everything-as-Code Core
Summary: Core Everything-as-Code data model, actuators, and metadata primitives.
Created: 2025-11-20
Updated: 2025-11-20
Owners:
  - fathym
References:
  - Label: EaC Sub-Area README
    Path: ../README.md
  - Label: EaC Sub-Area AGENTS
    Path: ../AGENTS.md
  - Label: EaC Sub-Area GUIDE
    Path: ../GUIDE.md
  - Label: Projects README
    Path: ../../README.md
  - Label: Projects AGENTS
    Path: ../../AGENTS.md
  - Label: Projects GUIDE
    Path: ../../GUIDE.md
  - Label: Workspace README
    Path: ../../../README.md
  - Label: Workspace AGENTS
    Path: ../../../AGENTS.md
  - Label: Workspace GUIDE
    Path: ../../../WORKSPACE_GUIDE.md
---

# Fathym Everything-as-Code Core

Core Everything-as-Code (EaC) library providing shared types, metadata, and
actuator hooks used by the rest of the EaC ecosystem.

- **Goal:** define stable EaC primitives (details, diffing, module actuators,
  metadata, user records) that other EaC packages compose.
- **Outputs:** shared TypeScript types/interfaces, actuators, and utilities
  exported via `src/eac/.exports.ts`.
- **Code location:** this folder hosts the source.

## Current Status

- Core types and actuators live under `src/eac/`.
- Tasks: `deno task test`, `deno task build`, `deno task publish:check`,
  `deno task deploy`, `deno task version`.
- Licensing: MIT (non-commercial) with commercial option; see
  `LICENSE`/`COMMERCIAL_LICENSE.md`.

## How to Work in This Pod

1. Read the parent EaC Instruction Docs plus this project’s forthcoming `AGENTS`
   and `GUIDE`.
2. Declare intent before editing; summarize outcomes and open questions in this
   README or a short log.
3. Capture provenance and release channels in `UPSTREAM.md` once publishing to
   jsr/npm or other registries.
4. Keep links relative; reference implementation repos/branches if code moves.
5. Record prompts/scripts used for design or automation in doc references.
