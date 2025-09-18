import { getGoogleCalendarClient } from '../utils/client.js';
import { formatAvailabilityToCalendarEvents } from '../utils/event-formatter.js';

export async function POST(request) {
  try {
    const { user_id, availability } = await request.json();

    if (!user_id || !availability) {
      return Response.json({ error: 'User ID and availability data are required' }, { status: 400 });
    }

    const GOOGLE_CALENDAR_API_KEY = process.env.GOOGLE_CALENDAR_API_KEY;
    const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

    if (!GOOGLE_CALENDAR_API_KEY) {
      console.log('Google Calendar API credentials not configured');
      return Response.json({ 
        success: true, 
        message: 'Availability saved locally. Google Calendar sync requires API configuration.',
        synced: false 
      });
    }

    try {
      const calendar = getGoogleCalendarClient();
      const calendarEvents = formatAvailabilityToCalendarEvents(availability);

      // Create recurring events for each available day
      const createdEvents = [];
      for (const event of calendarEvents) {
        const createdEvent = await calendar.events.insert({
          calendarId: GOOGLE_CALENDAR_ID || 'primary',
          resource: event,
        });
        createdEvents.push(createdEvent.data);
      }

      console.log(`Created ${createdEvents.length} availability events in Google Calendar`);

      return Response.json({ 
        success: true, 
        message: 'Availability synced with Google Calendar successfully',
        synced: true,
        events_created: createdEvents.length
      });
    } catch (calendarError) {
      console.error('Google Calendar sync error:', calendarError);
      return Response.json({ 
        success: true, 
        message: 'Availability saved locally, but Google Calendar sync failed',
        synced: false,
        error: calendarError.message
      });
    }
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    return Response.json({ error: 'Failed to sync with Google Calendar' }, { status: 500 });
  }
}