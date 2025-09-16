import sql from "@/app/api/utils/sql";
import { withAuth, authenticateRequest } from "@/app/api/utils/authMiddleware";

// GET - List bookings with optional filters
export const GET = withAuth(async (request) => {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const status = url.searchParams.get('status');
    
    let query = `
      SELECT 
        b.*,
        s.name as service_name,
        s.duration_minutes,
        s.price
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    // If user is not admin, only show their own bookings
    if (!request.user.isAdmin) {
      paramCount++;
      query += ` AND b.user_id = $${paramCount}`;
      params.push(request.user.id);
    }
    
    if (date) {
      paramCount++;
      query += ` AND b.booking_date = $${paramCount}`;
      params.push(date);
    }
    
    if (status) {
      paramCount++;
      query += ` AND b.status = $${paramCount}`;
      params.push(status);
    }
    
    query += ` ORDER BY b.booking_date DESC, b.start_time ASC`;
    
    const bookings = await sql(query, params);
    
    return Response.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return Response.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
});

// POST - Create new booking
export const POST = async (request) => {
  try {
    const { service_id, booking_date, start_time, notes, user_info } = await request.json();
    
    if (!service_id || !booking_date || !start_time) {
      return Response.json({ error: 'Service, date, and time are required' }, { status: 400 });
    }
    
    // Check if time slot is available
    const existingBooking = await sql`
      SELECT id FROM bookings 
      WHERE booking_date = ${booking_date} 
      AND start_time = ${start_time}
      AND status != 'cancelled'
    `;
    
    if (existingBooking.length > 0) {
      return Response.json({ error: 'Time slot not available' }, { status: 409 });
    }
    
    // Try to authenticate the user
    const authResult = await authenticateRequest(request);
    let userId = null;
    
    if (authResult.isAuthenticated) {
      // Use authenticated user's ID
      userId = authResult.user.id;
    } else if (user_info && user_info.email) {
      // For unauthenticated users, check if user exists by email
      const existingUser = await sql`
        SELECT id FROM users 
        WHERE email = ${user_info.email}
      `;
      
      if (existingUser.length > 0) {
        // Use existing user's ID
        userId = existingUser[0].id;
      } else {
        // Create a new user
        const newUser = await sql`
          INSERT INTO users (name, email, phone)
          VALUES (${user_info.name}, ${user_info.email}, ${user_info.phone})
          RETURNING id
        `;
        userId = newUser[0].id;
      }
    } else {
      return Response.json({ error: 'User information is required' }, { status: 400 });
    }
    
    const booking = await sql`
      INSERT INTO bookings (user_id, service_id, booking_date, start_time, notes)
      VALUES (${userId}, ${service_id}, ${booking_date}, ${start_time}, ${notes})
      RETURNING *
    `;
    
    return Response.json({ booking: booking[0] });
  } catch (error) {
    console.error('Error creating booking:', error);
    return Response.json({ error: 'Failed to create booking' }, { status: 500 });
  }
};