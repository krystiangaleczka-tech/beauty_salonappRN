import { google } from 'googleapis';

export function getGoogleCalendarClient() {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Calendar API key not configured');
  }

  // For read-only operations, API key is sufficient
  // For write operations, we need OAuth 2.0
  return google.calendar({
    version: 'v3',
    auth: apiKey
  });
}

export function getGoogleCalendarClientWithAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  const auth = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/google-calendar/auth/callback`
  );

  return { auth, calendar: google.calendar({ version: 'v3', auth }) };
}

export function getCalendarId() {
  return process.env.GOOGLE_CALENDAR_ID || 'primary';
}

export async function createCalendarEvent(calendar, eventData) {
  try {
    const calendarId = getCalendarId();
    const response = await calendar.events.insert({
      calendarId: calendarId,
      resource: eventData,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

export async function updateCalendarEvent(calendar, eventId, eventData) {
  try {
    const calendarId = getCalendarId();
    const response = await calendar.events.update({
      calendarId: calendarId,
      eventId: eventId,
      resource: eventData,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
}

export async function deleteCalendarEvent(calendar, eventId) {
  try {
    const calendarId = getCalendarId();
    await calendar.events.delete({
      calendarId: calendarId,
      eventId: eventId,
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
}

export async function getCalendarEvents(calendar, timeMin, timeMax) {
  try {
    const calendarId = getCalendarId();
    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Error getting calendar events:', error);
    throw error;
  }
}