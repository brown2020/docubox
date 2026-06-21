# Orchestration Plan

## Mode Selection

- Repo: /Users/stephenbrown/Code/OPENSOURCE/docubox
- Branch: dev
- Work mode: full
- Run folder: /Users/stephenbrown/Code/OPENSOURCE/docubox/agent-runs/2026-06-20-codebase-pass
- Verifiable gates: Git remote read, fast-forward sync, dry-run push, `npm run lint`, `npm run build`, source search evidence, `git diff --check`
- Human-decision blockers: product roadmap changes, shared/team data model decisions, risky major dependency migrations, unavailable credentials/services
- Resume policy: resume from `run-state.md`, `task-queue.md`, and Git state; push any validated local phase commit before new edits

## Loop Plan

| Phase | Loop | Verify Gate | Stop Condition |
| --- | --- | --- | --- |
| Preflight and Repo Docs | Orchestration Planning Loop, Docs Sweep Loop | Docs match current repo and checks pass | Plan, state, queue, docs, and report pushed |
| Baseline Validation | Baseline Validation Loop, Quality Gate Selection Loop | Lint/build pass or failures are classified | Baseline report pushed |
| Findings Backlog | Findings Queue Loop, Architecture Fitness Loop, Lean Code Loop | Evidence-backed backlog and scorecard | Backlog, scorecard, and queue are pushed |
| Execute Fixes and Improvements | Task Queue Loop, Fix Validation Loop, Lean Code Loop | Targeted checks and lint pass for each batch | Confirmed bugs/high-confidence cleanup fixed or deferred |
| Package and Dead-Code Cleanup | Package Cleanup Loop, Dead Code Loop | Safe dependency/dead-code changes verified | Cleanup report pushed |
| Review | Judge Loop | No actionable P0/P1 or introduced regressions | Review report pushed |
| Stabilization Loop | Stabilization Loop, Judge Loop | Completion criteria pass or blocker recorded | Stabilization report pushed |
| Integrator | Final Completion Gate | Clean tree, synced branch, final gates recorded | Final report pushed |

## File Ownership

| Task | Owned Files | Notes |
| --- | --- | --- |
| T-001 | AGENTS.md, spec.md, 00-orchestration-plan.md, run-state.md, task-queue.md, 01-preflight-and-repo-docs.md | Startup planning, guidance, and docs evidence |
| T-002 | 02-baseline-validation.md, task-queue.md, run-state.md | Baseline lint/build classification |
| T-003 | 03-findings-backlog.md, task-queue.md, run-state.md | Findings and architecture scorecard |
| T-004 | Source files named by findings, 04-execute-fixes-and-improvements.md, task-queue.md, run-state.md | Small verified bug/cleanup batches |
| T-005 | package.json, package-lock.json, source files with dead-code proof, 05-package-and-dead-code-cleanup.md | Safe dependency and dead-code cleanup |
| T-006 | 06-review.md, task-queue.md, run-state.md | Judge review |
| T-007 | Source/report files named by stabilization findings, 07-stabilization-loop.md | Stabilization |
| T-008 | final-report.md, 08-integrator.md, run-state.md | Final integration |
