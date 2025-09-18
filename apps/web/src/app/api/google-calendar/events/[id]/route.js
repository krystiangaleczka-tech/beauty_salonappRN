import { getGoogleCalendarClient } from '../../utils/client.js';
import { formatBookingToCalendarEvent } from '../../utils/event-formatter.js';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const booking = await request.json();

    if (!booking || !booking.date || !booking.time) {
      return Response.json({ error: 'Invalid booking data' }, { status: 400 });
    }

    if (!process.env.GOOGLE_CALENDAR_API_KEY) {
      return Response.json({ error: 'Google Calendar API not configured' }, { status: 400 });
    }

    const calendar = getGoogleCalendarClient();
    const eventData = formatBookingToCalendarEvent(booking);
    
    const updatedEvent = await calendar.events.update({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId: id,
      resource: eventData,
    });

    console.log(`Updated calendar event ${id} for booking ${booking.id}`);

    return Response.json({ 
      success: true, 
      message: 'Calendar event updated successfully',
      event: updatedEvent.data 
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return Response.json({ error: 'Failed to update calendar event' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!process.env.GOOGLE_CALENDAR_API_KEY) {
      return Response.json({ error: 'Google Calendar API not configured' }, { status: 400 });
    }

    const calendar = getGoogleCalendarClient();
    
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId: id,
    });

    console.log(`Deleted calendar event ${id}`);

    return Response.json({ 
      success: true, 
      message: 'Calendar event deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return Response.json({ error: 'Failed to delete calendar event' }, { status: 500 });
  }
}