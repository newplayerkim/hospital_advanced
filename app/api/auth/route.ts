import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: "아이디와 비밀번호를 입력해주세요." }, { status: 400 });
        }

        // DB에서 사용자 확인 (MVP 수준 인증 로직, 실제로는 bcrypt 등으로 비밀번호 암호화/비교 필요)
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user || user.password !== password) {
            return NextResponse.json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
        }

        // 로그인 성공 시 세션 쿠키를 굽는다고 가정하거나, 프론트로 라우팅 경로 반환
        const redirectPath = user.role === '의사' ? '/doctor-schedule' : '/patient-reserve';

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                name: user.name
            },
            redirect: redirectPath // 프론트엔드에서 이 값을 보고 리다이렉트
        }, { status: 200 });

    } catch (error) {
        console.error("Auth error:", error);
        return NextResponse.json({ error: "로그인 중 서버 에러가 발생했습니다." }, { status: 500 });
    }
}
