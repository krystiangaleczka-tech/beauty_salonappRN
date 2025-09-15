import { getToken } from '@auth/core/jwt';

/**
 * Middleware to authenticate API requests using JWT tokens
 * @param {Request} request - The incoming request object
 * @returns {Promise<Object>} - Object containing user info and authentication status
 */
export async function authenticateRequest(request) {
  try {
    // Get the JWT token from the request
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL?.startsWith('https'),
    });

    // If no token, return unauthorized
    if (!token) {
      return {
        isAuthenticated: false,
        error: 'Unauthorized: No valid token provided',
        status: 401,
      };
    }

    // Return the authenticated user info
    return {
      isAuthenticated: true,
      user: {
        id: token.sub,
        email: token.email,
        name: token.name,
      },
      token,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      isAuthenticated: false,
      error: 'Authentication failed',
      status: 500,
    };
  }
}

/**
 * Higher-order function to protect API routes
 * @param {Function} handler - The API route handler function
 * @param {Object} options - Optional configuration
 * @param {boolean} options.requireAdmin - Whether to require admin role
 * @returns {Function} - Protected handler function
 */
export function withAuth(handler, options = {}) {
  return async (request, context) => {
    // Authenticate the request
    const authResult = await authenticateRequest(request);

    // If not authenticated, return error
    if (!authResult.isAuthenticated) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        {
          status: authResult.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // If admin role is required but user is not admin, return forbidden
    if (options.requireAdmin && !authResult.user.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Add user info to the request context
    request.user = authResult.user;

    // Call the original handler
    return handler(request, context);
  };
}

/**
 * Middleware to check if user has permission to access a resource
 * @param {Request} request - The incoming request object
 * @param {string} resourceType - Type of resource (e.g., 'booking', 'service')
 * @param {string} resourceId - ID of the resource
 * @returns {Promise<boolean>} - Whether user has permission
 */
export async function checkResourcePermission(request, resourceType, resourceId) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (!authResult.isAuthenticated) {
      return false;
    }

    // Admin users have access to everything
    if (authResult.user.isAdmin) {
      return true;
    }

    // For different resource types, implement specific permission checks
    switch (resourceType) {
      case 'booking':
        // Users can only access their own bookings
        // This would require a database query to check booking ownership
        // For now, we'll implement a simple check
        return true; // Placeholder - implement actual check
        
      case 'service':
        // Services are generally readable by all authenticated users
        return true;
        
      case 'availability':
        // Users can only manage their own availability
        // This would require a database query to check ownership
        return true; // Placeholder - implement actual check
        
      default:
        return false;
    }
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}