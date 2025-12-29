# Blog Agent - Development Journey

이 문서는 Blog Agent 프로젝트의 개발 과정을 기록합니다. Claude Code와의 대화를 통해 어떻게 아이디어가 구체화되고 구현되었는지 보여줍니다.

---

## 🎯 프로젝트 목표

영문 기술 블로그를 한국어로 번역하여 Ghost 블로그에 자동으로 발행하는 도구

**핵심 요구사항:**
- 간단한 명령으로 URL → 번역 → 발행 전체 프로세스 자동화
- 비용 효율적인 번역 (Haiku 모델 사용)
- Git 자동 커밋으로 번역 이력 관리

---

## 📝 개발 단계

### Phase 1: 프로젝트 초기화 (순수 CLI 도구)

**초기 프롬프트:**
```
목표 파이프라인:
1. URL 입력받기
2. WebFetch로 콘텐츠 추출 → output/original.md
3. Claude로 한국어 번역 → output/translation.md
4. Ghost API로 발행
5. Git 커밋
```

**주요 결정:**
- Python 대신 **Node.js 선택** (Ghost API와 JWT 인증이 더 간단)
- Claude Code의 **WebFetch 도구 활용** (0 토큰 비용)
- **Haiku 모델 사용** (Sonnet 대비 95% 비용 절감)

**구현된 파일:**
- `publish.js` - Ghost Admin API 연동 (JWT 인증)
- `run.js` - 인터랙티브 파이프라인 가이드
- `translate.js` - 번역 워크플로우 헬퍼

### Phase 2: Ghost API 통합 문제 해결

**문제:** Ghost에 포스트가 올라가지만 내용이 비어있음

**프롬프트:**
```
글이 고스트에 올라갔는데 내용이 아무것도 없이 발행되었는걸
```

**해결:**
```javascript
// 문제: Ghost API에 ?source=html 파라미터 누락
const apiUrl = '/ghost/api/admin/posts/';  // ❌

// 해결: source=html 파라미터 추가
const apiUrl = '/ghost/api/admin/posts/?source=html';  // ✅
```

**교훈:** API 문서를 꼼꼼히 확인하자. Ghost API는 HTML 입력임을 명시해야 함.

### Phase 3: 제목 중복 문제

**문제:** 웹에서 볼 때 제목이 두 번 표시됨

**프롬프트:**
```
글 내용에 제목이 포함되지 않도록 해줘
웹에서 볼때 겹쳐서 보이는 문제가 있다
```

**해결:**
```javascript
function markdownToHTML(md) {
  const lines = md.split('\n');
  let foundFirstH1 = false;

  for (let line of lines) {
    // 첫 번째 H1 헤딩 건너뛰기
    if (!foundFirstH1 && line.trim().startsWith('# ')) {
      foundFirstH1 = true;
      continue;  // Ghost가 이미 제목을 표시하므로 본문에서 제거
    }
    // 나머지 내용만 포함
  }
}
```

**교훈:** Ghost는 제목을 별도로 렌더링하므로, 본문 HTML에는 제목을 포함하지 않아야 함.

### Phase 4: 비용 최적화

**프롬프트:**
```
번역에 더 저렴한 모델을 쓰는 방법은 없을까?
```

**비용 분석:**
| 모델 | 번역 1회 비용 | 비고 |
|------|--------------|------|
| Sonnet 4.5 | ~$0.05 | 고품질 |
| **Haiku 3.5** | **~$0.002** | **95% 절감** |
| Opus | ~$0.35 | 최고 품질 |

**해결:**
```javascript
// Claude Code의 Task tool로 Haiku 모델 지정
"Use Task tool with model='haiku' to translate"
```

**교훈:** 번역 작업은 Haiku로 충분히 고품질. 비용 대비 효과가 뛰어남.

### Phase 5: 보안 문제 발견 및 해결

**프롬프트:**
```
한번 확인한번 하자면 내 key값이 github에 공개되어있지는 않지?
```

**발견된 문제:**
```javascript
// publish.js - 하드코딩된 API 키 (❌ 위험!)
const GHOST_ADMIN_API_KEY = '69522d3df6f30a000125b42c:4098e3f...';
```

**해결:**
```bash
# 1. dotenv 패키지 설치
npm install dotenv

# 2. .env 파일로 분리
GHOST_ADMIN_API_KEY=your_key_here

# 3. .gitignore에 추가
.env
.env.local
.env.*
```

```javascript
// publish.js - 환경변수 사용 (✅ 안전)
require('dotenv').config();
const GHOST_ADMIN_API_KEY = process.env.GHOST_ADMIN_API_KEY;

if (!GHOST_ADMIN_API_KEY) {
    console.error('Error: GHOST_ADMIN_API_KEY not found');
    process.exit(1);
}
```

**중요 조치:**
1. 노출된 Ghost Admin API Key 즉시 재발급
2. `.env.example` 생성 (placeholder 값만 포함)
3. `SECURITY.md` 작성

**교훈:**
- API 키는 **절대** 코드에 하드코딩하지 말 것
- Git에 커밋하기 전 항상 체크
- GitHub에 이미 푸시된 키는 재발급 필수

### Phase 6: MCP 서버 통합 시도 (이후 롤백됨)

> **참고**: 이 기능은 구현 완료 후 PlayMCP 생태계의 안정성 문제로 롤백되었습니다.
> 교육 목적으로 구현 과정을 남겨둡니다.

**프롬프트:**
```
카카오톡에서 @단순번역 하면서 호출하면
이 파이프라인이 자동으로 실행되도록 해줘
```

**요구사항 분석:**
- Kakao PlayMCP (MCP 프로토콜 기반 통합)
- 서버리스 환경 (Vercel/Netlify)
- 간단한 명령: `@단순번역 <URL>`

**아키텍처 설계:**

```
KakaoTalk → PlayMCP → Claude → MCP Server (Vercel)
                                    ↓
                           1. Extract (URL → MD)
                           2. Translate (Claude Haiku)
                           3. Publish (Ghost API)
                           4. Commit (GitHub)
```

**기술 스택 선택:**

1. **Next.js + Vercel**
   - 이유: Vercel은 MCP 지원, 서버리스 환경
   - `@modelcontextprotocol/sdk` 사용

2. **파일 저장 전략**
   - 서버리스는 stateless → `/tmp` 사용 (ephemeral)
   - Git 클론 → 수정 → 푸시 (한 번의 invocation 내에서)

3. **라이브러리 모듈화**
   ```
   lib/
   ├── content-extractor.ts  # HTML → Markdown (turndown)
   ├── anthropic-client.ts   # 번역 API 호출
   ├── ghost-client.ts       # publish.js 리팩토링
   ├── git-operations.ts     # simple-git 사용
   └── translation-tool.ts   # 전체 파이프라인 오케스트레이션
   ```

**구현 과정:**

```bash
# 1. Next.js 프로젝트 초기화
npm install next react react-dom typescript
npm install @modelcontextprotocol/sdk
npm install @anthropic-ai/sdk simple-git turndown

# 2. MCP 서버 엔드포인트 생성
app/api/mcp/route.ts
```

**핵심 코드:**

```typescript
// app/api/mcp/route.ts - MCP 툴 정의
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: 'translate_and_publish_blog',
      description: '영문 글을 한국어로 번역하고 Ghost 블로그에 발행',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: '번역할 영문 글 URL' }
        },
        required: ['url']
      }
    }]
  };
});

// 툴 실행
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const url = request.params.arguments?.url;
  const result = await translateAndPublish(url);

  return {
    content: [{
      type: 'text',
      text: `✅ 번역 완료!\nGhost: ${result.ghostUrl}\nCommit: ${result.commitHash}`
    }]
  };
});
```

**빌드 에러 해결:**

1. **모듈 해상도 문제**
   ```typescript
   // ❌ Next.js에서 .js 확장자 사용 불가
   import { translateAndPublish } from '@/lib/translation-tool.js';

   // ✅ 확장자 제거
   import { translateAndPublish } from '../../../lib/translation-tool';
   ```

2. **TypeScript 타입 에러**
   ```typescript
   // ❌ body는 unknown 타입
   const body = await req.json();

   // ✅ any로 캐스팅
   const body = await req.json() as any;
   ```

3. **타입 정의 누락**
   ```bash
   npm install --save-dev @types/jsonwebtoken
   ```

**환경 변수 추가:**
```bash
# 기존
GHOST_URL=https://aiden.ghost.io
GHOST_ADMIN_API_KEY=id:secret

# 추가 필요
ANTHROPIC_API_KEY=sk-ant-xxx        # MCP 서버가 직접 번역 호출
GITHUB_PAT=ghp_xxx                  # Git push 인증
GITHUB_REPO_URL=https://github.com/user/repo.git
```

**배포 준비:**
```bash
npm run build  # ✅ 빌드 성공
vercel deploy --prod
```

---

## 💡 핵심 배운 점

### 1. 점진적 개발의 중요성
- 처음부터 완벽한 구조를 만들려 하지 않음
- 먼저 작동하는 MVP를 만들고 → 문제 발견 → 개선

### 2. API 문서 꼼꼼히 읽기
- Ghost API의 `?source=html` 파라미터
- JWT 인증 방식과 만료 시간
- 작은 디테일이 큰 차이를 만듦

### 3. 비용 최적화 전략
- WebFetch 도구 활용 (0 토큰)
- Haiku 모델 선택 (95% 비용 절감)
- 스크립트 실행 (0 토큰)
- **번역만 과금**, 나머지는 무료

### 4. 보안 첫 번째
- API 키는 환경변수로 관리
- `.gitignore` 철저히 관리
- 노출된 키는 즉시 재발급

### 5. 서버리스 환경의 특성
- Stateless: 요청 간 상태 공유 불가
- Ephemeral storage: `/tmp`는 invocation 내에서만 유효
- Cold start: 첫 요청은 느릴 수 있음
- 최대 실행 시간 제한 (Vercel: 60초)

### 6. 모듈화의 힘
- 각 기능을 독립적인 모듈로 분리
- `publish.js` → `lib/ghost-client.ts` 리팩토링
- 테스트와 유지보수가 쉬워짐

---

## 🏗️ 최종 아키텍처

### CLI 모드 (현재 사용 중)
```
User → Claude Code → WebFetch → Translation → publish.js → Ghost API
                     (0 token)   (Haiku via    (0 token)  → Git commit
                                  Task tool)               (0 token)
```

### 워크플로우 설명
1. **사용자**: URL 입력 또는 "이거 번역해서 발행해줘" 프롬프트
2. **WebFetch**: Claude Code의 내장 도구로 콘텐츠 추출 → `output/original.md`
3. **Translation**: Claude Code의 Task tool로 Haiku 모델 사용 → `output/translation.md`
4. **Publish**: `node publish.js` 실행으로 Ghost API에 발행
5. **Git**: `run.js`가 자동으로 커밋 & 푸시

### 비용 구조
```
번역 1회 비용:
- WebFetch: $0 (Claude Code 내장 도구)
- Translation (Haiku via Claude Code Task tool): ~$0.002
- Publish script: $0 (로컬 Node.js 실행)
- Git commit: $0 (로컬 실행)

Total: ~$0.002/번역 (~₩3)

월간 50회 번역 시: ~$0.10 (~₩130)
```

### 롤백된 아키텍처 (참고)
MCP 서버 기반 카카오톡 통합은 PlayMCP 생태계 안정성 문제로 롤백되었습니다.
자세한 내용은 "Phase 6" 섹션 참고.

---

## 📦 프로젝트 구조 (최종)

```
blog-agent/
├── output/                     # 번역 파일 저장소
│   ├── original.md            # 원문
│   └── translation.md         # 번역문
├── publish.js                  # Ghost API 발행 스크립트
├── run.js                      # 인터랙티브 파이프라인 가이드
├── translate.js                # 번역 워크플로우 헬퍼
├── translate_and_publish.js    # 통합 워크플로우
├── package.json                # 의존성 (dotenv, jsonwebtoken, marked)
├── .env                        # 환경변수 (gitignored)
├── .env.example                # 환경변수 템플릿
├── .gitignore                  # Git 제외 파일 목록
├── CLAUDE.md                   # Claude Code 사용 문서
├── README.md                   # 프로젝트 소개 및 사용법
├── WORKFLOW.md                 # 간단 사용법 (한글)
├── SECURITY.md                 # API 키 보안 가이드
└── DEVELOPMENT.md              # 개발 과정 기록 (이 문서)
```

**참고**: MCP 서버 관련 코드(`app/`, `lib/`, TypeScript 설정 등)는 생태계 안정성 문제로 롤백되었습니다.

---

## 🎓 다른 개발자들을 위한 팁

### 1. Claude Code 활용법
- **WebFetch 도구 적극 활용**: HTML 파싱을 직접 구현할 필요 없음
- **Task 도구로 모델 선택**: 용도에 맞는 모델 사용 (Haiku/Sonnet/Opus)
- **명확한 프롬프트**: "이거 번역해줘" 대신 "Haiku로 번역해서 발행해줘"

### 2. Ghost API 통합
```javascript
// JWT 토큰 생성 (5분 유효)
const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
  keyid: id,
  algorithm: 'HS256',
  expiresIn: '5m',
  audience: '/admin/'
});

// source=html 파라미터 필수!
const url = `${GHOST_URL}/ghost/api/admin/posts/?source=html`;
```

### 3. MCP 서버 개발
- **공식 SDK 사용**: `@modelcontextprotocol/sdk`
- **서버리스 최적화**: 의존성 최소화, 동적 import 활용
- **에러 처리 철저히**: MCP 클라이언트에게 명확한 에러 메시지 반환

### 4. 번역 품질 개선
```javascript
// 번역 프롬프트에 포함할 것
const translationPrompt = `
1. Maintain markdown formatting exactly
2. Add translation notice at top: [원문](${url})
3. Keep code blocks unchanged
4. Translate naturally (not literal)
5. Preserve links and images
`;
```

---

## 🚀 향후 개선 아이디어

1. **배치 번역**: 여러 URL을 한 번에 번역
2. **번역 메모리**: 이전 번역 재사용
3. **다국어 지원**: 한국어 외 다른 언어도
4. **웹 UI**: 비개발자도 사용 가능한 웹 인터페이스
5. **번역 검토 단계**: 발행 전 검토 기능
6. **Webhook 알림**: Slack/Discord 알림

---

## 📚 참고 자료

- [Ghost Admin API 문서](https://ghost.org/docs/admin-api/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Kakao PlayMCP 발표](https://www.kakaocorp.com/page/detail/11674)
- [Claude API 문서](https://docs.anthropic.com/)
- [Vercel MCP 지원](https://vercel.com/changelog/mcp-server-support-on-vercel)

---

## 💬 실제 대화 아카이브

이 섹션은 실제 개발 과정에서 사용자가 입력한 프롬프트들을 시간순으로 기록합니다.

### 세션 1: 프로젝트 초기화

**프롬프트 1:**
```
(CLAUDE.md 파일 생성 요청)
```

**프롬프트 2: 프로젝트 목표 명확화**
```
목표 파이프라인:

1. 사용자가 URL을 입력
2. WebFetch로 콘텐츠 추출 → output/original.md 저장
3. Claude에게 한국어로 번역 요청 → output/translation.md 저장
4. Ghost API로 자동 발행
5. Git 커밋

주요 요구사항:
- WebFetch 사용 (토큰 비용 0)
- Claude Code의 Task tool로 번역 (Haiku 모델 선택 가능)
- 번역문 상단에 원문 링크 포함
- 제목: "[번역] 원문 영어 제목"
```

**응답:** Node.js 기반 CLI 도구 구조 설계, publish.js/run.js/translate.js 생성

---

### 세션 2: 첫 번역 테스트 및 문제 해결

**프롬프트 3:**
```
이거 발행해줘 https://blog.samaltman.com/how-to-be-successful
```

**결과:** 번역 성공, 하지만 Ghost에 내용이 비어있는 문제 발견

**프롬프트 4:**
```
정작 블로그에 글 내용이 없어
```

**해결:** Ghost API에 `?source=html` 파라미터 추가

---

### 세션 3: 제목 및 포맷 개선

**프롬프트 5:**
```
앞으로는 게시글의 제목은 원문의 것을 그대로 사용하고
앞에 [번역] 이라고 달아줘
```

**변경사항:**
- 기존: 한국어 번역된 제목 사용
- 개선: `[번역] Original English Title` 형식

**프롬프트 6:**
```
이것 번역해서 발행 https://www.paulgraham.com/field.html
```

**결과:** 두 번째 번역 성공적으로 완료

**프롬프트 7:**
```
글 내용에 제목이 포함되지 않도록 해줘
웹에서 볼때 겹쳐서 보이는 문제가 있다
```

**해결:** Markdown에서 첫 번째 H1 헤딩 제거하는 로직 추가

---

### 세션 4: 비용 최적화

**프롬프트 8:**
```
방금 글 하나 올리는데 몇 token 썼어?
```

**응답:** 약 7,000-10,000 토큰, Sonnet 기준 ~$0.05-0.07

**프롬프트 9:**
```
번역에 더 저렴한 모델을 쓰는 방법은 없을까?
```

**해결책:**
- Claude Code의 Task tool에 `model="haiku"` 옵션 사용
- 비용: $0.002-0.003 (95% 절감)
- CLAUDE.md에 Haiku 사용법 문서화

---

### 세션 5: 보안 점검

**프롬프트 10:**
```
지금 쓰이지 않는것 레거시들 정리해주길 바라고,
한번 확인한번 하자면 내 key값이 github에 공개되어있지는 않지?
```

**발견된 문제:**
- `publish.js`와 `publish_simple.py`에 Ghost Admin API Key 하드코딩
- GitHub에 이미 푸시됨 (위험!)

**즉각 조치:**
1. dotenv 패키지 설치
2. 환경변수로 마이그레이션
3. `.env.example` 생성
4. `SECURITY.md` 작성
5. 사용자에게 API Key 재발급 권고

**프롬프트 11:**
```
69525449f6f30a000125b45f:10aa17127daf074a9db8bf84c39295117282e331de8444de6d207466c27ac948
```

**응답:** 새로운 Ghost Admin API Key를 `.env`에 안전하게 저장

---

### 세션 6: 카카오톡 통합 시도 (이후 롤백)

**프롬프트 12:**
```
카카오톡에서 @단순번역 하면서 호출하면
이 파이프라인이 자동으로 실행되도록 해줘
```

**계획:**
- Kakao PlayMCP 기반 MCP 서버 구축
- Next.js + Vercel serverless 환경
- `@modelcontextprotocol/sdk` 사용

**구현 완료:**
- Next.js 프로젝트 설정
- MCP 서버 엔드포인트 (`app/api/mcp/route.ts`)
- 모듈화된 라이브러리 (lib/)
- 빌드 성공

**프롬프트 13:**
```
PlayMCP의 경우에 Claude에 커스텀 커넥터로 연결해두었어.
```

**추가 설명:** PlayMCP 연결 방법 확인

**프롬프트 14:**
```
카톡 연결은 취소하도록 하자
아직 play mcp 생태계가 안정적이지 않은 것 같아.
관련된 작업은 롤백해주고,
그리고 지금 깃헙 푸쉬 자동으로 하는것처럼
내 프롬프트들도 아까 그 교육용 자료에 모두 아카이브 해줄 수 있도록 해줘.
```

**롤백 작업:**
- Next.js 앱 및 MCP 라이브러리 제거
- package.json 원상복구
- 환경변수 정리
- 문서 업데이트
- 실제 프롬프트 아카이브 추가 (이 섹션)

---

### 주요 인사이트

**1. 점진적 개선의 중요성**
- 각 프롬프트가 이전 결과에 대한 피드백
- 문제 발견 → 즉시 해결 → 다음 단계
- 완벽한 계획보다 빠른 실행과 개선

**2. 명확한 커뮤니케이션**
- "글 내용이 없어" → 구체적인 문제 설명
- "원문 제목 그대로 사용" → 명확한 요구사항
- 모호함 없이 정확한 의도 전달

**3. 보안 의식**
- API Key 노출 여부 스스로 확인
- 문제 발견 즉시 대응
- 교육 자료에도 보안 중요성 강조

**4. 실용주의**
- PlayMCP 생태계 불안정성 판단
- 과감한 롤백 결정
- 현재 작동하는 솔루션(CLI) 유지

---

## 🙏 크레딧

이 프로젝트는 Claude Code (Sonnet 4.5)와의 대화를 통해 개발되었습니다.

**개발 시간**: 약 4-5시간 (MCP 서버 실험 포함)
**주요 반복 횟수**: 7회 (각 phase 별 문제 해결 + 롤백)
**최종 코드 라인**: ~500 lines (JavaScript)
**시도했지만 롤백한 기능**: Kakao PlayMCP 통합 (생태계 안정성 문제)

**핵심 교훈**:
- AI와의 협업으로 빠르게 프로토타입을 만들고 실제 문제를 만나며 개선하는 방식이 매우 효과적
- 새로운 기술의 성숙도를 평가하고 과감히 롤백할 수 있는 판단력도 중요
- 작동하는 간단한 솔루션이 복잡한 시스템보다 나을 수 있음
