import sql from '@/app/api/utils/sql';
import { withAuth } from '@/app/api/utils/authMiddleware';

export const GET = withAuth(async (request) => {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const serviceId = url.searchParams.get('service_id');
    
    if (!date) {
      return Response.json({ error: 'Date parameter is required' }, { status: 400 });
    }
    
    if (!serviceId) {
      return Response.json({ error: 'Service ID parameter is required' }, { status: 400 });
    }
    
    // Get service details to check duration
    const serviceResult = await sql`
      SELECT duration_minutes, price 
      FROM services 
      WHERE id = ${serviceId}
    `;
    
    if (serviceResult.length === 0) {
      return Response.json({ error: 'Service not found' }, { status: 404 });
    }
    
    const service = serviceResult[0];
    const durationMinutes = service.duration_minutes;
    
    // Get day of week from date (0 = Sunday, 1 = Monday, etc.)
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    // Get availability settings for this day of week
    const availabilityResult = await sql`
      SELECT start_time, end_time, is_available
      FROM availability_settings
      WHERE user_id = ${request.user.id} AND day_of_week = ${dayOfWeek}
    `;
    
    // If no availability settings for this day, use default (9-5, closed Sunday)
    let startTime = '09:00:00';
    let endTime = '17:00:00';
    let isAvailable = dayOfWeek !== 0; // Closed on Sunday
    
    if (availabilityResult.length > 0) {
      const availability = availabilityResult[0];
      startTime = availability.start_time;
      endTime = availability.end_time;
      isAvailable = availability.is_available;
    }
    
    // If not available for this day, return empty slots
    if (!isAvailable || !startTime || !endTime) {
      return Response.json({ 
        availableSlots: [],
        datesWithAvailability: [{ date, availability: 'none' }]
      });
    }
    
    // Generate time slots based on availability and service duration
    const availableSlots = [];
    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);
    
    // Convert to minutes for easier calculation
    const totalStartMinutes = startHour * 60 + startMinute;
    const totalEndMinutes = endHour * 60 + endMinute;
    
    // Get existing bookings for this date
    const bookingsResult = await sql`
      SELECT start_time, end_time
      FROM bookings
      WHERE 
        user_id = ${request.user.id} AND 
        booking_date = ${date} AND
        status NOT IN ('cancelled', 'completed')
    `;
    
    // Generate slots in 30-minute intervals (or service duration if longer)
    const slotInterval = Math.max(30, durationMinutes);
    
    for (let minutes = totalStartMinutes; minutes + durationMinutes <= totalEndMinutes; minutes += slotInterval) {
      const slotHour = Math.floor(minutes / 60);
      const slotMinute = minutes % 60;
      const slotEndTime = minutes + durationMinutes;
      const slotEndHour = Math.floor(slotEndTime / 60);
      const slotEndMinute = slotEndTime % 60;
      
      // Format time as HH:MM
      const slotTime = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
      const slotEnd = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`;
      
      // Check if this slot conflicts with existing bookings
      const isSlotAvailable = !bookingsResult.some(booking => {
        const bookingStartHour = parseInt(booking.start_time.split(':')[0]);
        const bookingStartMinute = parseInt(booking.start_time.split(':')[1]);
        const bookingEndHour = parseInt(booking.end_time.split(':')[0]);
        const bookingEndMinute = parseInt(booking.end_time.split(':')[1]);
        
        const bookingStartMinutes = bookingStartHour * 60 + bookingStartMinute;
        const bookingEndMinutes = bookingEndHour * 60 + bookingEndMinute;
        
        // Check for overlap
        return (
          (minutes >= bookingStartMinutes && minutes < bookingEndMinutes) ||
          (slotEndTime > bookingStartMinutes && slotEndTime <= bookingEndMinutes) ||
          (minutes <= bookingStartMinutes && slotEndTime >= bookingEndMinutes)
        );
      });
      
      if (isSlotAvailable) {
        availableSlots.push(slotTime);
      }
    }
    
    // Determine availability level for this date
    let availabilityLevel = 'high';
    if (availableSlots.length === 0) {
      availabilityLevel = 'none';
    } else if (availableSlots.length < 3) {
      availabilityLevel = 'low';
    } else if (availableSlots.length < 6) {
      availabilityLevel = 'limited';
    }
    
    return Response.json({ 
      availableSlots,
      datesWithAvailability: [{ date, availability: availabilityLevel }]
    });
  } catch (error) {
    console.error('Error fetching calendar availability:', error);
    return Response.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
});