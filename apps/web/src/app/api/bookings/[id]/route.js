import sql from "@/app/api/utils/sql";

// PATCH - Update booking status
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { status, notes } = await request.json();
    
    if (!id) {
      return Response.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    
    if (!status) {
      return Response.json({ error: 'Status is required' }, { status: 400 });
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
}