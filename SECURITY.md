# Security Notice

## API Key 관리

**절대 Git에 API 키를 커밋하지 마세요!**

### Setup

```bash
cp .env.example .env
# Edit .env with your actual keys
```

`.env`:
```
GHOST_URL=https://your-blog.ghost.io
GHOST_ADMIN_API_KEY=your_actual_key_here
```

### API Key 노출 시

1. **즉시 재발급** - Ghost Admin에서 새 키 생성
2. `.env` 업데이트
3. 절대 노출된 키 재사용 금지

### Ghost Admin API Key

`https://your-blog.ghost.io/ghost/#/settings/integrations`

### 커밋 전 확인

```bash
# .env가 .gitignore에 있는지 확인
cat .gitignore | grep .env

# 하드코딩된 키 검색 (없어야 함)
grep -r "GHOST_ADMIN_API_KEY.*=" --include="*.js" .
```
