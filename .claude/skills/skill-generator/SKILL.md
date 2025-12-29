---
name: skill-generator
description: Create new Claude Code skills following official best practices. Use when user asks to create a new skill, generate a skill, or organize code into a skill structure.
allowed-tools: Read, Write, Bash
---

# Skill Generator

Generate new Claude Code skills following official best practices.

## When to Use

- User asks "create a skill for..."
- Organizing existing code into skills
- Setting up new automation workflows

## Skill Structure

```
.claude/skills/skill-name/
├── SKILL.md              # Required: metadata + instructions
├── reference.md          # Optional: detailed docs
├── examples.md           # Optional: usage examples
└── scripts/
    └── helper.js         # Executable utilities
```

## SKILL.md Template

```yaml
---
name: skill-name
description: What it does AND when to use it. Include keywords users would say.
allowed-tools: Read, Write, Bash  # Optional: restrict tools
model: haiku                       # Optional: specify model
---

# Skill Display Name

## Instructions
Clear, step-by-step guidance.

## Examples
Concrete usage examples.

## Scripts (if applicable)
Run utilities:
```bash
node scripts/helper.js
```
```

## Best Practices

### Metadata Requirements

| Field | Required | Max Length | Rules |
|-------|----------|------------|-------|
| name | Yes | 64 chars | Lowercase, hyphens only |
| description | Yes | 1024 chars | What + When to use + Keywords |
| allowed-tools | No | - | Comma-separated tool names |
| model | No | - | haiku, sonnet, opus |

### Description Writing

**Bad**: "Helps with documents"
**Good**: "Extract text from PDFs, fill forms, merge documents. Use when working with PDF files or document extraction."

Include:
1. What it does
2. When to use it
3. Natural keywords users would say

### Progressive Disclosure

Keep SKILL.md under 500 lines:
- Essential info in SKILL.md
- Detailed docs in reference.md
- Examples in examples.md
- Utilities in scripts/

### Script Organization

**Tell Claude to RUN scripts, not READ them:**

```markdown
## Validation
Run the validator:
```bash
python scripts/validate.py input.txt
```
```

This executes without loading into context (saves tokens).

## Skill Locations

| Location | Path | Scope |
|----------|------|-------|
| Personal | `~/.claude/skills/` | All your projects |
| Project | `.claude/skills/` | Team via git |
| Plugin | `skills/` | Plugin distribution |

## Creating a New Skill

1. Create directory: `.claude/skills/skill-name/`
2. Write `SKILL.md` with metadata + instructions
3. Add scripts in `scripts/` subdirectory
4. Restart Claude Code (or it auto-reloads)
5. Test by triggering the description keywords

## Example: PDF Processing Skill

```yaml
---
name: pdf-processor
description: Extract text, fill forms, merge PDFs. Use for PDF files, form filling, or document extraction tasks.
allowed-tools: Read, Bash
---

# PDF Processor

Extract and manipulate PDF documents.

## Extract Text
```bash
python scripts/extract.py input.pdf
```

## Fill Forms
```bash
python scripts/fill_form.py template.pdf data.json output.pdf
```

For detailed API docs, see [reference.md](reference.md).
```

## Common Mistakes

❌ Making SKILL.md too long (>500 lines)
✅ Split into reference.md, examples.md

❌ Vague descriptions: "Helps with testing"
✅ Specific: "Run Jest tests, generate coverage reports. Use for JavaScript testing."

❌ Reading scripts into context
✅ Execute scripts with Bash tool

❌ Missing trigger keywords in description
✅ Include natural phrases users would say
