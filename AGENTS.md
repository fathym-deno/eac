---
FrontmatterVersion: 1
DocumentType: Guide
Title: EaC Core Agents Guide
Summary: Guardrails for collaborating on the core Everything-as-Code library.
Created: 2025-11-20
Updated: 2025-11-20
Owners:
  - fathym
References:
  - Label: Project README
    Path: ./README.md
  - Label: Project GUIDE
    Path: ./GUIDE.md
  - Label: EaC Sub-Area README
    Path: ../README.md
  - Label: EaC Sub-Area AGENTS
    Path: ../AGENTS.md
  - Label: EaC Sub-Area GUIDE
    Path: ../GUIDE.md
  - Label: Projects AGENTS
    Path: ../../AGENTS.md
  - Label: Workspace AGENTS
    Path: ../../../AGENTS.md
---

# AGENTS: EaC Core

Guardrails for work on the core Everything-as-Code types and actuators.

## Core Guardrails

1. **Stay scoped.** Keep work under `projects/everything-as-code/eac/` unless coordinating with another pod; link cross-pod dependencies.
2. **Frontmatter required.** All docs include frontmatter and relative references up to parent guides.
3. **API stability.** Avoid breaking shared types/actuators silently; document changes that affect downstream EaC packages and micro-frameworks.
4. **Provenance.** Capture upstream sources, release channels, and version pins in `UPSTREAM.md` when publishing; prefer upstream-first fixes before diverging.
5. **Security & hygiene.** Keep secrets out of tests/docs; ensure build/test tasks remain reproducible.

## Communication

- Declare intent before editing; summarize outcomes and next steps in the project README or a short log.
- Link consumer pods when behavior changes to keep dependencies aligned.
