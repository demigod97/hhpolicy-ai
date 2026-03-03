# Agent Skills Setup Guide for Any Project

This guide is a reusable playbook for installing and documenting cross-agent skills in any repository.

## Outcome

After following this guide, the project has:

- a mirrored skill catalog for Claude, OpenCode, and Codex
- tracked skill roots in git
- category-based invocation docs under `docs/skills/`
- a rollout manifest under `docs/framework/`

## 1) Prepare Skill Roots

Create or confirm these directories:

- `.claude/skills`
- `.agents/skills`
- `.opencode/skills`
- `.codex/skills`

Preserve any existing project-specific commands, agents, or BMAD skills.

## 2) Install Baseline Catalog (Tier 1 + Tier 2)

Use curated sources:

- `VoltAgent/awesome-agent-skills`
- `travisvn/awesome-claude-skills`

Install baseline skills into all four roots so each runtime can operate independently.

## 3) Add Stack-Specific Skills

Select extra skills based on project stack and workflows. Examples:

- Supabase: `supabase-postgres-best-practices`
- n8n: `n8n-workflow-patterns`, `n8n-node-configuration`, `n8n-expression-syntax`, `n8n-validation-expert`, `n8n-mcp-tools-expert`, `n8n-code-javascript`, `n8n-code-python`

Use repo architecture, infra docs, and workflow files to decide what to include.

## 4) Update `.gitignore` for Versioned Skills

Ensure skill roots are tracked while keeping local-only clutter ignored.

Recommended pattern:

```gitignore
.claude/*
!.claude/skills/
!.claude/skills/**

.codex/*
!.codex/skills/
!.codex/skills/**

.opencode/*
!.opencode/skills/
!.opencode/skills/**
```

If the repo already tracks `.claude/commands` or `.opencode/command`, keep those explicitly unignored.

## 5) Add Invocation Documentation

Create category docs under `docs/skills/` and keep prompts reproducible with `@docs/...` references.

Recommended categories:

1. document-office
2. testing-quality
3. frontend-ui
4. backend-api-data
5. security-analysis
6. planning-execution
7. git-review-pr
8. context-memory
9. prompt-security-suite
10. skill-authoring
11. stack-specific (optional; e.g. supabase-n8n)

## 6) Add Rollout Manifest

Create `docs/framework/skills-tier1-tier2-rollout.md` including:

- install targets
- source catalogs
- installed Tier 1 list
- installed Tier 2 list
- project-specific additions
- preservation notes (existing BMAD/commands)

## 7) Validate Before Commit

Run checks:

- directory existence and expected skill counts
- docs references resolve to real files
- `.gitignore` behavior allows skill roots and blocks local-only files
- `git status` confirms scoped, intentional changes

## 8) Commit Strategy

Use one scoped commit for the rollout. Suggested message pattern:

- `feat(skills): install cross-agent catalog and stack-specific extensions`

If rollout is large, separate into two commits:

1. skill files and gitignore
2. docs and manifests
