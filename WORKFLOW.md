# 간단한 사용법

## 번역 & 발행

Claude Code에게 URL만 주세요:

```
이거 번역해서 발행해줘: https://example.com/article
```

비용 절감 (95%):
```
이거 Haiku로 번역해서 발행해줘: https://example.com/article
```

## 자동 실행

1. ✅ WebFetch로 콘텐츠 추출
2. ✅ 한국어 번역 (Haiku/Sonnet)
3. ✅ Ghost 발행 (`[번역] Original Title`)
4. ✅ Git 커밋 & 푸시

## 출력

- `output/original.md`, `output/translation.md`
- `output/thumbnail-{title}-{timestamp}.png`
- Ghost post with automatic thumbnail
