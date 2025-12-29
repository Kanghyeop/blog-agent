# Security Notice

## API Key Management

**NEVER commit API keys to Git!**

### Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your actual API keys to `.env`:
```
GHOST_URL=https://your-blog.ghost.io
GHOST_ADMIN_API_KEY=your_actual_key_here
```

3. Verify `.env` is in `.gitignore`:
```bash
cat .gitignore | grep .env
```

### If API Keys Are Exposed

If you accidentally commit API keys:

1. **Immediately regenerate** all exposed keys
2. Update `.env` with new keys
3. Never use the old keys again
4. Consider using GitHub's secret scanning alerts

### Ghost Admin API Key

Get your key from:
`https://your-blog.ghost.io/ghost/#/settings/integrations`

### Verify Security

Before committing:
```bash
# Check for hardcoded secrets
grep -r "GHOST_ADMIN_API_KEY.*=" --include="*.js" --include="*.py" .

# Should only show .env.example (with placeholder values)
```
