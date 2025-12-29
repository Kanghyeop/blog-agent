#!/usr/bin/env node

/**
 * DEVELOPMENT.md에 새 단계를 추가하는 헬퍼 스크립트
 * 전체 파일을 읽지 않고 append만 하여 토큰 절약
 */

const fs = require('fs');
const path = require('path');

const DEV_FILE = 'DEVELOPMENT.md';

/**
 * DEVELOPMENT.md 끝에 새 섹션 추가
 */
function appendPhase(phaseContent) {
    const marker = '\n---\n\n';

    // Phase 7 이전에 추가된 내용 제거 (중복 방지)
    const currentContent = fs.readFileSync(DEV_FILE, 'utf-8');

    // 이미 Phase 7이 있는지 확인
    if (currentContent.includes('### Phase 7:')) {
        console.log('Phase 7이 이미 존재합니다. 업데이트를 건너뜁니다.');
        return;
    }

    // "💡 핵심 배운 점" 섹션 직전에 삽입
    const insertMarker = '---\n\n## 💡 핵심 배운 점';

    if (currentContent.includes(insertMarker)) {
        const updatedContent = currentContent.replace(
            insertMarker,
            marker + phaseContent + '\n\n' + insertMarker
        );
        fs.writeFileSync(DEV_FILE, updatedContent);
        console.log('✓ DEVELOPMENT.md 업데이트 완료');
    } else {
        console.error('❌ 삽입 위치를 찾을 수 없습니다');
    }
}

/**
 * 새 세션을 실제 대화 아카이브에 추가
 */
function appendSession(sessionContent) {
    const currentContent = fs.readFileSync(DEV_FILE, 'utf-8');

    // "주요 인사이트" 섹션 직전에 삽입
    const insertMarker = '### 주요 인사이트';

    if (currentContent.includes(insertMarker)) {
        const updatedContent = currentContent.replace(
            insertMarker,
            sessionContent + '\n\n---\n\n' + insertMarker
        );
        fs.writeFileSync(DEV_FILE, updatedContent);
        console.log('✓ 세션 아카이브 추가 완료');
    } else {
        console.error('❌ 세션 삽입 위치를 찾을 수 없습니다');
    }
}

// Export for use in other scripts
module.exports = { appendPhase, appendSession };

// CLI usage
if (require.main === module) {
    console.log('Usage: require this module and call appendPhase() or appendSession()');
    console.log('Example:');
    console.log('  const { appendPhase } = require("./append-development");');
    console.log('  appendPhase(phaseContent);');
}
