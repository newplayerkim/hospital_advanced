# 🏥 Hospital Reservation System (Fast MVP)

Next.js와 Prisma를 기반으로 5시간 이내 초고속으로 구축된 병원 예약 시스템 MVP입니다.
의사와 환자의 핵심 예약 흐름을 데이터베이스 트랜잭션과 함께 안전하고 완벽하게 구현했습니다.

## 🚀 기술 스택
- **프론트엔드/백엔드:** Next.js (App Router), React, Tailwind CSS
- **데이터베이스/ORM:** SQLite, Prisma
- **퍼블리싱/UI:** Glassmorphism 기반의 프리미엄 커스텀 CSS 디자인 적용

## 💡 핵심 기능
- **[의사] 일정 등록:** 특정 날짜와 예약 가능 시간을 등록합니다. (중복 방지 `UNIQUE` 로직 적용)
- **[환자] 실시간 예약:** 빈 시간대를 조회하고 즉시 예약합니다. 예약 상태 확인 및 수정 방지를 위한 트랜잭션(Transaction) 처리로 동시성 문제를 완벽 차단했습니다.
- **[환자] 마이페이지:** 본인의 예약 내역을 확인하고, 원할 경우 즉각 취소(상태 복구)가 가능합니다.

---

## 📊 UML 설계 아키텍처 (기획 산출물)

아래는 본 프로젝트의 뼈대가 된 초기 설계 모델(UML)들입니다.

### 1. 사용 사례 다이어그램 (Use Case Diagram)
의사와 환자가 시스템 내에서 수행하는 핵심 액션(Authentication, Appointment scheduling)을 나타냅니다.
> ![Use Case Diagram](./docs/use_case_diagram.png)

### 2. 활동 다이어그램 (Activity Diagram)
로그인부터 빈 시간 조회, 트랜잭션 예약 처리까지의 UX 논리 흐름도입니다.
> ![Activity Diagram](./docs/activity_diagram.png)

### 3. 클래스 다이어그램 (Class Diagram)
`User`, `Schedule`, `Reservation` 개체 간의 연관 관계(1:N, 1:1)와 속성, 그리고 Prisma DB 모델링의 근간이 된 구조입니다.
> ![Class Diagram](./docs/class_diagram.png)

---

## ⚙️ 실행 및 테스트 가이드

**1. 로컬 환경 설정 및 의존성 설치**
```bash
npm install
npx prisma generate
npx prisma db push
```

**2. 테스트용 데이터(Seed) 주입**
```bash
node seed.js
```
*(기본 계정 - 환자: patient1 / pw: 123 | 의사: doctor1 / pw: 123)*

**3. 로컬 서버 실행**
```bash
npm run dev
# 접속: http://localhost:3000
```
