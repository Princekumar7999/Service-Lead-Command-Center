import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFollowUpAnalysis } from '@/lib/followups';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const note = body.note || 'Contacted customer regarding repair status and quote.';
    const nextFollowUpDays = body.nextFollowUpDays !== undefined ? Number(body.nextFollowUpDays) : 2;

    const currentJob = await prisma.job.findUnique({
      where: { id: params.id },
      include: { customer: true },
    });

    if (!currentJob) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Calculate new follow-up date if requested
    let newFollowUpDate: Date | null = null;
    if (body.customFollowUpDate) {
      newFollowUpDate = new Date(body.customFollowUpDate);
    } else if (nextFollowUpDays !== 0) {
      const now = new Date();
      newFollowUpDate = new Date(now.getTime() + nextFollowUpDays * 24 * 60 * 60 * 1000);
    }

    // Determine status advance if applicable
    let updatedStatus = currentJob.status;
    if (body.newStatus) {
      updatedStatus = body.newStatus;
    } else if (currentJob.status === 'NEW') {
      updatedStatus = 'NEEDS_QUOTE';
    }

    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: {
        status: updatedStatus,
        nextFollowUpAt: newFollowUpDate,
        activities: {
          create: [
            {
              type: 'CUSTOMER_CONTACTED',
              description: note,
            },
            ...(updatedStatus !== currentJob.status
              ? [
                  {
                    type: 'STATUS_CHANGED',
                    description: `Status advanced from ${currentJob.status} to ${updatedStatus} following contact.`,
                  },
                ]
              : []),
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
      message: 'Contact logged and follow-up updated successfully',
      job: {
        ...updatedJob,
        followUpAnalysis,
      },
    });
  } catch (error) {
    console.error('Error logging contact:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record contact' },
      { status: 500 }
    );
  }
}
