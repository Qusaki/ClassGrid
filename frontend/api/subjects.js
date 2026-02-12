import client from './client';

export const createSubject = async (subjectData) => {
    try {
        const response = await client.post('/subjects/', subjectData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.detail || 'Failed to create subject';
    }
};

export const getSubjects = async () => {
    try {
        const response = await client.get('/subjects/');
        return response.data;
    } catch (error) {
        throw error.response?.data?.detail || 'Failed to fetch subjects';
    }
};
