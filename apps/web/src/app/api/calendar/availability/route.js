import sql from "@/app/api/utils/sql";

// GET - Check available time slots for a specific date
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const serviceId = url.searchParams.get('service_id');
    
    if (!date) {
      return Response.json({ error: 'Date is required' }, { status: 400 });
    }
    
    // Get business hours
    const businessSettings = await sql`
      SELECT opening_hours FROM business_settings LIMIT 1
    `;
    
    const openingHours = businessSettings[0]?.opening_hours || {};
    
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayHours = openingHours[dayName];
    
    if (!dayHours || dayHours.closed) {
      return Response.json({ availableSlots: [] });
    }
    
    // Get existing bookings for the date
    const existingBookings = await sql`
      SELECT start_time, duration_minutes 
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE booking_date = ${date} 
      AND status != 'cancelled'
    `;
    
    // Get service duration if specified
    let serviceDuration = 60; // default
    if (serviceId) {
      const service = await sql`
        SELECT duration_minutes FROM services WHERE id = ${serviceId}
      `;
      if (service[0]) {
        serviceDuration = service[0].duration_minutes;
      }
    }
    
    // Generate available time slots
    const availableSlots = generateTimeSlots(
      dayHours.open,
      dayHours.close,
      serviceDuration,
      existingBookings
    );
    
    return Response.json({ availableSlots });
  } catch (error) {
    console.error('Error checking availability:', error);
    return Response.json({ error: 'Failed to check availability' }, { status: 500 });
  }
}

function generateTimeSlots(openTime, closeTime, serviceDuration, existingBookings) {
  const slots = [];
  const openHour = parseInt(openTime.split(':')[0]);
  const openMinute = parseInt(openTime.split(':')[1]);
  const closeHour = parseInt(closeTime.split(':')[0]);
  const closeMinute = parseInt(closeTime.split(':')[1]);
  
  let currentHour = openHour;
  let currentMinute = openMinute;
  
  while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
    const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Check if this slot conflicts with existing bookings
    const isAvailable = !existingBookings.some(booking => {
      const bookingStart = booking.start_time;
      const bookingDuration = booking.duration_minutes;
      
      // Convert time to minutes for easier comparison
      const slotMinutes = currentHour * 60 + currentMinute;
      const bookingStartMinutes = parseInt(bookingStart.split(':')[0]) * 60 + parseInt(bookingStart.split(':')[1]);
      const bookingEndMinutes = bookingStartMinutes + bookingDuration;
      const slotEndMinutes = slotMinutes + serviceDuration;
      
      // Check for overlap
      return (slotMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes);
    });
    
    if (isAvailable) {
      // Make sure the service can finish before closing time
      const slotEndMinutes = (currentHour * 60 + currentMinute) + serviceDuration;
      const closeMinutes = closeHour * 60 + closeMinute;
      
      if (slotEndMinutes <= closeMinutes) {
        slots.push(timeSlot);
      }
    }
    
    // Move to next 30-minute slot
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentMinute = 0;
      currentHour += 1;
    }
  }
  
  return slots;
}