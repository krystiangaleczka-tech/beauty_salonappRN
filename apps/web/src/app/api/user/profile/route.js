import { withAuth } from '@/app/api/utils/authMiddleware';
import sql from '@/app/api/utils/sql';

// Handler for GET /api/user/profile
async function getProfileHandler(request) {
  try {
    const userId = request.user.id;
    
    // Try to get user from database first
    let user;
    try {
      const result = await sql`
        SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ${userId}
      `;
      
      if (result.length > 0) {
        user = result[0];
      }
    } catch (dbError) {
      console.error('Database error when fetching user profile:', dbError);
      // Fall back to mock data if database fails
    }
    
    // If no user from database, use mock data
    if (!user) {
      // Mock user data for development
      user = {
        id: userId,
        email: request.user.email || 'user@example.com',
        name: request.user.name || 'Test User',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: {
          phone: '+1234567890',
          address: '123 Test Street',
          city: 'Test City',
          country: 'Test Country',
          bio: 'This is a test user profile.',
          avatar_url: null,
        }
      };
    }
    
    // Return user profile
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch user profile' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Export the handler with authentication middleware
export const GET = withAuth(getProfileHandler);