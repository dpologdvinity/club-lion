# Multi-Agent Orchestration & Context Conservation Protocol

This document defines the official procedure for dispatching, running, and integrating tasks across multiple AI coding agents (**Antigravity**, **Claude Code**, and **Codex**) with strict **context preservation** so orchestrator context windows are never flooded with intermediate tool calls or execution transcripts.

---

## 1. Operating Roles & Sequential Lifecycle

Club Lion operates on a strict, sequential 4-role development lifecycle:

```text
[1. Orchestrator: Antigravity]
       │  • Creates isolated worktree .worktrees/<task-name>
       │  • Writes uncommitted PROMPT.md
       │  • Updates docs/TASK-TRACKER.md on master
       ▼
[2. Implementer: Claude Code]
       │  • Executes non-interactively inside worktree
       │  • Follows RED-GREEN TDD
       │  • Deletes PROMPT.md
       │  • Commits with "Implementer: claude-sonnet-5 (claude code)"
       ▼
[3. Reviewer: Codex]
       │  • Audits diff in worktree against DESIGN.md, UX-CONTRACT.md, audio rules
       │  • Resolves minor issues directly & commits, or requests fixes
       │  • Signs off on implementation
       ▼
[4. Verifier & Merger: Antigravity]
       │  • Rebases candidate worktree onto latest master
       │  • Runs full verification gate (npm run verify && npm run test:e2e)
       │  • Squashes into ONE Conventional Commit on master with full trailers
       │  • Deletes worktree and branch
       │  • Advances to next task in queue
```

---

## 2. Context Conservation Protocol (Zero-Leak Execution)

When invoking external agents via the CLI (`claude` or `codex`), running them interactively or letting them stream output directly to stdout can dump 30,000–50,000 tokens of raw tool calls, file reads, and logs into the orchestrator's context window.

To eliminate context pollution, all external agent invocations must strictly follow the **Silent Background Runner** pattern:

### A. Redirect All Raw Output to Disk
Never let stdout or stderr print to the orchestrator terminal. Redirect all streams to a task-specific log file:

```bash
# Claude implementation invocation
(cd .worktrees/<task-name> && claude --dangerously-skip-permissions -p "$(cat PROMPT.md)" > claude.log 2>&1) &

# Codex review invocation
codex exec --dangerously-bypass-approvals-and-sandbox -C .worktrees/<task-name> "<review prompt>" > .worktrees/<task-name>/codex.log 2>&1 &
```

### B. Event-Driven Wakeup
The orchestrator launches the command as a background job. The conversation context only receives a single lightweight completion event upon termination:
```text
Task finished with result: The command exited with code 0.
```

### C. State-Based Evidence Verification (Compact Tokens)
Instead of ingesting the agent's verbose log file, the orchestrator verifies the result using lightweight Git inspection:
1. **Commit Trailer Verification** (~5 lines):
   ```bash
   git -C .worktrees/<task-name> log -n 1
   ```
2. **Clean Tree Verification** (~3 lines):
   ```bash
   git -C .worktrees/<task-name> status --short
   ```
3. **Change Scope** (~5 lines):
   ```bash
   git -C .worktrees/<task-name> diff master...HEAD --stat
   ```
4. **Verification Gate** (~10 lines):
   ```bash
   git -C .worktrees/<task-name> npm run verify
   ```

*Total context cost per milestone:* **~50–100 tokens** instead of **~50,000 tokens**!

### D. Error Isolation
If and only if an agent exits with a non-zero exit code, inspect only the tail of the log:
```bash
tail -n 25 .worktrees/<task-name>/agent.log
```

---

## 3. Step-by-Step Task Execution Protocol

### Step 1: Worktree & Prompt Preparation (Orchestrator)
```bash
git worktree add .worktrees/<task-name> -b feat/<task-name> master
ln -s ../../node_modules .worktrees/<task-name>/node_modules
```
Write `.worktrees/<task-name>/PROMPT.md` specifying acceptance criteria, file targets, and TDD steps.

Update `docs/TASK-TRACKER.md` on `master` to mark the task as in-progress.

### Step 2: Implementation (Claude Code)
Summon Claude in the worktree with output redirection:
```bash
claude --dangerously-skip-permissions -p "Follow PROMPT.md strictly. Delete PROMPT.md when complete, verify with npm run verify, and commit with trailer 'Implementer: claude-sonnet-5 (claude code)'" > .worktrees/<task-name>/claude.log 2>&1
```

### Step 3: Review & Audit (Codex)
Summon Codex in the worktree with output redirection:
```bash
codex exec --dangerously-bypass-approvals-and-sandbox -C .worktrees/<task-name> "Read .codex/instructions.md and audit the latest commit in this worktree against DESIGN.md, UX-CONTRACT.md, and procedural audio rules ($0 MP3 assets). Run npm run verify. If satisfied, sign off; if minor fixes are needed, apply and commit." > .worktrees/<task-name>/codex.log 2>&1
```

### Step 4: Verification & Integration (Orchestrator)
1. Rebase worktree against latest `master`:
   ```bash
   git -C .worktrees/<task-name> rebase master
   ```
2. Run full verification suites:
   ```bash
   npm run verify
   npm run test:e2e
   ```
3. Squash merge into `master`:
   ```bash
   git checkout master
   git merge --squash feat/<task-name>
   git commit -m "<type>(<scope>): <summary>" \
     -m "<bulleted feature description>" \
     -m "Implementer: claude-sonnet-5 (claude code)" \
     -m "Reviewer: gpt-6.1-sol (codex)" \
     -m "Verifier: gemini-3.8-flash (antigravity)" \
     -m "Assigner: gemini-3.8-flash (antigravity)"
   git push origin master
   ```
4. Clean up worktree and branch:
   ```bash
   git worktree remove --force .worktrees/<task-name>
   git branch -d feat/<task-name>
   ```
5. Update `docs/TASK-TRACKER.md` on `master`.
