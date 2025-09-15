import sql from "@/app/api/utils/sql";

// GET - List bookings with optional filters
export async function GET(request) {
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
}

// POST - Create new booking
export async function POST(request) {
  try {
    const { user_id, service_id, booking_date, start_time, notes } = await request.json();
    
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
    
    const booking = await sql`
      INSERT INTO bookings (user_id, service_id, booking_date, start_time, notes)
      VALUES (${user_id || 'demo-user'}, ${service_id}, ${booking_date}, ${start_time}, ${notes})
      RETURNING *
    `;
    
    return Response.json({ booking: booking[0] });
  } catch (error) {
    console.error('Error creating booking:', error);
    return Response.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}