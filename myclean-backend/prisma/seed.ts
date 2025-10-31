import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.providerAvailability.deleteMany();
  await prisma.providerService.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'CUSTOMER',
      phone: '+61 400 123 456',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'CUSTOMER',
      phone: '+61 400 234 567',
    },
  });

  console.log('✅ Created 2 customers');

  // Create providers with profiles
  const provider1 = await prisma.user.create({
    data: {
      email: 'sarah.cleaner@example.com',
      name: 'Sarah Johnson',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'PROVIDER',
      phone: '+61 400 345 678',
      providerProfile: {
        create: {
          bio: 'Professional cleaner with 5+ years of experience. Specialized in deep cleaning and move-out services.',
          yearsExperience: '5-10',
          hasInsurance: true,
          insuranceProvider: 'CleanCare Insurance',
          hasVehicle: true,
          hasEquipment: true,
          certifications: 'Certified Professional Cleaner, First Aid',
          address: '123 Clean Street',
          city: 'Sydney',
          state: 'NSW',
          zipCode: '2000',
          serviceRadius: 15,
          isVerified: true,
          isActive: true,
          profileComplete: true,
          averageRating: 4.8,
          totalReviews: 45,
          totalBookings: 127,
        },
      },
    },
    include: {
      providerProfile: true,
    },
  });

  const provider2 = await prisma.user.create({
    data: {
      email: 'michael.cleaner@example.com',
      name: 'Michael Chen',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'PROVIDER',
      phone: '+61 400 456 789',
      providerProfile: {
        create: {
          bio: 'Reliable and efficient cleaning service. I take pride in making your space sparkle!',
          yearsExperience: '3-5',
          hasInsurance: true,
          insuranceProvider: 'SafeClean Insurance',
          hasVehicle: true,
          hasEquipment: true,
          certifications: 'Eco-Friendly Cleaning Certification',
          address: '456 Sparkle Ave',
          city: 'Melbourne',
          state: 'VIC',
          zipCode: '3000',
          serviceRadius: 20,
          isVerified: true,
          isActive: true,
          profileComplete: true,
          averageRating: 4.9,
          totalReviews: 38,
          totalBookings: 89,
        },
      },
    },
    include: {
      providerProfile: true,
    },
  });

  const provider3 = await prisma.user.create({
    data: {
      email: 'emma.cleaner@example.com',
      name: 'Emma Wilson',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'PROVIDER',
      phone: '+61 400 567 890',
      providerProfile: {
        create: {
          bio: 'Detail-oriented cleaner specializing in office and commercial spaces.',
          yearsExperience: '1-3',
          hasInsurance: false,
          hasVehicle: false,
          hasEquipment: true,
          address: '789 Pine Road',
          city: 'Brisbane',
          state: 'QLD',
          zipCode: '4000',
          serviceRadius: 10,
          isVerified: true,
          isActive: true,
          profileComplete: true,
          averageRating: 4.7,
          totalReviews: 22,
          totalBookings: 45,
        },
      },
    },
    include: {
      providerProfile: true,
    },
  });

  console.log('✅ Created 3 providers with profiles');

  // Create services for providers
  const services1 = await prisma.providerService.createMany({
    data: [
      {
        providerId: provider1.providerProfile!.id,
        serviceName: 'Regular Cleaning',
        description: 'General house cleaning including dusting, vacuuming, and mopping',
        pricePerHour: 4500, // $45/hour
        durationMin: 120, // 2 hours minimum
        isActive: true,
      },
      {
        providerId: provider1.providerProfile!.id,
        serviceName: 'Deep Cleaning',
        description: 'Thorough cleaning including baseboards, inside cabinets, and hard-to-reach areas',
        pricePerHour: 5500, // $55/hour
        durationMin: 180, // 3 hours minimum
        isActive: true,
      },
      {
        providerId: provider1.providerProfile!.id,
        serviceName: 'Move-out Cleaning',
        description: 'Complete end-of-lease cleaning to get your bond back',
        pricePerHour: 6000, // $60/hour
        durationMin: 240, // 4 hours minimum
        isActive: true,
      },
    ],
  });

  const services2 = await prisma.providerService.createMany({
    data: [
      {
        providerId: provider2.providerProfile!.id,
        serviceName: 'Regular Cleaning',
        description: 'Standard cleaning service for homes and apartments',
        pricePerHour: 4000, // $40/hour
        durationMin: 120,
        isActive: true,
      },
      {
        providerId: provider2.providerProfile!.id,
        serviceName: 'Deep Cleaning',
        description: 'Intensive cleaning for a fresh start',
        pricePerHour: 5000, // $50/hour
        durationMin: 180,
        isActive: true,
      },
      {
        providerId: provider2.providerProfile!.id,
        serviceName: 'Carpet Cleaning',
        description: 'Professional carpet shampooing and stain removal',
        pricePerHour: 5500,
        durationMin: 120,
        isActive: true,
      },
    ],
  });

  const services3 = await prisma.providerService.createMany({
    data: [
      {
        providerId: provider3.providerProfile!.id,
        serviceName: 'Office Cleaning',
        description: 'Professional cleaning for commercial spaces',
        pricePerHour: 4800,
        durationMin: 180,
        isActive: true,
      },
      {
        providerId: provider3.providerProfile!.id,
        serviceName: 'Regular Cleaning',
        description: 'Weekly or bi-weekly cleaning service',
        pricePerHour: 4200,
        durationMin: 120,
        isActive: true,
      },
    ],
  });

  console.log('✅ Created services for all providers');

  // Create availability for providers
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  
  for (const day of daysOfWeek) {
    await prisma.providerAvailability.create({
      data: {
        providerId: provider1.providerProfile!.id,
        dayOfWeek: day,
        startTime: '08:00',
        endTime: '18:00',
        isAvailable: true,
      },
    });

    await prisma.providerAvailability.create({
      data: {
        providerId: provider2.providerProfile!.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      },
    });
  }

  // Provider 3 works Monday to Friday only
  for (const day of ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']) {
    await prisma.providerAvailability.create({
      data: {
        providerId: provider3.providerProfile!.id,
        dayOfWeek: day,
        startTime: '07:00',
        endTime: '15:00',
        isAvailable: true,
      },
    });
  }

  console.log('✅ Created availability schedules');

  // Get service IDs for bookings
  const provider1Services = await prisma.providerService.findMany({
    where: { providerId: provider1.providerProfile!.id },
  });

  const provider2Services = await prisma.providerService.findMany({
    where: { providerId: provider2.providerProfile!.id },
  });

  // Create sample bookings
  const booking1 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      providerId: provider1.id,
      serviceId: provider1Services[0].id,
      bookingDate: new Date('2025-11-05'),
      startTime: '10:00',
      endTime: '12:00',
      address: '42 Smith Street',
      city: 'Sydney',
      state: 'NSW',
      zipCode: '2010',
      specialInstructions: 'Please bring eco-friendly products',
      status: 'ACCEPTED',
      totalPrice: 9000, // $90
      paymentStatus: 'PAID',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      customerId: customer2.id,
      providerId: provider1.id,
      serviceId: provider1Services[1].id,
      bookingDate: new Date('2025-11-08'),
      startTime: '14:00',
      endTime: '17:00',
      address: '15 Queen Avenue',
      city: 'Sydney',
      state: 'NSW',
      zipCode: '2015',
      specialInstructions: 'Focus on kitchen and bathrooms',
      status: 'PENDING',
      totalPrice: 16500, // $165
      paymentStatus: 'PENDING',
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      providerId: provider2.id,
      serviceId: provider2Services[0].id,
      bookingDate: new Date('2025-10-28'),
      startTime: '09:00',
      endTime: '11:00',
      address: '42 Smith Street',
      city: 'Sydney',
      state: 'NSW',
      zipCode: '2010',
      status: 'COMPLETED',
      totalPrice: 8000, // $80
      paymentStatus: 'PAID',
    },
  });

  console.log('✅ Created 3 sample bookings');

  // Create a review for completed booking
  await prisma.review.create({
    data: {
      bookingId: booking3.id,
      customerId: customer1.id,
      rating: 5,
      comment: 'Excellent service! Michael was punctual, professional, and did an amazing job. My house looks spotless!',
    },
  });

  console.log('✅ Created sample review');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: provider1.id,
        type: 'BOOKING_REQUEST',
        title: 'New Booking Request',
        message: 'Jane Smith has requested a Deep Cleaning service for Nov 8',
        isRead: false,
        link: '/provider/dashboard',
      },
      {
        userId: customer2.id,
        type: 'BOOKING_PENDING',
        title: 'Booking Request Sent',
        message: 'Your booking request with Sarah Johnson is pending approval',
        isRead: false,
        link: '/my-bookings',
      },
      {
        userId: customer1.id,
        type: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed',
        message: 'Your Regular Cleaning with Sarah Johnson for Nov 5 has been confirmed',
        isRead: true,
        link: '/my-bookings',
      },
    ],
  });

  console.log('✅ Created sample notifications');

  // Create sample messages
  await prisma.message.createMany({
    data: [
      {
        bookingId: booking1.id,
        senderId: customer1.id,
        receiverId: provider1.id,
        content: 'Hi Sarah, looking forward to the cleaning on Nov 5. Will you need access to the garage?',
        isRead: true,
      },
      {
        bookingId: booking1.id,
        senderId: provider1.id,
        receiverId: customer1.id,
        content: 'Hi John! Yes, if you could leave the garage unlocked that would be great. See you then!',
        isRead: true,
      },
    ],
  });

  console.log('✅ Created sample messages');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log('  - 2 Customers');
  console.log('  - 3 Providers (with complete profiles)');
  console.log('  - 8 Services');
  console.log('  - 17 Availability slots');
  console.log('  - 3 Bookings (1 completed, 1 accepted, 1 pending)');
  console.log('  - 1 Review');
  console.log('  - 3 Notifications');
  console.log('  - 2 Messages');
  console.log('\n🔑 Test Credentials:');
  console.log('  Customer: john.doe@example.com / password123');
  console.log('  Customer: jane.smith@example.com / password123');
  console.log('  Provider: sarah.cleaner@example.com / password123');
  console.log('  Provider: michael.cleaner@example.com / password123');
  console.log('  Provider: emma.cleaner@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
