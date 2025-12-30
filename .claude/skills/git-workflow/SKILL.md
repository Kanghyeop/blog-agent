---
name: git-workflow
description: Automate routine Git operations including status checks, commits, pushes, and branch management. Use when user mentions "commit", "push", "git", "deploy", or wants to save their work.
allowed-tools: Bash, Read
model: haiku
---

# Git Workflow Automation

Streamlined Git operations for development workflow.

## User Prompts

```
커밋하고 푸시해줘
Save my work
Deploy changes
Create a commit
```

## Features

1. **Smart Commit**: Auto-generate commit messages from changed files
2. **Quick Push**: Commit and push in one command
3. **Auto Documentation**: Update README.md & DEVELOPMENT.md on code changes
4. **Status Check**: View current git state
5. **Branch Management**: Create/switch branches

## Usage

### Quick Commit & Push
```bash
cd .claude/skills/git-workflow && node scripts/quick-push.js
```

**What it does**:
- Runs `git status` to show changes
- Generates commit message from changed files
- Commits all changes with `git add -A`
- Pushes to origin

### Custom Commit Message
```bash
node scripts/quick-push.js "Your custom message"
```

### Status Check
```bash
node scripts/status.js
```

Shows:
- Current branch
- Modified files
- Untracked files
- Commit status (ahead/behind)

## Commit Message Templates

The skill auto-generates messages based on file changes:

| Changed Files | Template |
|---------------|----------|
| `*.js, *.ts` | `Update: [component name]` |
| `*.md` | `Docs: update [filename]` |
| `package.json` | `Dependencies: update packages` |
| Multiple types | `Update: [list of files]` |
| Translation workflow | `Translate: [article title]` |

## Auto Documentation

**Triggers on**:
- Code file changes (`.js`, `.py`, `.ts`)
- Skill additions/modifications
- Configuration changes

**Skips on**:
- Translation-only changes (`output/*.md`)
- Documentation-only changes

**What it does**:
1. Analyzes changed files
2. Updates README.md (skills section)
3. Updates DEVELOPMENT.md (changelog)
4. Stages docs for commit

## Scripts

| Script | Purpose |
|--------|---------|
| `quick-push.js` | Commit all changes and push (auto-updates docs) |
| `update-docs.js` | Update README.md & DEVELOPMENT.md |
| `status.js` | Enhanced git status display |
| `commit.js` | Commit with auto-generated message |

## Environment

No configuration needed - works with your existing Git setup.

## Examples

**Scenario 1**: After translating an article
```bash
node scripts/quick-push.js
# Auto-detects translation files
# Message: "Translate: [article title] - Published to Ghost"
```

**Scenario 2**: After code changes
```bash
node scripts/quick-push.js "Add thumbnail upload feature"
# Commits: All changed files
# Pushes: To current branch
```

**Scenario 3**: Check status before committing
```bash
node scripts/status.js
# Shows: Modified files, branch status, commit readiness
```
