import { create } from 'zustand';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_BASE, SOCKET_URL } from '../config/runtime';
import { buildDefaultDocuments } from '../config/defaultData';

const socket = io(SOCKET_URL);

export const useDocumentStore = create((set, get) => ({
    documents: [],
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
    },
    isLoading: false,
    error: null,
    searchTerm: '',
    filterTerm: '',
    startDate: '',
    endDate: '',

    // WebSocket Initialization
    initSockets: () => {
        socket.on('document_added', (newDoc) => {
            // Re-fetch current page if a new doc is added to see the change
            get().fetchDocuments(get().pagination.page);
        });

        socket.on('document_posted', ({ id }) => {
            // Update the status of the document locally if it exists in the current view
            set((state) => ({
                documents: state.documents.map(doc =>
                    doc.id === id ? { ...doc, status: 'posted' } : doc
                )
            }));
        });
    },

    setStartDate: (date) => {
        set({ startDate: date });
        get().fetchDocuments(1, get().pagination.limit);
    },

    setEndDate: (date) => {
        set({ endDate: date });
        get().fetchDocuments(1, get().pagination.limit);
    },

    deleteDocument: async (id) => {
        try {
            await axios.delete(`${API_BASE}/documents/${id}`);
            get().fetchDocuments(get().pagination.page);
        } catch (err) {
            set({ error: err.message });
            throw err;
        }
    },

    fetchDocuments: async (page = 1, limit = 10) => {
        set({ isLoading: true, error: null });
        try {
            const { startDate, endDate, filterTerm, searchTerm } = get();
            const params = { page, limit };
            if (startDate) params.start = startDate;
            if (endDate) params.end = endDate;
            if (filterTerm) params.type = filterTerm;
            const response = await axios.get(`${API_BASE}/documents`, { params });
            let docs = response.data.data;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                docs = docs.filter(d =>
                    String(d.id).includes(term) ||
                    (d.doc_type && d.doc_type.toLowerCase().includes(term)) ||
                    (d.total_amount && String(d.total_amount).includes(term))
                );
            }
            set({
                documents: docs,
                pagination: response.data.pagination,
                isLoading: false
            });
        } catch (err) {
            const fallback = buildDefaultDocuments(20);
            const start = (page - 1) * limit;
            const end = start + limit;
            const paged = fallback.slice(start, end);
            set({
                error: err.message,
                documents: paged,
                pagination: {
                    total: fallback.length,
                    page,
                    limit,
                    pages: Math.max(1, Math.ceil(fallback.length / limit))
                },
                isLoading: false
            });
        }
    },

    setPage: (page) => {
        get().fetchDocuments(page, get().pagination.limit);
    },

    setSearch: (term) => {
        set({ searchTerm: term });
        get().fetchDocuments(1, get().pagination.limit);
    },

    setFilter: (type) => {
        set({ filterTerm: type });
        get().fetchDocuments(1, get().pagination.limit);
    },

    clearFilters: () => {
        set({ searchTerm: '', filterTerm: '' });
        get().fetchDocuments(1, get().pagination.limit);
    }
}));
