# Blog Agent - Development Journey

이 문서는 Blog Agent 프로젝트의 개발 과정을 기록합니다. Claude Code와의 대화를 통해 어떻게 아이디어가 구체화되고 구현되었는지 보여줍니다.

---

## 📋 재사용 가능한 메타 패턴 (다른 프로젝트에 복사해서 사용)

### 🔐 API 키 & 보안 관리
```
.env.example  (Git 포함, 템플릿)
.env          (Git 제외, 실제 키)
SECURITY.md   (키 관리 가이드)
```

### 🤖 Claude Code Skill 구조
```
.claude/skills/skill-name/
├── SKILL.md              # 500줄 이하, What+When+Keywords
├── reference.md          # 상세 문서 (optional)
├── examples.md           # 사용 예제 (optional)
└── scripts/              # 실행만, 읽지 않음 (토큰 절약)
    └── helper.js
```

### 📚 문서 계층
```
README.md         Quick Start (최소한)
WORKFLOW.md       간단 사용법
CLAUDE.md         개발자 가이드
SECURITY.md       보안 가이드
DEVELOPMENT.md    개발 과정 아카이빙 (이 파일)
```

### 🚀 배포 워크플로우
```bash
# 1. 작업 완료
# 2. DEVELOPMENT.md에 Phase 추가
# 3. Git 커밋 (메타데이터 포함)
git commit -m "Title

- Change 1
- Change 2

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 💰 비용 최적화
```
WebFetch:  0 token (콘텐츠 추출)
Haiku:     ~$0.002/작업 (Task tool 사용)
Scripts:   0 token (실행만)
```

### 📖 문서 압축 원칙
- 50% 목표 (정보 손실 없이)
- 테이블/리스트 활용
- 중복 제거
- 필수 정보만

### 🏗️ 깔끔한 루트 폴더
```
.claude/skills/     모든 기능 (스킬)
output/             결과물
utils.js            공유 유틸 (1-2개만)
*.md                문서 (5-6개)
package.json        의존성
.env.example        설정 템플릿
```

---

## 🎯 프로젝트 목표

영문 기술 블로그를 한국어로 번역하여 Ghost 블로그에 자동으로 발행하는 도구

**핵심 요구사항:**
- 간단한 명령으로 URL → 번역 → 발행 전체 프로세스 자동화
- 비용 효율적인 번역 (Haiku 모델 사용)
- Git 자동 커밋으로 번역 이력 관리

---

## 📊 Phase Index (Quick Navigation)

| Phase | Focus | Status | Key Changes | Impact |
|-------|-------|--------|-------------|--------|
| [1](#phase-1-프로젝트-초기화-순수-cli-도구) | 프로젝트 초기화 | ✅ | publish.js, run.js, translate.js | Foundation: Node.js + Ghost API + Haiku |
| [2](#phase-2-ghost-api-통합-문제-해결) | Ghost API 수정 | ✅ | source=html 파라미터 추가 | Fixed: 빈 포스트 문제 해결 |
| [3](#phase-3-제목-중복-문제) | 제목 중복 해결 | ✅ | H1 제거 로직 추가 | UX: 제목 중복 표시 제거 |
| [4](#phase-4-비용-최적화) | 비용 최적화 | ✅ | Haiku 모델 전환 | Cost: 95% 절감 ($0.05 → $0.002) |
| [5](#phase-5-보안-문제-발견-및-해결) | API 키 보안 | ✅ | .env + SECURITY.md | Security: 키 노출 방지 |
| [6](#phase-6-mcp-서버-통합-시도-이후-롤백됨) | MCP 통합 시도 | ⏮️ Rollback | Next.js + Vercel MCP | Lesson: 생태계 안정성 검증 필요 |
| [7](#phase-7-타임스탬프-아카이브--썸네일-자동-생성) | Archive & Thumbnail | ✅ | 타임스탬프 + Canvas 썸네일 | Feature: 자동 아카이빙 + 2000x1200 썸네일 |
| [8](#phase-8-claude-code-skill-구조로-완전-리팩토링) | Skill 구조 전환 | ✅ | .claude/skills/ + 문서 압축 | Architecture: -450 lines, +modularity |

**Legend**: ✅ Complete | ⏮️ Rolled back

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

### Phase 7: 타임스탬프 아카이브 & 썸네일 자동 생성

**프롬프트:**
```
1. output에 저장하는 original과 translation은 각각 글의 짧은 제목과 타임스탬프를 항상 붙혀줘.
2. 고스트에서 추천하는 썸네일 크기로 썸네일을 만드는 스크립트도 추가해줘.
   단순히 검정 배경에 흰 pretendard 글씨로 핵심 키워드만 눈에 잘 보이도록 만들도록 하자
```

**요구사항 분석:**
- 모든 번역 파일에 타임스탬프 추가 (아카이빙 목적)
- 자동 썸네일 생성 (Ghost feature image용)
- 미니멀 디자인: 검정 배경 + 흰색 텍스트
- Ghost 권장 사이즈 (2000x1200px)

**구현 내용:**

1. **파일명 유틸리티 (file-utils.js)**
   ```javascript
   // 타임스탬프 생성: YYYYMMDD-HHMMSS
   function getTimestamp() {
       const now = new Date();
       return `${year}${month}${day}-${hours}${minutes}${seconds}`;
   }

   // 파일명 생성
   function generateFilename(prefix, title, extension) {
       const shortTitle = titleToFilename(title); // 제목을 slug화
       const timestamp = getTimestamp();
       return `${prefix}-${shortTitle}-${timestamp}.${extension}`;
   }
   ```

2. **썸네일 생성기 (generate-thumbnail.js)**
   ```javascript
   const { createCanvas } = require('canvas');

   // Ghost 권장 사이즈
   const WIDTH = 2000;
   const HEIGHT = 1200;

   function generateThumbnail(title, outputPath) {
       const canvas = createCanvas(WIDTH, HEIGHT);
       const ctx = canvas.getContext('2d');

       // 검정 배경
       ctx.fillStyle = '#000000';
       ctx.fillRect(0, 0, WIDTH, HEIGHT);

       // 흰색 텍스트 (Pretendard/Malgun Gothic)
       ctx.fillStyle = '#FFFFFF';
       ctx.font = 'bold 120px Pretendard, "Malgun Gothic"';
       ctx.textAlign = 'center';

       // 텍스트 자동 줄바꿈
       const lines = wrapText(ctx, title, WIDTH * 0.85);
       lines.forEach(line => {
           ctx.fillText(line, WIDTH / 2, y);
       });

       // PNG 저장
       const buffer = canvas.toBuffer('image/png');
       fs.writeFileSync(outputPath, buffer);
   }
   ```

3. **publish.js 업데이트**
   - 발행 시 타임스탬프 파일 자동 저장
   - `original.md`, `translation.md`는 최신 버전으로 유지 (하위 호환성)
   - 추가로 타임스탬프 파일 생성

   ```javascript
   const timestampedOriginal = generateFilename('original', title);
   const timestampedTranslation = generateFilename('translation', title);

   fs.writeFileSync(path.join('output', timestampedOriginal), originalContent);
   fs.writeFileSync(path.join('output', timestampedTranslation), translationContent);
   ```

4. **run.js 업데이트 (6단계 파이프라인)**
   - Step 3: 썸네일 생성 추가
   ```
   1. Content Extraction
   2. Translation
   3. Generate Thumbnail (NEW!)
   4. Publish to Ghost
   5. Git Commit
   6. Push to GitHub
   ```

5. **소급 적용 (retroactive-apply.js)**
   - 기존 발행된 2개 글에 대해:
     - 타임스탬프 파일 생성
     - 썸네일 생성
   ```javascript
   const articles = [
       { name: 'How To Be Successful', timestamp: '20251229-180500' },
       { name: 'The Shape of the Essay Field', timestamp: '20251229-180700' }
   ];
   ```

6. **Ghost 썸네일 업데이터 (update-ghost-thumbnails.js)**
   - Ghost API로 이미지 업로드
   - 포스트의 feature_image 필드 업데이트
   ```javascript
   // 1. 이미지 업로드
   const imageUrl = await uploadImage(thumbnailPath);

   // 2. 포스트 업데이트
   await updatePost(postId, { feature_image: imageUrl });
   ```

**추가 요구사항:**
```
발행된 글 2개에 소급적용
```

**실행 결과:**
```
Article 1: How To Be Successful
✓ Created: original-how-to-be-successful-20251229-180500.md
✓ Created: translation-how-to-be-successful-20251229-180500.md
✓ Created: thumbnail-how-to-be-successful-20251229-180500.png
✓ Uploaded to Ghost: https://aiden.ghost.io/beonyeog-how-to-be-successful/

Article 2: The Shape of the Essay Field
✓ Created: original-the-shape-of-the-essay-field-20251229-180700.md
✓ Created: translation-the-shape-of-the-essay-field-20251229-180700.md
✓ Created: thumbnail-the-shape-of-the-essay-field-20251229-200041.png
✓ Uploaded to Ghost: https://aiden.ghost.io/beonyeog-the-shape-of-the-essay-field/
```

**버그 수정:**
```
그리고 지금 썸네일에 이상한 밑줄이 보이는 버그 하나 있는듯 픽스
```

**해결:**
- 썸네일 하단의 장식용 선 제거
- 순수 검정 배경 + 흰색 텍스트만 유지

**의존성 추가:**
```json
{
  "canvas": "^3.2.0",      // 이미지 생성
  "form-data": "^5.0.0"    // Ghost API 이미지 업로드
}
```

**교훈:**
- Canvas API를 사용한 서버 사이드 이미지 생성
- Ghost Admin API의 이미지 업로드 엔드포인트 사용법
- 타임스탬프를 활용한 아카이빙 전략
- 하위 호환성을 유지하면서 새 기능 추가하기

---

### Phase 8: Claude Code Skill 구조로 완전 리팩토링

**프롬프트:**
```
그리고 지금까지 짠 모든 코드를 claude 공식으로 권장하는 skill 구조대로 해서
정리를 한번 리팩토링 하고 넘어가자 내 readme에서도 이런 md 파일이 있는지
존재도 안 알려주고 하고 있짢아
```

**사용자 요구사항:**
1. Claude 공식 skill 구조 적용
2. README에서 모든 문서 파일 명확히 노출
3. 루트 폴더 정리 (불필요한 파일 제거)
4. MD 파일들을 절반 길이로 압축 (필수 정보만)

**단계 1: Skill Generator 리서치**

claude-code-guide 에이전트로 공식 문서 확인:

**공식 Skill 구조:**
```
.claude/skills/skill-name/
├── SKILL.md              # Required: metadata + instructions
├── reference.md          # Optional: detailed docs
├── examples.md           # Optional: usage examples
└── scripts/
    └── helper.js         # Executable utilities (run, don't load)
```

**SKILL.md 템플릿:**
```yaml
---
name: skill-name
description: What it does AND when to use it. Include keywords users would say.
allowed-tools: Read, Write, Bash
model: haiku  # Optional
---

# Skill Display Name

## Instructions
Step-by-step guidance

## Scripts
Run utilities (not read):
```bash
node scripts/helper.js
```
```

**핵심 원칙:**
- Progressive Disclosure: SKILL.md은 500줄 이하로 압축
- Scripts는 실행만, context에 로드하지 않음 (토큰 절약)
- Description에 자연어 트리거 키워드 포함

**단계 2: Skill Generator Skill 생성**

`.claude/skills/skill-generator/SKILL.md` 생성:
- 새 스킬 생성 가이드
- SKILL.md 템플릿 제공
- Best practices 문서화
- 메타 스킬 (스킬을 만드는 스킬)

**단계 3: 기존 Skills 리팩토링**

**translate-article/**
```
scripts/
  ├── run.js           # Interactive 6-step pipeline
  └── translate.js     # Translation workflow helper
SKILL.md              # Main workflow instructions
```

**ghost-publish/**
```
scripts/
  ├── publish.js       # Ghost API publisher
  └── file-utils.js    # Filename utilities
SKILL.md
```

**thumbnail-generator/**
```
scripts/
  ├── generate-thumbnail.js  # Canvas-based generator
  └── file-utils.js
SKILL.md
```

각 SKILL.md 업데이트:
- 스크립트 실행 방법 명시 (읽기 X)
- 상대 경로로 스크립트 참조
- Description에 한국어 트리거 추가 ("번역해서 발행해줘")

**단계 4: MD 문서 압축 (50% 이하)**

| 파일 | Before | After | 감축률 |
|------|--------|-------|--------|
| CLAUDE.md | 344 lines | 138 lines | 60% ↓ |
| README.md | 140 lines | 87 lines | 38% ↓ |
| WORKFLOW.md | 45 lines | 27 lines | 40% ↓ |
| SECURITY.md | 48 lines | 38 lines | 21% ↓ |

압축 원칙:
- 필수 정보만 유지
- 중복 제거
- 테이블 형식 활용
- 예제 코드 간소화

**단계 5: 루트 폴더 대청소**

**삭제된 파일 (9개):**
```
❌ run.js                    → .claude/skills/translate-article/scripts/
❌ translate.js              → .claude/skills/translate-article/scripts/
❌ publish.js                → .claude/skills/ghost-publish/scripts/
❌ generate-thumbnail.js     → .claude/skills/thumbnail-generator/scripts/
❌ translate_and_publish.js  (중복, 구버전)
❌ retroactive-apply.js      (일회성 스크립트)
❌ update-ghost-thumbnails.js (일회성 스크립트)
❌ run.sh                    (구버전 shell script)
❌ session7-content.md       (임시 파일)
❌ append-development.js     (헬퍼, 더이상 불필요)
❌ src/                      (빈 디렉토리)
```

**남은 파일 (필수만):**
```
✅ 문서: README.md, CLAUDE.md, WORKFLOW.md, SECURITY.md, DEVELOPMENT.md
✅ 설정: .env, .env.example, .gitignore, package.json, package-lock.json
✅ 유틸: file-utils.js (공유 라이브러리)
✅ 스킬: .claude/skills/ (모든 기능)
✅ 출력: output/
```

**단계 6: README 재정리**

Before:
- 구버전 스크립트 레퍼런스
- 산만한 섹션 구성

After:
- 📚 Documentation 섹션 (테이블 형식)
- 🎯 Skills 섹션 (4개 스킬 명시)
- 💰 Cost Comparison (명확한 권장사항)
- 🏗️ Project Structure (skill 기반)

**최종 결과:**

**커밋 3개:**
1. `cdd179f` - Skill 구조 리팩토링 + MD 압축
2. `5be7324` - Scripts 이동 + 루트 정리
3. `cee6b9c` - README 정리

**변경 통계:**
```
Total: 23 files changed
+715 insertions
-1,165 deletions (코드 450줄 감축!)
```

**교훈:**

1. **Progressive Disclosure의 힘**
   - SKILL.md: 핵심만 (500줄 이하)
   - reference.md: 상세 문서
   - scripts/: 실행 전용 (context에 로드 안함)
   - 토큰 사용량 대폭 감소

2. **Scripts vs Context**
   - 스크립트를 읽지 말고 실행만
   - "node scripts/helper.js" 패턴
   - 일관성 있는 동작 보장
   - 토큰 낭비 방지

3. **Description이 생명**
   - "What it does" + "When to use it" + "Keywords"
   - 자연어 트리거: "번역해서 발행해줘"
   - Claude가 자동으로 skill 매칭

4. **Meta-Documentation의 가치**
   - skill-generator: 스킬을 만드는 스킬
   - 재사용 가능한 패턴 문서화
   - 다른 프로젝트에 적용 가능

5. **문서 압축의 기술**
   - 50% 압축해도 정보 손실 없음
   - 테이블, 리스트 활용
   - 중복 제거가 핵심
   - 가독성 오히려 향상

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

### 세션 7: 타임스탬프 아카이브 & 썸네일 자동 생성

**프롬프트 15:**
```
1. output에 저장하는 original과 translation은 각각 글의 짧은 제목과 타임스탬프를 항상 붙혀줘.
2. 고스트에서 추천하는 썸네일 크기로 썸네일을 만드는 스크립트도 추가해줘.
   단순히 검정 배경에 흰 pretendard 글씨로 핵심 키워드만 눈에 잘 보이도록 만들도록 하자
```

**구현 결과:**
- `file-utils.js`: 타임스탬프 파일명 생성 (`{prefix}-{title}-{YYYYMMDD-HHMMSS}.{ext}`)
- `generate-thumbnail.js`: Canvas 기반 썸네일 생성 (2000x1200px)
- `publish.js` 업데이트: 발행 시 자동 타임스탬프 파일 저장
- `run.js` 업데이트: 6단계 파이프라인에 썸네일 생성 추가

**프롬프트 16:**
```
발행되었던 글 2개에 소급적용
```

**응답:**
- `retroactive-apply.js` 생성
- "How To Be Successful", "The Shape of the Essay Field" 2개 글 처리
- 각 글마다 타임스탬프 파일 3개 생성 (original, translation, thumbnail)

**프롬프트 17:**
```
그리고 지금 썸네일에 이상한 밑줄이 보이는 버그 하나 있는듯 픽스
```

**버그 수정:**
- 썸네일 하단 장식 선 제거
- 순수 검정 배경 + 흰색 텍스트만 유지

**프롬프트 18:**
```
발행된 글에 반영이 안 되어있는듯
```

**해결:**
- `update-ghost-thumbnails.js` 생성
- Ghost API로 썸네일 업로드 및 포스트에 feature_image 설정
- 2개 글 모두 업데이트 완료

**프롬프트 19:**
```
배포
```

**커밋:** "Add timestamped archives and automatic thumbnail generation"
- 4개 새 스크립트
- 10개 아카이브 파일
- 2개 의존성 추가 (canvas, form-data)

**프롬프트 20:**
```
github에 배포할때 늘 developement.md 파일도 업데이트 해줘
```

**개선:**
- `append-development.js` 생성 (토큰 효율적 업데이트)

---

### 세션 8: Claude Code Skill 구조로 완전 리팩토링

**프롬프트 21:**
```
그리고 지금까지 짠 모든 코드를 claude 공식으로 권장하는 skill 구조대로 해서
정리를 한번 리팩토링 하고 넘어가자 내 readme에서도 이런 md 파일이 있는지
존재도 안 알려주고 하고 있짢아
```

**프롬프트 22:**
```
다 리팩토링 하고나서 md 수정할때 지금 md 길이의 절반으로 컴팩트하게 해줘.
정말 필수적인 정보만으로 가독성을 더 높일 수 있을거야.
```

**단계 1: Skill Generator 리서치**
- claude-code-guide 에이전트로 공식 문서 확인
- Progressive Disclosure 패턴 학습
- SKILL.md 템플릿 구조 이해

**단계 2: Skill Generator Skill 생성**
- `.claude/skills/skill-generator/SKILL.md` 생성
- 메타 스킬: 스킬을 만드는 스킬
- 템플릿, 베스트 프랙티스 문서화

**프롬프트 23:**
```
claude skill의 skill generator는 내 skill로 추가해주고
```

**프롬프트 24:**
```
아니 skill generator를 가져오는것부터 시작해
```

**단계 3: 기존 Skills 리팩토링**

스크립트 이동:
```bash
cp run.js .claude/skills/translate-article/scripts/
cp translate.js .claude/skills/translate-article/scripts/
cp publish.js .claude/skills/ghost-publish/scripts/
cp generate-thumbnail.js .claude/skills/thumbnail-generator/scripts/
```

각 SKILL.md 업데이트:
- Scripts 실행 방법 명시 (읽기 X)
- Description에 한국어 트리거 추가

**단계 4: MD 문서 압축 (50% 이하)**

결과:
- CLAUDE.md: 344 → 138 lines (60% ↓)
- README.md: 140 → 87 lines (38% ↓)
- WORKFLOW.md: 45 → 27 lines (40% ↓)
- SECURITY.md: 48 → 38 lines (21% ↓)

**프롬프트 25:**
```
끝나고나서 메인 루트 폴더에 불필요한 파일 없도록 정리해줘
결국 쓰는건 스킬 폴더 하난데 이상한 잡다한 파일들이 너무 많아
```

**단계 5: 루트 폴더 대청소**

삭제된 파일 (9개):
- run.js, translate.js, publish.js, generate-thumbnail.js → skills/로 이동
- translate_and_publish.js, retroactive-apply.js, update-ghost-thumbnails.js
- run.sh, session7-content.md, append-development.js

**프롬프트 26:**
```
마지막으로 readme 파일만 더 깔끔히 정돈
```

**README 정리:**
- 📚 Documentation 섹션 (테이블 형식)
- 🎯 Skills 섹션 (4개 스킬 명시)
- 🏗️ Project Structure (skill 기반)

**커밋 3개:**
1. `cdd179f` - Skill 구조 리팩토링 + MD 압축
2. `5be7324` - Scripts 이동 + 루트 정리
3. `cee6b9c` - README 정리

**변경 통계:**
```
Total: 23 files changed
+715 insertions
-1,165 deletions (코드 450줄 감축!)
```

**프롬프트 27:**
```
배포 완료된 후에 이 글도 haiku 번역
https://www.future-foundry.io/blog/the-simplest-way-to-test-if-your-solution-makes-sense
```

**번역 완료:**
- Haiku 모델 사용 (~$0.002)
- Ghost 발행: https://aiden.ghost.io/beonyeog-the-simplest-way-to-test-if-your-solution-makes-sense/

**프롬프트 28:**
```
내가 늘 github에 push할때 development도 업데이트 하랫지.
그리고 내가 다른 프로젝트에도 적용할 수 있도록 내가 너한테 준 메타적인 작업에 대한
명세들도 모두 추출해줘. 예를들어 키관리 및 배포 자동화 및 학습가이드 문서 기록 등등
```

**응답:**
- DEVELOPMENT.md에 Phase 8 추가
- 최상단에 "재사용 가능한 메타 패턴" 섹션 추가
- 다른 프로젝트에 복사해서 사용 가능한 템플릿

**최종 커밋:** `692f548` - DEVELOPMENT.md 업데이트 완료

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
