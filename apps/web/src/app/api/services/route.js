import sql from "@/app/api/utils/sql";
import { mockServices } from "./mock-data.js";

// GET - List all active services, organized by category
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const categoryFilter = url.searchParams.get('category');
    
    // Try database first, fall back to mock data if database is unavailable
    let services;
    try {
      if (categoryFilter && categoryFilter !== 'All') {
        services = await sql`
          SELECT id, name, description, category, "durationMinutes" as duration_minutes, 
                 ("priceInCents"::float / 100) as price, "isActive" as is_active, "createdAt" as created_at
          FROM services 
          WHERE "isActive" = true AND category = ${categoryFilter}
          ORDER BY category ASC, name ASC
        `;
      } else {
        services = await sql`
          SELECT id, name, description, category, "durationMinutes" as duration_minutes, 
                 ("priceInCents"::float / 100) as price, "isActive" as is_active, "createdAt" as created_at
          FROM services 
          WHERE "isActive" = true 
          ORDER BY category ASC, name ASC
        `;
      }
    } catch (dbError) {
      console.log('Database unavailable, using mock data:', dbError.message);
      services = mockServices.filter(service => {
        if (!service.is_active) return false;
        if (categoryFilter && categoryFilter !== 'All') {
          return service.category === categoryFilter;
        }
        return true;
      });
    }
    
    // Group services by category
    const servicesByCategory = services.reduce((acc, service) => {
      const category = service.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {});
    
    return Response.json({ 
      services,
      servicesByCategory 
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return Response.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

// POST - Create new service
export async function POST(request) {
  try {
    const { name, description, category, duration_minutes, price } = await request.json();
    
    if (!name || !duration_minutes || !price) {
      return Response.json({ error: 'Name, duration, and price are required' }, { status: 400 });
    }
    
    const service = await sql`
      INSERT INTO services (name, description, category, duration_minutes, price)
      VALUES (${name}, ${description}, ${category || 'Other'}, ${duration_minutes}, ${price})
      RETURNING *
    `;
    
    return Response.json({ service: service[0] });
  } catch (error) {
    console.error('Error creating service:', error);
    return Response.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
