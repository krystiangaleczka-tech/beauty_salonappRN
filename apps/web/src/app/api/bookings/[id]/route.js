import sql from "@/app/api/utils/sql";
import { withAuth, checkResourcePermission } from "@/app/api/utils/authMiddleware";

// GET - Get a single booking by ID
export const GET = withAuth(async (request, { params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return Response.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    
    // Get the booking
    const booking = await sql`
      SELECT 
        b.*,
        s.name as service_name,
        s.duration_minutes,
        s.price
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ${id}
    `;
    
    if (booking.length === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    // Check if user has permission to access this booking
    const hasPermission = await checkResourcePermission(request, 'booking', id);
    if (!hasPermission) {
      return Response.json({ error: 'Forbidden: You do not have permission to access this booking' }, { status: 403 });
    }
    
    return Response.json({ booking: booking[0] });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return Response.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
});

// PATCH - Update booking status
export const PATCH = withAuth(async (request, { params }) => {
  try {
    const { id } = params;
    const { status, notes } = await request.json();
    
    if (!id) {
      return Response.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    
    if (!status) {
      return Response.json({ error: 'Status is required' }, { status: 400 });
    }
    
    // Check if user has permission to update this booking
    const hasPermission = await checkResourcePermission(request, 'booking', id);
    if (!hasPermission) {
      return Response.json({ error: 'Forbidden: You do not have permission to update this booking' }, { status: 403 });
    }
    
    // Update the booking
    const booking = await sql`
      UPDATE bookings 
      SET status = ${status}, notes = ${notes || ''}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (booking.length === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    return Response.json({ booking: booking[0] });
  } catch (error) {
    console.error('Error updating booking:', error);
    return Response.json({ error: 'Failed to update booking' }, { status: 500 });
  }
});

// PUT - Update entire booking
export const PUT = withAuth(async (request, { params }) => {
  try {
    const { id } = params;
    const { service_id, booking_date, start_time, notes } = await request.json();
    
    if (!id) {
      return Response.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    
    if (!service_id || !booking_date || !start_time) {
      return Response.json({ error: 'Service, date, and time are required' }, { status: 400 });
    }
    
    // Check if user has permission to update this booking
    const hasPermission = await checkResourcePermission(request, 'booking', id);
    if (!hasPermission) {
      return Response.json({ error: 'Forbidden: You do not have permission to update this booking' }, { status: 403 });
    }
    
    // Check if time slot is available (excluding current booking)
    const existingBooking = await sql`
      SELECT id FROM bookings 
      WHERE booking_date = ${booking_date} 
      AND start_time = ${start_time}
      AND status != 'cancelled'
      AND id != ${id}
    `;
    
    if (existingBooking.length > 0) {
      return Response.json({ error: 'Time slot not available' }, { status: 409 });
    }
    
    // Update the booking
    const booking = await sql`
      UPDATE bookings 
      SET service_id = ${service_id}, 
          booking_date = ${booking_date}, 
          start_time = ${start_time}, 
          notes = ${notes || ''}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (booking.length === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    return Response.json({ booking: booking[0] });
  } catch (error) {
    console.error('Error updating booking:', error);
    return Response.json({ error: 'Failed to update booking' }, { status: 500 });
  }
});

// DELETE - Cancel a booking
export const DELETE = withAuth(async (request, { params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return Response.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    
    // Check if user has permission to delete this booking
    const hasPermission = await checkResourcePermission(request, 'booking', id);
    if (!hasPermission) {
      return Response.json({ error: 'Forbidden: You do not have permission to cancel this booking' }, { status: 403 });
    }
    
    // Check if booking exists
    const existingBooking = await sql`
      SELECT * FROM bookings WHERE id = ${id}
    `;
    
    if (existingBooking.length === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    // Update booking status to cancelled
    const booking = await sql`
      UPDATE bookings 
      SET status = 'cancelled'
      WHERE id = ${id}
      RETURNING *
    `;
    
    return Response.json({ 
      success: true, 
      message: 'Booking cancelled successfully',
      booking: booking[0]
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return Response.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
});