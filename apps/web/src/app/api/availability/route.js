import sql from '@/app/api/utils/sql';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const availability = await sql`
      SELECT day_of_week, start_time, end_time, is_available
      FROM availability_settings
      WHERE user_id = ${userId}
      ORDER BY day_of_week
    `;

    // Create a default schedule if none exists
    const defaultSchedule = [];
    for (let day = 0; day < 7; day++) {
      const existingSetting = availability.find(a => a.day_of_week === day);
      if (existingSetting) {
        defaultSchedule.push({
          day_of_week: day,
          start_time: existingSetting.start_time,
          end_time: existingSetting.end_time,
          is_available: existingSetting.is_available
        });
      } else {
        // Default business hours: 9 AM - 5 PM, closed on Sunday
        defaultSchedule.push({
          day_of_week: day,
          start_time: day === 0 ? null : '09:00:00', // Sunday closed
          end_time: day === 0 ? null : '17:00:00',
          is_available: day !== 0
        });
      }
    }

    return Response.json({ availability: defaultSchedule });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return Response.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user_id, availability } = await request.json();

    if (!user_id || !availability) {
      return Response.json({ error: 'User ID and availability data are required' }, { status: 400 });
    }

    // Delete existing availability for this user
    await sql`DELETE FROM availability_settings WHERE user_id = ${user_id}`;

    // Insert new availability settings
    for (const setting of availability) {
      if (setting.is_available && setting.start_time && setting.end_time) {
        await sql`
          INSERT INTO availability_settings (user_id, day_of_week, start_time, end_time, is_available)
          VALUES (${user_id}, ${setting.day_of_week}, ${setting.start_time}, ${setting.end_time}, ${setting.is_available})
          ON CONFLICT (user_id, day_of_week)
          DO UPDATE SET
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            is_available = EXCLUDED.is_available,
            updated_at = CURRENT_TIMESTAMP
        `;
      } else {
        // Mark as unavailable
        await sql`
          INSERT INTO availability_settings (user_id, day_of_week, is_available)
          VALUES (${user_id}, ${setting.day_of_week}, false)
          ON CONFLICT (user_id, day_of_week)
          DO UPDATE SET
            is_available = false,
            start_time = NULL,
            end_time = NULL,
            updated_at = CURRENT_TIMESTAMP
        `;
      }
    }

    return Response.json({ success: true, message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Error updating availability:', error);
    return Response.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}