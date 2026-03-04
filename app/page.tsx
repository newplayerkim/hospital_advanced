"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('환자');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // 1단계에서 작성한 Auth API 연동
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // localStorage에 간단히 정보 저장 (추후 API 요청 시 식별 목적)
                localStorage.setItem('user', JSON.stringify(data.user));
                // 응답받은 redirect 경로로 이동 (환자->/patient-reserve, 의사->/doctor-schedule)
                router.push(data.redirect);
            } else {
                setError(data.error || '로그인에 실패했습니다.');
            }
        } catch (err) {
            setError('서버와 통신할 수 없습니다.');
        }
    };

    return (
        <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' }}>
            <div className="glass-container" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>병원 예약 시스템</h2>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="role-selector">
                        <input
                            type="radio" id="role-patient" name="role" value="환자"
                            checked={role === '환자'} onChange={(e) => setRole(e.target.value)}
                        />
                        <label htmlFor="role-patient">환자</label>

                        <input
                            type="radio" id="role-doctor" name="role" value="의사"
                            checked={role === '의사'} onChange={(e) => setRole(e.target.value)}
                        />
                        <label htmlFor="role-doctor">의사</label>
                    </div>

                    <div className="input-group">
                        <label>아이디 (Username)</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="아이디를 입력하세요"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>비밀번호</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="비밀번호를 입력하세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                        입장하기
                    </button>
                </form>
            </div>
        </main>
    );
}
