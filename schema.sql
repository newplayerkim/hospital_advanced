-- 1. User 테이블 (환자/의사 공통)
CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL, -- [개선] 로그인 시 사용할 고유 ID
    name VARCHAR(255) NOT NULL,
    role ENUM('환자', '의사') NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Schedule 테이블 (의사의 예약 가능 시간대)
CREATE TABLE Schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    available_date DATE NOT NULL, -- [개선] 날짜와 시간을 분리하여 조회 및 예약 UI 구성을 용이하게 함
    available_time TIME NOT NULL, 
    is_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES User(id) ON DELETE CASCADE,
    -- [개선] 한 의사가 동일한 날짜/시간에 중복 일정을 등록하지 못하도록 방지
    UNIQUE (doctor_id, available_date, available_time)
);

-- 3. Reservation 테이블 (환자의 실제 예약 정보)
CREATE TABLE Reservation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    schedule_id INT NOT NULL,
    status ENUM('예약완료', '취소') DEFAULT '예약완료',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES Schedule(id) ON DELETE CASCADE,
    -- [개선] 하나의 스케줄(시간대)에 오직 한 명의 환자만 예약 가능하도록 물리적 방어막(Lock) 구축
    UNIQUE (schedule_id)
);
