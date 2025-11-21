import { config } from "process";
import api from "./api.ts";
import { ENDPOINTS } from "@/config/endpoints";

export interface UserProfile {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
}
export interface UpdateProfile{
  fullname: string;
  address: string;
  phoneNumber: string;
}
export interface PasswordChangeForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export type Role = 'CUSTOMER' | 'STAFF' | 'TECHNICIAN' | 'ADMIN';
export interface User {
  userId: number;
  username:String;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: Role;
  createdAt?: string;
  centerName?: string;
  address?: string;

}
export interface UserResponse {
  content: User[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; 
}

export interface CreateUserRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  role?: string;
  centerId?: number | null; 

}
export const userService = {

    //~ Lấy thông tin cá nhân
    async getProfile(){
      const endpoint = ENDPOINTS.users.get_profile;
      const res = await api.request<UserProfile>({
        method:endpoint.method,
        url:endpoint.url
      })
      return res.data
    },

    //~ Cập nhật thông tin cá nhân
    async updateProfile(data: UpdateProfile){
        const endpoint = ENDPOINTS.users.update_profile
        const res = await api.request<UserProfile>({
          method: endpoint.method,
          url:endpoint.url,
          data:data
        })
        return res.data;
    },

    //~ Đổi mật khẩu
    async changePassword(data: PasswordChangeForm){
        const endpoint = ENDPOINTS.auth.change_password
        const res = await api.request({
          method: endpoint.method,
          url:endpoint.url,
          data:data
        })
        return res.data;
    },

    //~ Hàm lấy danh sách user theo role
    async getListUserByRole(
      role: Role,
      page: number = 1,
      limit: number = 10
    ): Promise<UserResponse> {
      // Backend Spring Boot dùng page bắt đầu từ 0
      // Frontend hiển thị bắt đầu từ 1 -> Cần trừ 1
      const endpoint = ENDPOINTS.users.getListUserByRole;
      const res = await api.request({
        method:endpoint.method,
        url:endpoint.url,
        params: {
          role,
          page: page - 1, 
          limit,
        },
      });
      return res.data;
    },


  createStaff: async (data: CreateUserRequest) => {
    // API: UserController.createStaff
return await api.post("/api/users/createStaff", data);
  },

  createTechnician: async (data: CreateUserRequest) => {
    // API: UserController.createTechnician
return await api.post("/api/users/createTechnician", data);
  },
  
  // Hàm tạo Customer dùng chung endpoint Register
  createCustomer: async (data: CreateUserRequest) => {
      // Tận dụng API đăng ký public
      return await api.post("/auth/register", data);
  },
  addCertificateToUser: async (userId: number, data: { 
    certificateId: number; 
    credentialId: string; 
    issueDate: string; 
    notes?: string 
  }) => {
    return await api.post(`/api/users/${userId}/certificates`, data);
  },
}