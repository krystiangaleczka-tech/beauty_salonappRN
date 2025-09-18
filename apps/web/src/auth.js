/**
 * WARNING: This file connects this app to Create's internal auth system. Do
 * not attempt to edit it. Do not import @auth/create or @auth/create
 * anywhere else or it may break. This is an internal package.
 */
import CreateAuth from '@auth/create';
import Credentials from '@auth/core/providers/credentials';

const result = CreateAuth({
	providers: [
		Credentials({
			credentials: {
				email: {
					label: 'Email',
					type: 'email',
				},
				password: {
					label: 'Password',
					type: 'password',
				},
			},
			async authorize(credentials) {
				// Add your authentication logic here
				if (credentials.email === 'admin' && credentials.password === 'admin') {
					return {
						id: '1',
						email: 'admin',
						name: 'Admin User',
						isAdmin: true,
					};
				}
				return null;
			},
		}),
	],
	pages: {
		signIn: '/account/signin',
		signOut: '/account/logout',
	},
});
export const { auth } = result;
