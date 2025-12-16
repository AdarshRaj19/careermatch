// Centralized API wrapper using fetch

const API_BASE_URL = 'http://localhost:3001/api';

const request = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = { ...(options.headers || {}) };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers,
        body: isFormData ? options.body : JSON.stringify(options.body),
    };

    if (isFormData) {
        delete (config.headers as any)['Content-Type'];
    }

    // FIXED fetch URL backticks
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: "Unknown error" }));
        const error: any = new Error(err.message);
        error.response = { data: err };
        throw error;
    }

    return response.json();
};

export const api = {
    get: (endpoint: string, options?: RequestInit) =>
        request(endpoint, { ...options, method: 'GET' }),

    post: (endpoint: string, body: any, options?: RequestInit) =>
        request(endpoint, { ...options, method: 'POST', body }),

    put: (endpoint: string, body: any, options?: RequestInit) =>
        request(endpoint, { ...options, method: 'PUT', body }),

    delete: (endpoint: string, body?: any, options?: RequestInit) =>
        request(endpoint, { ...options, method: 'DELETE', body }),

    defaults: {
        headers: {
            common: {} as Record<string, string>
        }
    }
};

// Mock axios-style defaults
Object.defineProperty(api.defaults.headers.common, 'Authorization', {
    set(value) {},
    get() {
        return undefined;
    },
    configurable: true
});