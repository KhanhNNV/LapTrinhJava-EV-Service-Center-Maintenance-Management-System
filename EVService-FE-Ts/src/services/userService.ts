import api from "./api";



export const userServiceStaff = {
  getCustomers: () => api.get("/api/users/customers"),
  updateUser: (id: number, data: any) => api.put(`/api/users/${id}`, data),
  searchUsers: (query: any) => api.get("/api/users/search", { params: query }),
  getUserById: (id: number) => api.get(`/api/users/${id}`),
};
