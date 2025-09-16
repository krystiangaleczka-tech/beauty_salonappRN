import { getToken } from '@auth/core/jwt';
import { SignJWT } from 'jose';
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

    // Create a new JWT token
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    
    const newToken = await new SignJWT({
      sub: currentToken.sub,
      email: currentToken.email,
      name: currentToken.name,
      isAdmin: currentToken.isAdmin || false,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(now + 3600) // 1 hour from now
      .sign(secret);

    return new Response(
      JSON.stringify({
        message: 'Token refreshed successfully',
        token: newToken,
        expiresAt: new Date((now + 3600) * 1000).toISOString(),
        user: {
          id: currentToken.sub,
          email: currentToken.email,
          name: currentToken.name,
          isAdmin: currentToken.isAdmin || false,
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