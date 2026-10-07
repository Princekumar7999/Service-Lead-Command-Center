import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFollowUpAnalysis } from '@/lib/followups';

/**
 * Demo API endpoint: Simulates an overdue follow-up date for testing and evaluation.
 * Sets nextFollowUpAt to 2 days in the past and sets status to QUOTE_SENT if completed/lost.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: { customer: true },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // 2 days in the past
    const overdueDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    // If job was completed or lost, reset to active QUOTE_SENT
    let newStatus = job.status;
    if (job.status === 'COMPLETED' || job.status === 'LOST') {
      newStatus = 'QUOTE_SENT';
    }

    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        nextFollowUpAt: overdueDate,
        activities: {
          create: [
            {
              type: 'STATUS_CHANGED',
              description: 'Demonstration action: Follow-up date simulated to 2 days ago to demonstrate overdue queue.',
            },
          ],
        },
      },
      include: {
        customer: true,
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const followUpAnalysis = getFollowUpAnalysis(updatedJob.nextFollowUpAt, updatedJob.status, new Date());

    return NextResponse.json({
      success: true,
      message: 'Job simulated as overdue for demonstration',
      job: {
        ...updatedJob,
        followUpAnalysis,
      },
    });
  } catch (error) {
    console.error('Error simulating overdue job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to simulate overdue job' },
      { status: 500 }
    );
  }
}
