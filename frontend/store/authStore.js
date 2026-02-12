import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,

    login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
            // 1. Get Token
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await client.post('/token', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { access_token } = response.data;

            // 2. Store Token
            await SecureStore.setItemAsync('token', access_token);
            set({ token: access_token });

            // 3. Get User Actions
            await get().fetchUser();

            set({ isLoading: false });
            return true; // Success
        } catch (error) {
            console.error('Login failed:', error);
            set({
                isLoading: false,
                error: error.response?.data?.detail || 'Login failed'
            });
            return false; // Failure
        }
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('token');
        set({ user: null, token: null });
    },

    fetchUser: async () => {
        try {
            const response = await client.get('/users/me');
            set({ user: response.data });
        } catch (error) {
            console.log("Error fetching user", error);
        }
    },

    // Initialize auth state (check for existing token)
    initialize: async () => {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            set({ token });
            await get().fetchUser();
        }
    }
}));

export default useAuthStore;