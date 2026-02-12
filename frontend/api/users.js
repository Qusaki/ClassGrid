import client from './client';

export const getInstructors = async () => {
    try {
        const response = await client.get('/users/instructors');
        return response.data;
    } catch (error) {
        throw error.response?.data?.detail || 'Failed to fetch instructors';
    }
};
