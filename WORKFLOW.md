# 간단한 사용법

## 번역하고 발행하기

그냥 Claude Code에게 URL만 주세요:

```
이거 번역해서 발행해줘: https://www.paulgraham.com/field.html
```

또는

```
https://example.com/article 번역
```

## 내부 동작

Claude Code가 자동으로:
1. ✅ WebFetch로 콘텐츠 추출 → `output/original.md`
2. ✅ 한국어로 번역 (Haiku 사용 가능) → `output/translation.md`
3. ✅ Ghost 발행: `node publish.js`
4. ✅ Git 커밋 & 푸시

## 비용 절감 옵션

Claude Code에게 요청할 때:
```
이거 Haiku로 번역해서 발행해줘: https://example.com/article
```

이렇게 하면 Task tool로 Haiku 모델을 사용해서 95% 비용 절감!

## 출력

- **Ghost**: `[번역] Original Title` 형식으로 발행
- **파일**: `output/original.md`, `output/translation.md`
- **Git**: 자동 커밋 및 푸시

## 추가 옵션

- 초안으로 발행: `publish.js`에서 `status: 'draft'`로 변경
- 제목 커스터마이징: 필요시 요청
- 번역 스타일: "격식 있게" / "캐주얼하게" 등 지정 가능
