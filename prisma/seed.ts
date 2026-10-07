import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing records...');
  await prisma.activity.deleteMany();
  await prisma.job.deleteMany();
  await prisma.customer.deleteMany();

  console.log('Seeding customers and refrigeration jobs...');

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
  const todayAfternoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30, 0);
  const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  // 1. ABC Restaurant - OVERDUE (The $2,000 lost freezer scenario from transcript)
  const abc = await prisma.customer.create({
    data: {
      name: 'Robert Miller',
      company: 'ABC Restaurant',
      phone: '(555) 234-8901',
      email: 'robert@abcrestaurant.com',
      address: '742 Evergreen Terrace, Downtown',
      jobs: {
        create: {
          title: 'Walk-in Freezer Repair (Holding at 42°F)',
          description:
            'Biddle walk-in freezer stopped pulling down past 42°F. Meat and ice cream at risk. Technician Mike inspected on Monday and found bad txv valve and low refrigerant charge.',
          status: 'QUOTE_SENT',
          priority: 'URGENT',
          estimatedValue: 2000,
          source: 'PHONE',
          nextFollowUpAt: yesterday, // Overdue by 1 day
          assignedTechnician: 'Mike',
          activities: {
            create: [
              {
                type: 'LEAD_CREATED',
                description: 'Emergency phone call received: Freezer holding at 42°F.',
                createdAt: threeDaysAgo,
              },
              {
                type: 'NOTE',
                description: 'Mike dispatched for diagnostic inspection. TXV valve failing.',
                createdAt: twoDaysAgo,
              },
              {
                type: 'QUOTE_SENT',
                description: 'Sent formal quote for $2,000 (TXV valve replacement + 404A recharge).',
                createdAt: twoDaysAgo,
              },
            ],
          },
        },
      },
    },
  });

  // 2. Metro Foods - OVERDUE
  const metro = await prisma.customer.create({
    data: {
      name: 'Sandra Evans',
      company: 'Metro Foods Supermarket',
      phone: '(555) 871-3420',
      email: 'sevans@metrofoods.com',
      address: '1200 Grand Ave, Suite 4',
      jobs: {
        create: {
          title: '3-Door Dairy Reach-in Display Temp Spike',
          description:
            'Display cooler fluctuating between 45°F and 52°F. Condenser fans running intermittently. Sent quote yesterday morning.',
          status: 'WAITING_ON_YES',
          priority: 'HIGH',
          estimatedValue: 1350,
          source: 'WEBSITE',
          nextFollowUpAt: twoDaysAgo, // Overdue by 2 days
          assignedTechnician: 'Sarah',
          activities: {
            create: [
              {
                type: 'LEAD_CREATED',
                description: 'Website contact form submitted: Dairy display warm.',
                createdAt: threeDaysAgo,
              },
              {
                type: 'QUOTE_SENT',
                description: 'Emailed quote of $1,350 for condenser fan motor and digital thermostat swap.',
                createdAt: twoDaysAgo,
              },
            ],
          },
        },
      },
    },
  });

  // 3. Burger House - DUE TODAY
  const burger = await prisma.customer.create({
    data: {
      name: 'Marcus Vance',
      company: 'Burger House',
      phone: '(555) 432-9876',
      email: 'manager@burgerhousegrill.com',
      address: '405 Pine Street, Midtown',
      jobs: {
        create: {
          title: 'Walk-in Freezer Compressor Making Loud Grinding Noise',
          description:
            'Freezer still holding temperature but compressor is grinding loudly during cycle start. Needs diagnostic quote before weekend lunch rush.',
          status: 'NEEDS_QUOTE',
          priority: 'HIGH',
          estimatedValue: 2500,
          source: 'PHONE',
          nextFollowUpAt: todayMorning, // Due today
          assignedTechnician: 'Dave',
          activities: {
            create: [
              {
                type: 'LEAD_CREATED',
                description: 'Marcus called cell: loud compressor grinding noise on walk-in.',
                createdAt: yesterday,
              },
              {
                type: 'NOTE',
                description: 'Dave visited on way back from Downtown. Suspects bearing failure or damaged scroll.',
                createdAt: yesterday,
              },
            ],
          },
        },
      },
    },
  });

  // 4. Fresh Market - DUE TODAY
  const fresh = await prisma.customer.create({
    data: {
      name: 'Elena Rostova',
      company: 'Fresh Market Co.',
      phone: '(555) 901-2345',
      email: 'elena@freshmarketlocal.com',
      address: '88 Market Way',
      jobs: {
        create: {
          title: 'Manitowoc Ice Machine Water Leak & Low Production',
          description:
            'Cube ice machine leaking from water curtain and harvest cycle taking twice as long. Quoted $1,500 for water pump + harvest sensor rebuild.',
          status: 'WAITING_ON_YES',
          priority: 'MEDIUM',
          estimatedValue: 1500,
          source: 'TEXT',
          nextFollowUpAt: todayAfternoon, // Due today
          assignedTechnician: 'Mike',
          activities: {
            create: [
              {
                type: 'LEAD_CREATED',
                description: 'Elena texted Denise directly: Ice machine leaking onto kitchen tile.',
                createdAt: twoDaysAgo,
              },
              {
                type: 'QUOTE_SENT',
                description: 'Sent $1,500 quote via text message. Elena said she would check with owner today.',
                createdAt: yesterday,
              },
            ],
          },
        },
      },
    },
  });

  // 5. Oakridge Nursing Home - DUE TODAY
  const oakridge = await prisma.customer.create({
    data: {
      name: 'Patricia Clark',
      company: 'Oakridge Senior Living',
      phone: '(555) 678-1122',
      email: 'pclark@oakridgecare.org',
      address: '550 Heritage Blvd',
      jobs: {
        create: {
          title: 'Dietary Kitchen Milk Cooler Gasket & Sensor Failure',
          description:
            'Reach-in milk cooler alarm buzzing constantly. Temperature sensor faulty and magnetic door seal torn.',
          status: 'NEW',
          priority: 'URGENT',
          estimatedValue: 1100,
          source: 'PHONE',
          nextFollowUpAt: todayMorning, // Due today
          assignedTechnician: 'Carlos',
          activities: {
            create: [
              {
                type: 'LEAD_CREATED',
                description: 'Call from dietary supervisor: Milk cooler temp alarm ringing, health inspector coming Friday.',
                createdAt: yesterday,
              },
            ],
          },
        },
      },
    },
  });

  // 6. Golden Wok Diner - UPCOMING
  const goldenWok = await prisma.customer.create({
    data: {
      name: 'David Chen',
      company: 'Golden Wok Diner',
      phone: '(555) 345-6789',
      email: 'dchen@goldenwok.net',
      address: '19 Commercial Ave',
      jobs: {
        create: {
          title: 'Line Prep Cooler Coil Cleaning & Defrost Cycle Tune-up',
          description:
            'Two sandwich prep tables struggling during dinner rushes. Needs condenser wash and defrost thermostat calibration.',
          status: 'QUOTE_SENT',
          priority: 'LOW',
          estimatedValue: 850,
          source: 'REFERRAL',
          nextFollowUpAt: tomorrow, // Upcoming tomorrow
          assignedTechnician: 'Carlos',
          activities: {
            create: [
              {
                type: 'LEAD_CREATED',
                description: 'Referral from Robert Miller at ABC Restaurant.',
                createdAt: twoDaysAgo,
              },
              {
                type: 'QUOTE_SENT',
                description: 'Provided preventative maintenance quote of $850 for both units.',
                createdAt: yesterday,
              },
            ],
          },
        },
      },
    },
  });

  // 7. Harbor Seafood - UPCOMING
  const harbor = await prisma.customer.create({
    data: {
      name: 'Captain Tom Briggs',
      company: 'Harbor Seafood Wholesale',
      phone: '(555) 789-0123',
      email: 'orders@harborseafoodco.com',
      address: '14 Pier 7 Terminal',
      jobs: {
        create: {
          title: 'Blast Freezer Defrost Heater & Gasket Overhaul',
          description:
            'Heavy frost accumulation on evaporator coils in freezer #2. Heater element dead, coils encased in solid ice block.',
          status: 'WAITING_ON_YES',
          priority: 'HIGH',
          estimatedValue: 3200,
          source: 'REPEAT',
          nextFollowUpAt: twoDaysLater, // Upcoming in 2 days
          assignedTechnician: 'Mike',
          activities: {
            create: [
              {
                type: 'LEAD_CREATED',
                description: 'Tom called: Blast freezer ice buildup needs overhaul.',
                createdAt: threeDaysAgo,
              },
              {
                type: 'QUOTE_SENT',
                description: 'Sent commercial defrost heater replacement quote ($3,200).',
                createdAt: yesterday,
              },
            ],
          },
        },
      },
    },
  });

  // 8. Joe's Deli - SCHEDULED
  const joesDeli = await prisma.customer.create({
    data: {
      name: 'Joe Pantoliano',
      company: "Joe's Deli & Market",
      phone: '(555) 567-8901',
      email: 'joe@joesdeli.com',
      address: '310 Main Street',
      jobs: {
        create: {
          title: 'Walk-in Cooler Evaporator Fan Motor Replacement',
          description:
            'Single phase 115V fan motor seized. Quote approved by Joe yesterday afternoon. Parts ordered from Carrier distributor.',
          status: 'SCHEDULED',
          priority: 'MEDIUM',
          estimatedValue: 750,
          source: 'REPEAT',
          nextFollowUpAt: tomorrow,
          assignedTechnician: 'Mike',
          activities: {
            create: [
              {
                type: 'LEAD_CREATED',
                description: 'Joe texted Denise on cell: walk-in cooler fan stopped spinning.',
                createdAt: threeDaysAgo,
              },
              {
                type: 'QUOTE_SENT',
                description: 'Quoted $750 for OEM motor and installation.',
                createdAt: twoDaysAgo,
              },
              {
                type: 'STATUS_CHANGED',
                description: 'Joe approved quote. Job scheduled for Mike on Thursday morning.',
                createdAt: yesterday,
              },
            ],
          },
        },
      },
    },
  });

  // 9. Artisan Bakery - SCHEDULED
  const bakery = await prisma.customer.create({
    data: {
      name: 'Claire Dupont',
      company: 'Artisan Sourdough Bakery',
      phone: '(555) 654-3210',
      email: 'claire@artisansourdough.com',
      address: '88 Baker Row',
      jobs: {
        create: {
          title: 'Glycol Chiller Temperature Controller Replacement',
          description:
            'Digital controller shorted out due to water spray during washdown. Replacement Ranco unit in truck inventory.',
          status: 'SCHEDULED',
          priority: 'HIGH',
          estimatedValue: 1800,
          source: 'PHONE',
          nextFollowUpAt: tomorrow,
          assignedTechnician: 'Carlos',
          activities: {
            create: [
              {
                type: 'LEAD_CREATED',
                description: 'Emergency phone call: dough temperature critical for overnight fermentation.',
                createdAt: yesterday,
              },
              {
                type: 'STATUS_CHANGED',
                description: 'Customer approved $1,800 estimate over phone. Carlos assigned for 8:30 AM arrival.',
                createdAt: yesterday,
              },
            ],
          },
        },
      },
    },
  });

  // 10. Walmart Distribution - COMPLETED
  const walmart = await prisma.customer.create({
    data: {
      name: 'Frank Kowalski',
      company: 'Walmart Regional Logistics Center #408',
      phone: '(555) 999-4400',
      email: 'fkowalski@logistics.walmart.com',
      address: '500 Logistics Parkway',
      jobs: {
        create: {
          title: 'Cold Storage Central Rack Quarterly Safety Inspection',
          description:
            'Comprehensive inspection of 4 screw compressors, oil separators, and computerized receiver pressure relief valves.',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          estimatedValue: 4500,
          source: 'REPEAT',
          nextFollowUpAt: null,
          assignedTechnician: 'Dave',
          activities: {
            create: [
              {
                type: 'LEAD_CREATED',
                description: 'Quarterly maintenance contract work order generated.',
                createdAt: threeDaysAgo,
              },
              {
                type: 'STATUS_CHANGED',
                description: 'Dave completed 8-hour safety inspection. Signed off by facility manager.',
                createdAt: yesterday,
              },
              {
                type: 'FOLLOW_UP_COMPLETED',
                description: 'Inspection checklist and report delivered to Frank Kowalski.',
                createdAt: yesterday,
              },
            ],
          },
        },
      },
    },
  });

  // 11. Green Grocer - COMPLETED
  const greengrocer = await prisma.customer.create({
    data: {
      name: 'Liam O’Connor',
      company: 'The Green Grocer',
      phone: '(555) 321-7654',
      email: 'liam@thegreengrocer.org',
      address: '22 Farmstead Lane',
      jobs: {
        create: {
          title: 'Produce Display Case Condensate Pump Replacement',
          description:
            'Pump clogged with organic debris and overflowing onto aisle floor. Replaced with heavy-duty Little Giant condensate pump.',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          estimatedValue: 1200,
          source: 'WEBSITE',
          nextFollowUpAt: null,
          assignedTechnician: 'Sarah',
          activities: {
            create: [
              {
                type: 'LEAD_CREATED',
                description: 'Website inquiry: Water overflowing from produce case.',
                createdAt: threeDaysAgo,
              },
              {
                type: 'STATUS_CHANGED',
                description: 'Sarah installed new pump and cleaned drainage lines. Tested and working.',
                createdAt: yesterday,
              },
            ],
          },
        },
      },
    },
  });

  // 12. Corner Pizza - LOST (The cost of a missed follow-up)
  const cornerPizza = await prisma.customer.create({
    data: {
      name: 'Tony Ricci',
      company: 'Corner Pizza & Subs',
      phone: '(555) 456-7890',
      email: 'tony@cornerpizzasubs.com',
      address: '180 Elm Street',
      jobs: {
        create: {
          title: 'Reach-in Pizza Prep Table Thermostat Replacement',
          description:
            'Tony called last week when cheese was softening. Quote was not followed up in 48 hours; Tony hired competitor who answered immediately.',
          status: 'LOST',
          priority: 'HIGH',
          estimatedValue: 900,
          source: 'PHONE',
          nextFollowUpAt: null,
          assignedTechnician: null,
          activities: {
            create: [
              {
                type: 'LEAD_CREATED',
                description: 'Tony called office line on Friday: prep table warm.',
                createdAt: threeDaysAgo,
              },
              {
                type: 'QUOTE_SENT',
                description: 'Quote drafted for $900.',
                createdAt: threeDaysAgo,
              },
              {
                type: 'STATUS_CHANGED',
                description:
                  'Customer lost: Tony called competitor after 48 hours without follow-up. Example of revenue leakage Denise wants to prevent.',
                createdAt: yesterday,
              },
            ],
          },
        },
      },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
