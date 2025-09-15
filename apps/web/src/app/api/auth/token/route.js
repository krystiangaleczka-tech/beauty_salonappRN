import { getToken } from '@auth/core/jwt';
import { withAuth } from '@/app/api/utils/authMiddleware';

export const GET = withAuth(async (request) => {
  try {
    // Get the JWT token from the request
    const [token, jwt] = await Promise.all([
      getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        secureCookie: process.env.AUTH_URL?.startsWith('https'),
        raw: true,
      }),
      getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        secureCookie: process.env.AUTH_URL?.startsWith('https'),
      }),
    ]);

    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(
      JSON.stringify({
        jwt: token,
        user: {
          id: jwt.sub,
          email: jwt.email,
          name: jwt.name,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching token:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch token' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
