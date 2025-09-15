// GET - Admin dashboard data (Mock data for demo)
export async function GET() {
  try {
    // Mock today's appointments
    const todayAppointments = [
      {
        id: 1,
        booking_date: new Date().toISOString().split('T')[0],
        start_time: '09:00:00',
        service_name: 'Hair Cut & Style',
        duration_minutes: 60,
        price: 75.00,
        status: 'confirmed',
        customer_name: 'Sarah Johnson',
        notes: 'Regular customer, prefers shorter layers'
      },
      {
        id: 2,
        booking_date: new Date().toISOString().split('T')[0],
        start_time: '11:30:00',
        service_name: 'Hair Coloring',
        duration_minutes: 120,
        price: 150.00,
        status: 'confirmed',
        customer_name: 'Mike Chen',
        notes: 'First time coloring, going for natural brown'
      },
      {
        id: 3,
        booking_date: new Date().toISOString().split('T')[0],
        start_time: '14:00:00',
        service_name: 'Beard Trim',
        duration_minutes: 30,
        price: 25.00,
        status: 'confirmed',
        customer_name: 'David Wilson',
        notes: 'Monthly maintenance'
      }
    ];

    // Mock weekly stats
    const weeklyStats = {
      total_bookings: 24,
      total_revenue: 2850.00,
      unique_customers: 18
    };

    // Mock upcoming appointments
    const upcomingAppointments = [
      {
        id: 4,
        booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        start_time: '10:00:00',
        service_name: 'Hair Cut & Style',
        duration_minutes: 60,
        price: 75.00,
        status: 'confirmed',
        customer_name: 'Emma Davis',
        notes: 'Birthday special request'
      },
      {
        id: 5,
        booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        start_time: '15:30:00',
        service_name: 'Hair Coloring',
        duration_minutes: 120,
        price: 150.00,
        status: 'confirmed',
        customer_name: 'Lisa Thompson',
        notes: 'Touch-up and highlights'
      },
      {
        id: 6,
        booking_date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
        start_time: '09:30:00',
        service_name: 'Beard Trim',
        duration_minutes: 30,
        price: 25.00,
        status: 'confirmed',
        customer_name: 'James Rodriguez',
        notes: 'Quick trim before event'
      }
    ];

    // Mock popular services
    const popularServices = [
      { name: 'Hair Cut & Style', booking_count: 12 },
      { name: 'Hair Coloring', booking_count: 8 },
      { name: 'Beard Trim', booking_count: 6 },
      { name: 'Hair Wash', booking_count: 4 },
      { name: 'Styling', booking_count: 3 }
    ];

    return Response.json({
      todayAppointments,
      weeklyStats,
      upcomingAppointments,
      popularServices
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return Response.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
