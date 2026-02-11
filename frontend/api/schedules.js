import client from './client';

export const createSchedule = async (scheduleData) => {
    try {
        const response = await client.post('/schedules', scheduleData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getSchedules = async (instructorId) => {
    try {
        const params = {};
        if (instructorId) params.instructor_id = instructorId;
        const response = await client.get('/schedules', { params });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};
