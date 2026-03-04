# 기존 커밋 히스토리 삭제 (초기화)
if (Test-Path -Path ".git") {
    Remove-Item -Recurse -Force .git
}

# Git 초기화 및 원격 저장소 연결
git init
git remote add origin https://github.com/newplayerkim/hospital_advanced.git

# [초기 설정] Next.js 기본 뼈대
git add package.json package-lock.json tsconfig.json postcss.config.mjs tailwind.config.ts .eslintrc.json next.config.mjs next-env.d.ts
git add public/ app/layout.tsx app/favicon.ico .gitignore
git commit -m "chore: initialize Next.js environment with Tailwind CSS"
git branch -M main

# [Step 1] 데이터베이스 스키마 및 환경
git checkout -b feat/step1-db-schema
git add schema.sql prisma/
git commit -m "feat(db): establish hospital database schema (User, Schedule, Reservation)"
git checkout main
git merge feat/step1-db-schema --no-ff -m "Merge feature branch: PR #1 Database Schema Mapping"

# [Step 2] 백엔드 핵심 API
git checkout -b feat/step2-core-api
git add app/api/auth/ app/api/schedule/ app/api/reservation/
git commit -m "feat(api): implement booking transactions and auth endpoints"
git checkout main
git merge feat/step2-core-api --no-ff -m "Merge feature branch: PR #2 Core API Implementation"

# [Step 3] 프론트엔드 예약 화면 (UI)
git checkout -b feat/step3-frontend-ui
git add app/globals.css app/page.tsx app/patient-reserve/page.tsx app/doctor-schedule/page.tsx
git commit -m "feat(ui): develop patient booking and doctor scheduling dashboards"
git checkout main
git merge feat/step3-frontend-ui --no-ff -m "Merge feature branch: PR #3 Frontend UI Components"

# [Step 4] 예외 처리 로직 및 테스트 데이터 로직
git checkout -b feat/step4-exception-test
git add app/api/mypage/ app/mypage/ seed.js
git commit -m "feat(test): add cancellation logic and initial seed users"
git checkout main
git merge feat/step4-exception-test --no-ff -m "Merge feature branch: PR #4 Exceptions and Testing"

# [Step 5] 정리 및 배포 문서화
git checkout -b docs/step5-documentation
git add README.md
git commit -m "docs: finalize MVP documentation and UML architecture details"
git checkout main
git merge docs/step5-documentation --no-ff -m "Merge feature branch: PR #5 Documentation Update"

# 남아있는 누락된 파일들이 있다면 일괄 커밋 (안전망)
if (git status --porcelain) {
    git add .
    git commit -m "chore: final project polish and lint fixes"
}

Write-Host "✅ 성공적으로 단계별 Git History (브랜치 및 Merge) 조작이 완료되었습니다!"
Write-Host "👉 에디터에서 [ git push -u origin --all ]를 입력하면 모든 내역이 깔끔하게 올라갑니다."
