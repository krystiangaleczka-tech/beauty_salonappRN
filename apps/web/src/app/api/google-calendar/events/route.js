import { getGoogleCalendarClient } from '../utils/client.js';
import { formatBookingToCalendarEvent, extractBookingIdFromEvent } from '../utils/event-formatter.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');

    if (!process.env.GOOGLE_CALENDAR_API_KEY) {
      return Response.json({ error: 'Google Calendar API not configured' }, { status: 400 });
    }

    const calendar = getGoogleCalendarClient();
    const events = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return Response.json({ 
      success: true, 
      events: events.data.items || [] 
    });
  } catch (error) {
    console.error('Error getting calendar events:', error);
    return Response.json({ error: 'Failed to get calendar events' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const booking = await request.json();

    if (!booking || !booking.id || !booking.date || !booking.time) {
      return Response.json({ error: 'Invalid booking data' }, { status: 400 });
    }

    if (!process.env.GOOGLE_CALENDAR_API_KEY) {
      return Response.json({ error: 'Google Calendar API not configured' }, { status: 400 });
    }

    // For now, return a success response without actual API call
    // OAuth 2.0 setup is required for write operations
    console.log('Would create calendar event for booking:', booking);
    
    return Response.json({ 
      success: true, 
      message: 'Calendar event creation simulated (OAuth 2.0 setup required for actual API calls)',
      event: {
        id: `simulated-${booking.id}`,
        summary: `Appointment: ${booking.service_name}`,
        start: {
          dateTime: `${booking.date}T${booking.time}`,
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: new Date(new Date(`${booking.date}T${booking.time}`).getTime() + (booking.duration * 60 * 1000)).toISOString(),
          timeZone: 'America/New_York'
        }
      }
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return Response.json({ error: 'Failed to create calendar event' }, { status: 500 });
  }
}