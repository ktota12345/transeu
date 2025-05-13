import simpleRestProvider from 'ra-data-simple-rest';
import axiosNest from '../api/axiosNest';

const NEST_API_URL = process.env.REACT_APP_NEST_API_URL || 'https://transeu-dev.onrender.com';

// Tworzymy nowy provider na podstawie simpleRestProvider
const dataProvider = {
    ...simpleRestProvider(NEST_API_URL),
    getList: async (resource, params) => {
        try {
            const response = await axiosNest.get(`/${resource}`, { params });
            return {
                data: response.data,
                total: parseInt(response.headers['content-range'].split('/').pop(), 10),
            };
        } catch (error) {
            throw error;
        }
    },

    getOne: async (resource, params) => {
        try {
            const response = await axiosNest.get(`/${resource}/${params.id}`);
            return { data: response.data };
        } catch (error) {
            throw error;
        }
    },

    create: async (resource, params) => {
        try {
            const response = await axiosNest.post(`/${resource}`, params.data);
            return { data: response.data };
        } catch (error) {
            throw error;
        }
    },

    update: async (resource, params) => {
        try {
            const response = await axiosNest.put(`/${resource}/${params.id}`, params.data);
            return { data: response.data };
        } catch (error) {
            throw error;
        }
    },

    delete: async (resource, params) => {
        try {
            const response = await axiosNest.delete(`/${resource}/${params.id}`);
            return { data: response.data };
        } catch (error) {
            throw error;
        }
    },

    // Można również dodać inne metody, jak getMany, updateMany itp.
};

export default dataProvider;
