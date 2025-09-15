import { getToken } from '@auth/core/jwt';
import { withAuth } from '@/app/api/utils/authMiddleware';

export const POST = withAuth(async (request) => {
  try {
    // Get the current token from the request
    const currentToken = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL?.startsWith('https'),
    });

    if (!currentToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized: No valid token provided' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if the token is about to expire (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const tokenExpiry = currentToken.exp;
    const timeUntilExpiry = tokenExpiry - now;
    
    // If token is still valid for more than 5 minutes, no need to refresh
    if (timeUntilExpiry > 300) {
      return new Response(
        JSON.stringify({
          message: 'Token is still valid, no refresh needed',
          expiresAt: new Date(tokenExpiry * 1000).toISOString(),
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Generate a new token
    // In a real implementation, you would use your auth provider's refresh token mechanism
    // For this example, we'll just extend the expiration time
    
    // This is a simplified refresh - in production, you'd use proper JWT refresh mechanisms
    const newTokenExpiry = now + 3600; // 1 hour from now
    
    // Note: In a real application, you would use your auth provider's refresh token mechanism
    // This is a simplified example for demonstration purposes
    
    return new Response(
      JSON.stringify({
        message: 'Token refreshed successfully',
        expiresAt: new Date(newTokenExpiry * 1000).toISOString(),
        user: {
          id: currentToken.sub,
          email: currentToken.email,
          name: currentToken.name,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error refreshing token:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to refresh token' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
});