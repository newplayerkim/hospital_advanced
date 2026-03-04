# 🏥 Hospital Reservation System (Fast MVP)

Next.js와 Prisma를 기반으로 **5일 동안 고심해서 기획하고 구축한** 병원 예약 시스템 MVP입니다.
의사와 환자의 핵심 예약 흐름을 데이터베이스 트랜잭션과 함께 안전하고 완벽하게 구현했습니다.

본 프로젝트는 체계적인 개발 방법론에 따라 **총 5단계의 페이즈(Phase)** 로 나누어 꼼꼼하게 작업되었습니다.
1. **데이터 스키마 설정:** UML 분석 및 데이터베이스 ERD 모델링 (유니크 락 방어 반영)
2. **핵심 기능 API 구현:** 사용자 인증 분기 및 트랜잭션 기반 예약 백엔드 로직 구축
3. **프론트엔드 UI 구성:** 프리미엄 Glassmorphism 트렌드를 반영한 시각적 인터페이스 개발
4. **흐름 테스트 및 예외 처리:** 동시성 제어(중복 예약 방지) 및 예약 취소/상태 복구 테스트
5. **배포 및 문서화:** 전문적인 Git Feature 브랜치 관리 및 시스템 산출물 정리

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

```mermaid
usecaseDiagram
    actor "환자 (Patient)" as P
    actor "의사 (Doctor)" as D
    
    package "병원 예약 시스템 (Hospital System)" {
        usecase "회원가입/로그인" as UC1
        usecase "예약 가능 시간 조회" as UC2
        usecase "진료 예약하기" as UC3
        usecase "예약 취소하기" as UC4
        usecase "자신의 예약 확인" as UC5
        
        usecase "진료 가능 일정 등록" as UC6
        usecase "본인 스케줄 관리" as UC7
    }
    
    P --> UC1
    P --> UC2
    P --> UC3
    P --> UC4
    P --> UC5
    
    D --> UC1
    D --> UC6
    D --> UC7
    
    UC3 ..> UC2 : <<include>>
```

### 2. 활동 다이어그램 (Activity Diagram)
로그인부터 빈 시간 조회, 트랜잭션 예약 처리까지의 UX 논리 흐름도입니다.

```mermaid
stateDiagram-v2
    [*] --> 로그인화면
    로그인화면 --> 역할선택: 사용자 자격 증명
    
    state 역할선택 {
        [*] --> 환자
        [*] --> 의사
    }
    
    환자 --> 예약화면: 리다이렉트
    의사 --> 일정관리화면: 리다이렉트
    
    state 예약화면 {
        빈시간조회 --> 시간선택
        시간선택 --> 트랜잭션요청: 예약 버튼 클릭
        트랜잭션요청 --> DB업데이트: (Schedule Lock & Reservation Insert)
        DB업데이트 --> 완료: 성공
        DB업데이트 --> 에러팝업: 이미 예약된 시간 (P2002)
    }
    
    state 일정관리화면 {
        날짜/시간입력 --> 등록요청
        등록요청 --> DB저장: Schedule Insert
        DB저장 --> 리스트갱신
        DB저장 --> 중복에러: 동일시간 존재
    }
    
    완료 --> [*]
    리스트갱신 --> [*]
```

### 3. 클래스 다이어그램 (Class Diagram)
`User`, `Schedule`, `Reservation` 개체 간의 연관 관계(1:N, 1:1)와 속성, 그리고 Prisma DB 모델링의 근간이 된 구조입니다.

```mermaid
classDiagram
    class User {
        +Int id (PK)
        +String username (Unique)
        +String name
        +String role ("환자" or "의사")
        +String password
        +login()
    }
    
    class Schedule {
        +Int id (PK)
        +Int doctorId (FK)
        +Date availableDate
        +String availableTime
        +Boolean isBooked
        +createSchedule()
    }
    
    class Reservation {
        +Int id (PK)
        +Int patientId (FK)
        +Int scheduleId (FK, Unique)
        +String status ("예약완료", "취소")
        +createReservation()
        +cancel()
    }
    
    User "1" -- "0..*" Schedule : 의사(Doctor)가 등록
    User "1" -- "0..*" Reservation : 환자(Patient)가 예약
    Schedule "1" -- "0..1" Reservation : 해당 시간에 배정
```

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
