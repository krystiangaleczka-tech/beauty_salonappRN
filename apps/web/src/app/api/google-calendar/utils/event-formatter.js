export function formatBookingToCalendarEvent(booking) {
  const startTime = new Date(booking.date + 'T' + booking.time);
  const endTime = new Date(startTime.getTime() + (booking.duration * 60 * 1000));

  return {
    summary: `Appointment: ${booking.service_name}`,
    description: `Client: ${booking.client_name}\nPhone: ${booking.client_phone}\nService: ${booking.service_name}\nDuration: ${booking.duration} minutes`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'America/New_York',
    },
    location: booking.location || 'Beauty Salon',
    status: 'confirmed',
    extendedProperties: {
      private: {
        booking_id: booking.id,
        client_id: booking.client_id,
        service_id: booking.service_id,
      },
    },
  };
}

export function formatAvailabilityToCalendarEvents(availability) {
  return availability
    .filter(day => day.is_available)
    .map(day => ({
      summary: 'Available for appointments',
      description: 'Working hours - available for booking',
      start: {
        dateTime: `2024-01-01T${day.start_time}`,
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: `2024-01-01T${day.end_time}`,
        timeZone: 'America/New_York',
      },
      recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${getDayCode(day.day_of_week)}`],
      transparency: 'transparent',
      status: 'confirmed',
    }));
}

function getDayCode(dayOfWeek) {
  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  return days[dayOfWeek];
}

export function extractBookingIdFromEvent(event) {
  return event.extendedProperties?.private?.booking_id;
}