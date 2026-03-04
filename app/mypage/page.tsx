"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyPage() {
    const router = useRouter();
    const [patientId, setPatientId] = useState<number>(1);
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMyReservations = async (id: number) => {
        try {
            const res = await fetch(`/api/mypage?patientId=${id}`);
            const data = await res.json();
            if (data.success) {
                setReservations(data.reservations);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setPatientId(parsedUser.id);
            fetchMyReservations(parsedUser.id);
        } else {
            fetchMyReservations(patientId);
        }
    }, []);

    const handleCancel = async (reservationId: number) => {
        if (!confirm('정말 예약을 취소하시겠습니까?')) return;

        try {
            const res = await fetch('/api/mypage', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservationId })
            });
            const data = await res.json();
            if (res.ok) {
                alert('예약이 취소되었습니다.');
                fetchMyReservations(patientId);
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('네트워크 오류');
        }
    };

    return (
        <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>내 예약 확인 (마이페이지)</h2>
                    <button onClick={() => router.push('/patient-reserve')} className="btn-primary btn-small">
                        새 예약하기
                    </button>
                </div>

                {loading ? <p>불러오는 중...</p> : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>의사</th>
                                    <th>날짜</th>
                                    <th>시간</th>
                                    <th>상태</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.length === 0 ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center' }}>예약 내역이 없습니다.</td></tr>
                                ) : (
                                    reservations.map(res => (
                                        <tr key={res.id}>
                                            <td>{res.schedule.doctor.name} 의사</td>
                                            <td>{new Date(res.schedule.availableDate).toLocaleDateString()}</td>
                                            <td>{res.schedule.availableTime}</td>
                                            <td>
                                                {res.status === '예약완료' ? (
                                                    <span className="status-badge status-available">예약완료</span>
                                                ) : (
                                                    <span className="status-badge status-booked">취소됨</span>
                                                )}
                                            </td>
                                            <td>
                                                {res.status === '예약완료' && (
                                                    <button onClick={() => handleCancel(res.id)} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
                                                        취소
                                                    </button>
                                                )}
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
