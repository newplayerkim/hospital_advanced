import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { patientId, scheduleId } = await request.json();

        if (!patientId || !scheduleId) {
            return NextResponse.json({ error: "필수 값이 누락되었습니다." }, { status: 400 });
        }

        // 트랜잭션을 사용하여 두 작업(생성, 업데이트)을 안전하게 묶음
        // 1. 해당 일정이 예약 가능한지 확인하고 업데이트
        // 2. 예약 데이터 생성
        const result = await prisma.$transaction(async (tx) => {

            // 1. 예약 가능 여부 확인
            const schedule = await tx.schedule.findUnique({
                where: { id: Number(scheduleId) }
            });

            if (!schedule) {
                throw new Error("존재하지 않는 일정입니다.");
            }

            if (schedule.isBooked) {
                throw new Error("이미 예약이 완료된 일정입니다.");
            }

            // 2. Schedule 예약 상태(isBooked: true)로 업데이트
            await tx.schedule.update({
                where: { id: schedule.id },
                data: { isBooked: true }
            });

            // 3. Reservation 예약 내역 생성
            const reservation = await tx.reservation.create({
                data: {
                    patientId: Number(patientId),
                    scheduleId: schedule.id,
                    status: "예약완료",
                }
            });

            return reservation;
        });

        return NextResponse.json({ success: true, reservation: result }, { status: 201 });

    } catch (error: any) {
        console.error("Reservation error:", error);

        // 트랜잭션 내에서 발생시킨 Custom Error 메시지 전달 (중복 예약 방지)
        if (error.message === "이미 예약이 완료된 일정입니다." || error.message === "존재하지 않는 일정입니다.") {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }

        // Reservation scheduleId 유니크 락 위반 에러 
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: "동시에 예약이 진행되어 사용할 수 없는 시간입니다." }, { status: 409 });
        }

        return NextResponse.json({ error: "예약 진행 중 서버 에러가 발생했습니다." }, { status: 500 });
    }
}
