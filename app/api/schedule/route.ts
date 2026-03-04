import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 환자가 예약 가능한 일정(isBooked: false) 목록을 가져오는 API
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const doctorId = searchParams.get('doctorId');

        const schedules = await prisma.schedule.findMany({
            where: {
                ...(doctorId ? { doctorId: Number(doctorId) } : {}),
                isBooked: false // 핵심: 예약되지 않은 시간만 반환
            },
            include: {
                doctor: {
                    select: { name: true } // 의사 이름도 함께 가져옴
                }
            },
            orderBy: [
                { availableDate: 'asc' },
                { availableTime: 'asc' }
            ]
        });

        return NextResponse.json({ success: true, schedules }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "일정 조회 중 오류 발생" }, { status: 500 });
    }
}

// 의사가 자신의 일정을 등록하는 POST API
export async function POST(request: Request) {
    try {
        const { doctorId, availableDate, availableTime } = await request.json();

        if (!doctorId || !availableDate || !availableTime) {
            return NextResponse.json({ error: "필수 값이 누락되었습니다." }, { status: 400 });
        }

        const schedule = await prisma.schedule.create({
            data: {
                doctorId: Number(doctorId),
                availableDate: new Date(availableDate),
                availableTime,
            },
        });

        return NextResponse.json({ success: true, schedule }, { status: 201 });

    } catch (error: any) {
        console.error("Schedule creation error:", error);

        // Prisma 고유 제약조건 에러 (이미 등록된 날짜/시간)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "이미 동일한 날짜와 시간에 일정이 등록되어 있습니다." }, { status: 409 });
        }

        return NextResponse.json({ error: "일정 등록 중 서버 에러가 발생했습니다." }, { status: 500 });
    }
}
