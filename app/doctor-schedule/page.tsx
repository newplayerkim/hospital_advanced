"use client";

import { useState, useEffect } from 'react';

export default function DoctorSchedulePage() {
    const [doctorId, setDoctorId] = useState<number>(2); // MVP: 임시 의사 ID
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [schedules, setSchedules] = useState<any[]>([]);

    // 1. 내가 등록한 일정 불러오기
    const fetchMySchedules = async (docId: number) => {
        try {
            const res = await fetch(`/api/schedule?doctorId=${docId}`);
            const data = await res.json();
            if (data.success) {
                setSchedules(data.schedules);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setDoctorId(parsedUser.id);
            fetchMySchedules(parsedUser.id);
        } else {
            fetchMySchedules(doctorId);
        }
    }, []);

    // 2. 새로운 진료 가능 시간 등록하기
    const handleAddSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!date || !time) {
            alert("날짜와 시간을 모두 입력해주세요.");
            return;
        }

        try {
            const res = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId,
                    availableDate: date,
                    availableTime: time
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert('일정이 성공적으로 등록되었습니다.');
                setDate('');
                setTime('');
                fetchMySchedules(doctorId);
            } else {
                alert(data.error || '일정 등록 실패');
            }
        } catch (err) {
            alert('네트워크 오류가 발생했습니다.');
        }
    };

    return (
        <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>

            {/* 윗 부분: 새로운 일정 등록 */}
            <div className="glass-container" style={{ marginBottom: '2rem' }}>
                <h2>🩺 내 진료 일정 등록</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>예약 가능한 날짜와 시간을 등록해 주세요.</p>

                <form onSubmit={handleAddSchedule} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="input-group" style={{ marginBottom: '0', flex: 1, minWidth: '200px' }}>
                        <label>진료 날짜</label>
                        <input
                            type="date"
                            className="input-field"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: '0', flex: 1, minWidth: '150px' }}>
                        <label>시간 (예: 10:30)</label>
                        <input
                            type="time"
                            className="input-field"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: 'auto', minWidth: '120px' }}>
                        + 일정 추가
                    </button>
                </form>
            </div>

            {/* 아랫 부분: 등록된 일정 확인 (테이블) */}
            <div className="glass-container">
                <h3>등록된 일정 관리</h3>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>날짜</th>
                                <th>시간</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.length === 0 ? (
                                <tr><td colSpan={3} style={{ textAlign: 'center' }}>등록된 일정이 없습니다.</td></tr>
                            ) : (
                                schedules.map((sch) => (
                                    <tr key={sch.id}>
                                        <td>{new Date(sch.availableDate).toLocaleDateString()}</td>
                                        <td>{sch.availableTime}</td>
                                        <td>
                                            {sch.isBooked ? (
                                                <span className="status-badge status-booked">예약 완료됨</span>
                                            ) : (
                                                <span className="status-badge status-available">예약 대기중</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
