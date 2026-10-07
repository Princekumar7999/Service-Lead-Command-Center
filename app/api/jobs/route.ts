import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { JobCreateSchema } from '@/lib/validation';
import {
  getFollowUpAnalysis,
  isActionRequiredToday,
  calculatePotentialRevenue,
  sortJobsByActionPriority,
} from '@/lib/followups';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // all, overdue, today, upcoming, completed, pipeline
    const query = (searchParams.get('q') || '').toLowerCase().trim();

    const allJobs = await prisma.job.findMany({
      include: {
        customer: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    // Attach deterministic follow-up analysis to each job
    const analyzedJobs = allJobs.map((job) => {
      const analysis = getFollowUpAnalysis(job.nextFollowUpAt, job.status, now);
      return {
        ...job,
        followUpAnalysis: analysis,
      };
    });

    // Calculate aggregate metrics for Denise
    const totalCount = analyzedJobs.length;
    const overdueJobs = analyzedJobs.filter((j) => j.followUpAnalysis.urgency === 'OVERDUE');
    const dueTodayJobs = analyzedJobs.filter((j) => j.followUpAnalysis.urgency === 'DUE_TODAY');
    const upcomingJobs = analyzedJobs.filter((j) => j.followUpAnalysis.urgency === 'UPCOMING');
    const completedJobs = analyzedJobs.filter((j) => j.status === 'COMPLETED');
    const lostJobs = analyzedJobs.filter((j) => j.status === 'LOST');

    const potentialRevenue = calculatePotentialRevenue(analyzedJobs, now);

    // Apply text search filtering if provided
    let filtered = analyzedJobs;
    if (query) {
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(query) ||
          j.description.toLowerCase().includes(query) ||
          j.customer.name.toLowerCase().includes(query) ||
          j.customer.company.toLowerCase().includes(query) ||
          j.customer.phone.toLowerCase().includes(query)
      );
    }

    // Apply tab/urgency filtering
    if (filter === 'overdue') {
      filtered = filtered.filter((j) => j.followUpAnalysis.urgency === 'OVERDUE');
    } else if (filter === 'today') {
      filtered = filtered.filter((j) => j.followUpAnalysis.urgency === 'DUE_TODAY');
    } else if (filter === 'actionable') {
      filtered = filtered.filter((j) => isActionRequiredToday(j.followUpAnalysis.urgency));
    } else if (filter === 'upcoming') {
      filtered = filtered.filter((j) => j.followUpAnalysis.urgency === 'UPCOMING');
    } else if (filter === 'completed') {
      filtered = filtered.filter((j) => j.status === 'COMPLETED');
    } else if (filter === 'lost') {
      filtered = filtered.filter((j) => j.status === 'LOST');
    }

    // Sort today's actions queue
    const sortedActions = sortJobsByActionPriority(
      analyzedJobs.filter((j) => isActionRequiredToday(j.followUpAnalysis.urgency)),
      now
    );

    return NextResponse.json({
      success: true,
      metrics: {
        total: totalCount,
        overdueCount: overdueJobs.length,
        dueTodayCount: dueTodayJobs.length,
        upcomingCount: upcomingJobs.length,
        completedCount: completedJobs.length,
        lostCount: lostJobs.length,
        attentionNeededCount: overdueJobs.length + dueTodayJobs.length,
        potentialRevenue,
      },
      todayActions: sortedActions,
      jobs: filtered,
    });
  } catch (error) {
    console.error('Error in GET /api/jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve service jobs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = JobCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check if customer already exists by phone or company
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: data.phone },
          { company: { equals: data.company } },
        ],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.customerName,
          company: data.company,
          phone: data.phone,
          email: data.email || null,
          address: data.address || null,
        },
      });
    }

    // Parse next follow up date or default to end of day today if urgent
    let followUpDate: Date | null = null;
    if (data.nextFollowUpAt) {
      followUpDate = new Date(data.nextFollowUpAt);
    } else if (data.priority === 'URGENT') {
      const today = new Date();
      followUpDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0, 0);
    }

    const newJob = await prisma.job.create({
      data: {
        customerId: customer.id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        estimatedValue: data.estimatedValue,
        source: data.source,
        nextFollowUpAt: followUpDate,
        assignedTechnician: data.assignedTechnician || null,
        activities: {
          create: [
            {
              type: 'LEAD_CREATED',
              description: `Lead created via ${data.source}. Initial estimated value: $${data.estimatedValue.toLocaleString()}.`,
            },
          ],
        },
      },
      include: {
        customer: true,
        activities: true,
      },
    });

    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { success: false, error: 'Database error creating job' },
      { status: 500 }
    );
  }
}
