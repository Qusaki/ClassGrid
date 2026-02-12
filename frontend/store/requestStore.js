import { create } from 'zustand';

const useRequestStore = create((set) => ({
    requests: [],
    addRequest: (request) => set((state) => ({
        requests: [...state.requests, { ...request, id: Date.now().toString(), status: 'Pending', date: new Date().toLocaleDateString() }]
    })),
    updateRequestStatus: (id, status) => set((state) => ({
        requests: state.requests.map((req) => req.id === id ? { ...req, status } : req)
    })),
    clearRequests: () => set({ requests: [] }),
}));

export default useRequestStore;
