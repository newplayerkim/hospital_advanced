import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 내 예약 목록 조회 (GET)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');

        if (!patientId) return NextResponse.json({ error: "환자 ID 누락" }, { status: 400 });

        const reservations = await prisma.reservation.findMany({
            where: { patientId: Number(patientId) },
            include: {
                schedule: {
                    include: { doctor: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, reservations }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "조회 실패" }, { status: 500 });
    }
}

// 예약 취소 로직 (DELETE)
export async function DELETE(request: Request) {
    try {
        const { reservationId } = await request.json();

        if (!reservationId) return NextResponse.json({ error: "예약 ID 누락" }, { status: 400 });

        // 트랜잭션: Reservation 삭제(또는 취소 상태로 변경) + Schedule isBooked = false 복구
        const result = await prisma.$transaction(async (tx) => {
            const reservation = await tx.reservation.findUnique({
                where: { id: Number(reservationId) }
            });
            if (!reservation) throw new Error("예약 정보가 없습니다.");

            // 상태 변경
            const updatedReservation = await tx.reservation.update({
                where: { id: reservation.id },
                data: { status: '취소' }
            });

            // 일정 복구
            await tx.schedule.update({
                where: { id: reservation.scheduleId },
                data: { isBooked: false }
            });

            return updatedReservation;
        });

        return NextResponse.json({ success: true, result }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "취소 실패" }, { status: 500 });
    }
}
