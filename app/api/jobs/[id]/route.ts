import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { JobUpdateSchema } from '@/lib/validation';
import { getFollowUpAnalysis } from '@/lib/followups';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    const followUpAnalysis = getFollowUpAnalysis(job.nextFollowUpAt, job.status, new Date());

    return NextResponse.json({
      success: true,
      job: {
        ...job,
        followUpAnalysis,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/jobs/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve job details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = JobUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const currentJob = await prisma.job.findUnique({
      where: { id: params.id },
    });

    if (!currentJob) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    const activitiesToCreate: any[] = [];

    const data = parsed.data;

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.estimatedValue !== undefined) updateData.estimatedValue = data.estimatedValue;
    if (data.assignedTechnician !== undefined) updateData.assignedTechnician = data.assignedTechnician;

    if (data.nextFollowUpAt !== undefined) {
      updateData.nextFollowUpAt = data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null;
    }

    // Check if status changed
    if (data.status !== undefined && data.status !== currentJob.status) {
      updateData.status = data.status;
      activitiesToCreate.push({
        type: 'STATUS_CHANGED',
        description: `Status changed from ${currentJob.status.replace('_', ' ')} to ${data.status.replace('_', ' ')}.`,
      });

      // If moved to COMPLETED or LOST, clear the next follow up
      if (data.status === 'COMPLETED' || data.status === 'LOST') {
        updateData.nextFollowUpAt = null;
      }
    }

    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: {
        ...updateData,
        activities: {
          create: activitiesToCreate,
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
      job: {
        ...updatedJob,
        followUpAnalysis,
      },
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update job' },
      { status: 500 }
    );
  }
}
