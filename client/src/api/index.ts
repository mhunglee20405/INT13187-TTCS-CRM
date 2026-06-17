import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor - handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const res = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken },
            {
              headers: { "Content-Type": "application/json" },
            },
          );

          const newToken = res.data.data.accessToken;

          localStorage.setItem("accessToken", newToken);

          original.headers.Authorization = `Bearer ${newToken}`;

          return api(original);
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// Auth
export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  getMe: () => api.get("/auth/me"),

  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh-token", { refreshToken }),
};

// Members
export const memberApi = {
  getAll: (params?: { keyword?: string; page?: number; limit?: number }) =>
    api.get("/members", { params }),

  getById: (id: string) => api.get(`/members/${id}`),

  create: (data: object) => api.post("/members", data),

  update: (id: string, data: object) => api.put(`/members/${id}`, data),

  delete: (id: string) => api.delete(`/members/${id}`),

  checkin: (id: string) => api.post(`/members/${id}/checkin`),

  addMembership: (id: string, membershipId: string) =>
    api.post(`/members/${id}/add-membership`, { membershipId }),
};

// Memberships
export const membershipApi = {
  getAll: () => api.get("/memberships"),

  getById: (id: string) => api.get(`/memberships/${id}`),

  create: (data: object) => api.post("/memberships", data),

  update: (id: string, data: object) => api.put(`/memberships/${id}`, data),

  delete: (id: string) => api.delete(`/memberships/${id}`),
};

// Tiers
export const tierApi = {
  getAll: () => api.get("/tiers"),

  getById: (id: string) => api.get(`/tiers/${id}`),

  create: (data: object) => api.post("/tiers", data),

  update: (id: string, data: object) => api.put(`/tiers/${id}`, data),

  delete: (id: string) => api.delete(`/tiers/${id}`),

  getStatistics: () => api.get("/tiers/statistics"),
};

// Gifts
export const giftApi = {
  getAll: () => api.get("/gifts"),

  create: (data: object) => api.post("/gifts", data),

  update: (id: string, data: object) => api.put(`/gifts/${id}`, data),

  delete: (id: string) => api.delete(`/gifts/${id}`),

  redeem: (memberId: string, giftId: string) =>
    api.post("/gifts/redeem", { memberId, giftId }),

  getRedemptionHistory: (params?: { page?: number; limit?: number }) =>
    api.get("/gifts/redemptions/history", { params }),
};

// Notifications
export const notificationApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get("/notifications", { params }),

  send: (data: object) => api.post("/notifications/send", data),
};

// Notification Templates
export const templateApi = {
  getAll: () => api.get("/notification-templates"),

  create: (data: object) => api.post("/notification-templates", data),

  update: (id: string, data: object) =>
    api.put(`/notification-templates/${id}`, data),

  delete: (id: string) => api.delete(`/notification-templates/${id}`),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
};
