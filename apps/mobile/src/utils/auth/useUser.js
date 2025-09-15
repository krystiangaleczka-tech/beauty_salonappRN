import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useUserStore } from './store';
import fetch from '../../__create/fetch';

export const useUser = () => {
	const { auth, isReady } = useAuth();
	const { 
		user, 
		isLoading, 
		error, 
		lastFetchTime, 
		cacheExpiry,
		setUser, 
		loadUserFromCache, 
		clearUser, 
		setLoading, 
		setError 
	} = useUserStore();
	
	const [initialized, setInitialized] = useState(false);

	// Initialize user data from cache when component mounts
	useEffect(() => {
		const initializeUser = async () => {
			if (!initialized && isReady) {
				try {
					await loadUserFromCache();
				} catch (err) {
					console.error('Failed to initialize user from cache:', err);
				} finally {
					setInitialized(true);
				}
			}
		};

		initializeUser();
	}, [isReady, initialized, loadUserFromCache]);

	// Check if we need to fetch fresh data
	const shouldFetch = useCallback(() => {
		if (!isReady || !auth) return false;
		
		// If no user data or cache is expired
		const now = Date.now();
		return !user || !lastFetchTime || (now - lastFetchTime > cacheExpiry);
	}, [isReady, auth, user, lastFetchTime, cacheExpiry]);

	// Fetch user profile from API
	const fetchUser = useCallback(async (forceRefresh = false) => {
		if (!isReady || !auth) {
			if (!auth) {
				clearUser();
			}
			return null;
		}

		// If not forcing refresh and we have valid cached data, return it
		if (!forceRefresh && !shouldFetch()) {
			const { _timestamp, ...userData } = user || {};
			return userData || null;
		}

		try {
			setLoading(true);
			setError(null);

			const response = await fetch('/api/user/profile', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch user profile: ${response.status}`);
			}

			const userData = await response.json();
			
			// Update store and cache
			setUser(userData);
			
			return userData;
		} catch (err) {
			console.error('Error fetching user profile:', err);
			setError(err.message || 'Failed to fetch user profile');
			
			// If we have cached data, return it even though there was an error
			if (user) {
				const { _timestamp, ...userData } = user;
				return userData;
			}
			
			return null;
		} finally {
			setLoading(false);
		}
	}, [isReady, auth, user, shouldFetch, setLoading, setError, setUser, clearUser]);

	// Refetch user data
	const refetch = useCallback(() => {
		return fetchUser(true);
	}, [fetchUser]);

	// Clear user data
	const clearUserData = useCallback(() => {
		clearUser();
	}, [clearUser]);

	// Extract user data without metadata
	const userData = user ? { 
		id: user.id, 
		name: user.name, 
		email: user.email, 
		role: user.role,
		// Include any other user fields that might be in the API response
		...(user.profile || {}),
		// Exclude our internal metadata
	} : null;

	return { 
		user: userData, 
		data: userData, 
		loading: !initialized || isLoading, 
		error,
		refetch,
		clearUser: clearUserData,
		isAuthenticated: isReady && !!auth,
	};
};

export default useUser;
