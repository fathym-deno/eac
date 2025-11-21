---
FrontmatterVersion: 1
DocumentType: Guide
Title: EaC Core Guide
Summary: Playbook for maintaining the core Everything-as-Code types and actuators.
Created: 2025-11-20
Updated: 2025-11-20
Owners:
  - fathym
References:
  - Label: Project README
    Path: ./README.md
  - Label: Project AGENTS
    Path: ./AGENTS.md
  - Label: EaC Sub-Area README
    Path: ../README.md
  - Label: EaC Sub-Area GUIDE
    Path: ../GUIDE.md
  - Label: Workspace GUIDE
    Path: ../../../WORKSPACE_GUIDE.md
---

# EaC Core Guide

Steps for keeping the core EaC types and actuators predictable and stable.

## Current Focus

- Maintain shared EaC primitives (details, metadata, diffing, actuators) used across other EaC packages.
- Document any cross-package contracts and expectations for downstream consumers.
- Capture provenance and release channels before publishing updates.

## Workflow

1. **Align scope** in [`README.md`](./README.md): clarify intended change (types update, actuator change, release prep) and note target repo/branch if code moves.
2. **Design & docs**: capture contract changes in `docs/` (create if needed) with frontmatter and links to upstream assumptions.
3. **Capture provenance**: record upstream source, release channel, and version pins in `UPSTREAM.md` once publishing to jsr/npm.
4. **Validate behavior**: run `deno task test`; use `deno task build` and `deno task publish:check` before releases; add/update examples when types change.
5. **Communicate changes**: document breaking changes with migration guidance and notify dependents (other EaC packages, micro-frameworks).

## Verification

- Ensure links stay relative and parent guides remain discoverable.
- Keep the roster entry in `../README.md` current when docs or status change.
- When workspace tasks exist, also run: `deno task prompts:verify-frontmatter`, `deno task link:verify`, `deno task workspace:check`.
