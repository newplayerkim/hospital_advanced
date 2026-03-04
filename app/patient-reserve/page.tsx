"use client";

import { useState, useEffect } from 'react';

export default function PatientReservationPage() {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [patientId, setPatientId] = useState<number>(1); // MVP: 임시 환자 ID (새로 생성하거나, 실제론 로그인 정보 캐싱)

    // 1. 일정 데이터 불러오기
    const fetchSchedules = async () => {
        try {
            const res = await fetch('/api/schedule');
            const data = await res.json();
            if (data.success) {
                setSchedules(data.schedules);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();

        // 로컬스토리지에서 로그인된 환자 ID 가져오기 (MVP)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setPatientId(JSON.parse(storedUser).id);
        }
    }, []);

    // 2. 트랜잭션 API 호출을 통한 예약 처리 (환자 예약 생성 로직)
    const makeReservation = async (scheduleId: number) => {
        if (!confirm('이 시간으로 예약하시겠습니까?')) return;

        try {
            const res = await fetch('/api/reservation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId, scheduleId })
            });

            const data = await res.json();

            if (res.ok) {
                alert('예약이 성공적으로 완료되었습니다!');
                // 성공 시 남은 예약 목록 리프레시
                fetchSchedules();
            } else {
                alert(data.error || '예약 실패');
            }
        } catch (err) {
            alert('네트워크 오류가 발생했습니다.');
        }
    };

    return (
        <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-container">
                <h2>🏥 진료 예약하기</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>원하시는 진료 시간을 선택해 주세요.</p>

                {loading ? (
                    <p>일정을 불러오는 중입니다...</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>의사</th>
                                    <th>예약 날짜</th>
                                    <th>시간</th>
                                    <th>예약</th>
                                </tr>
                            </thead>
                            <tbody id="schedule-list">
                                {schedules.length === 0 ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center' }}>현재 예약 가능한 의료진 일정이 없습니다.</td></tr>
                                ) : (
                                    schedules.map((sch) => (
                                        <tr key={sch.id}>
                                            <td>{sch.doctor.name} 의사</td>
                                            <td>{new Date(sch.availableDate).toLocaleDateString()}</td>
                                            <td>{sch.availableTime}</td>
                                            <td>
                                                <button
                                                    onClick={() => makeReservation(sch.id)}
                                                    className="btn-primary btn-small"
                                                >
                                                    선택
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
