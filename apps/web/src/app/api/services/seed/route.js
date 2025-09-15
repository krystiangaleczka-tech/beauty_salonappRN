import sql from '@/app/api/utils/sql';

// POST - Create tables if missing and seed comprehensive salon services
export async function POST() {
  try {
    // Create services table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Unique index to support upserts by name
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS services_name_key ON services (name)`;

    // Create bookings table if not exists (referenced by other APIs)
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        booking_date DATE NOT NULL,
        start_time TIME NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    const services = [
      // Manicure
      {
        name: 'Classic Manicure',
        description: 'Nail shaping, cuticle care, and polish application.',
        category: 'Manicure',
        duration_minutes: 45,
        price: 80.0,
      },
      {
        name: 'Gel Manicure',
        description: 'Long-lasting gel polish with nail shaping and cuticle care.',
        category: 'Manicure',
        duration_minutes: 60,
        price: 120.0,
      },
      {
        name: 'French Manicure',
        description: 'Classic French tips with nail shaping and cuticle care.',
        category: 'Manicure',
        duration_minutes: 60,
        price: 110.0,
      },
      {
        name: 'Spa Manicure',
        description: 'Manicure with exfoliation, mask, and hand massage.',
        category: 'Manicure',
        duration_minutes: 75,
        price: 150.0,
      },

      // Pedicure
      {
        name: 'Classic Pedicure',
        description: 'Foot soak, nail shaping, cuticle care, and polish.',
        category: 'Pedicure',
        duration_minutes: 60,
        price: 120.0,
      },
      {
        name: 'Gel Pedicure',
        description: 'Long-lasting gel polish pedicure with full foot care.',
        category: 'Pedicure',
        duration_minutes: 75,
        price: 160.0,
      },
      {
        name: 'Spa Pedicure',
        description: 'Pedicure with exfoliation, mask, callus smoothing, and massage.',
        category: 'Pedicure',
        duration_minutes: 90,
        price: 190.0,
      },

      // Podology
      {
        name: 'Medical Pedicure (Podology)',
        description: 'Specialized foot care for calluses, corns, and nail concerns.',
        category: 'Podology',
        duration_minutes: 60,
        price: 200.0,
      },
      {
        name: 'Ingrown Toenail Treatment',
        description: 'Relief and corrective care for ingrown toenails.',
        category: 'Podology',
        duration_minutes: 45,
        price: 180.0,
      },
      {
        name: 'Callus and Corn Removal',
        description: 'Professional removal and smoothing of calluses and corns.',
        category: 'Podology',
        duration_minutes: 45,
        price: 160.0,
      },

      // Facial treatments
      {
        name: 'Classic Facial',
        description: 'Deep cleanse, exfoliation, mask, and hydration.',
        category: 'Facial',
        duration_minutes: 60,
        price: 220.0,
      },
      {
        name: 'Microdermabrasion Facial',
        description: 'Exfoliating treatment to improve texture and radiance.',
        category: 'Facial',
        duration_minutes: 60,
        price: 280.0,
      },
      {
        name: 'Hydrating Facial',
        description: 'Intense hydration for dry and sensitive skin.',
        category: 'Facial',
        duration_minutes: 60,
        price: 240.0,
      },
      {
        name: 'Anti-Aging Facial',
        description: 'Targeted treatment to reduce fine lines and improve firmness.',
        category: 'Facial',
        duration_minutes: 75,
        price: 320.0,
      },

      // Eyebrows
      {
        name: 'Eyebrow Shaping',
        description: 'Brow mapping and shaping with waxing or threading.',
        category: 'Eyebrows',
        duration_minutes: 20,
        price: 60.0,
      },
      {
        name: 'Eyebrow Tint',
        description: 'Semi-permanent tint to define and enhance brows.',
        category: 'Eyebrows',
        duration_minutes: 20,
        price: 55.0,
      },
      {
        name: 'Eyebrow Lamination',
        description: 'Brow lift for fuller, defined shape and hold.',
        category: 'Eyebrows',
        duration_minutes: 45,
        price: 160.0,
      },

      // Permanent makeup
      {
        name: 'Permanent Makeup - Powder Brows',
        description: 'Soft powder effect for naturally filled-in brows.',
        category: 'Permanent Makeup',
        duration_minutes: 150,
        price: 900.0,
      },
      {
        name: 'Permanent Makeup - Microblading',
        description: 'Hair-stroke technique to create natural-looking brows.',
        category: 'Permanent Makeup',
        duration_minutes: 150,
        price: 950.0,
      },
      {
        name: 'Permanent Makeup - Brow Touch-up',
        description: 'Maintenance and refresh for permanent brow treatments.',
        category: 'Permanent Makeup',
        duration_minutes: 90,
        price: 450.0,
      },

      // Other beauty services
      {
        name: 'Makeup Application',
        description: 'Day or evening makeup tailored to your occasion.',
        category: 'Other',
        duration_minutes: 60,
        price: 220.0,
      },
      {
        name: 'Lash Lift & Tint',
        description: 'Curl and tint for lifted, natural-looking lashes.',
        category: 'Other',
        duration_minutes: 60,
        price: 190.0,
      },
      {
        name: 'Waxing - Full Leg',
        description: 'Full leg wax for smooth, hair-free skin.',
        category: 'Other',
        duration_minutes: 45,
        price: 160.0,
      },
      {
        name: 'Waxing - Underarm',
        description: 'Quick and effective underarm hair removal.',
        category: 'Other',
        duration_minutes: 15,
        price: 60.0,
      },
    ];

    let insertedOrUpdated = 0;
    for (const s of services) {
      await sql`
        INSERT INTO services (name, description, category, duration_minutes, price, is_active)
        VALUES (${s.name}, ${s.description}, ${s.category}, ${s.duration_minutes}, ${s.price}, TRUE)
        ON CONFLICT (name)
        DO UPDATE SET
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          duration_minutes = EXCLUDED.duration_minutes,
          price = EXCLUDED.price,
          is_active = TRUE
      `;
      insertedOrUpdated++;
    }

    return Response.json({
      ok: true,
      message: 'Services seeded successfully',
      count: insertedOrUpdated,
    });
  } catch (error) {
    console.error('Error seeding services:', error);
    return Response.json({ error: 'Failed to seed services' }, { status: 500 });
  }
}
