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
