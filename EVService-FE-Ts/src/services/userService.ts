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
export interface UpdateBaseSalaryPayload {
    baseSalary: number;
}
export type Role = 'CUSTOMER' | 'STAFF' | 'TECHNICIAN' | 'ADMIN';
export interface User {
  userId: number;
  username:string;
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
export interface UpdateBaseSalaryByRolePayload {
    role: 'STAFF' | 'TECHNICIAN';
    baseSalary: number;
}
export const userService = {
    //~ Cập nhật lương cơ bản của nhân viên
    async updateBaseSalary(userId: number, data: UpdateBaseSalaryPayload){
        // Giả định có endpoint PUT để cập nhật lương cơ bản
        // Ví dụ: PUT /api/users/{userId}/base-salary
        const endpoint = `/api/users/${userId}/base-salary`;
        const res = await api.request<any>({
            method: 'PUT', // Hoặc PATCH
            url: endpoint,
            data: data,
        });
        return res.data;
    },
    //~ Cập nhật lương cơ bản theo vai trò
    async updateBaseSalaryByRole(data: UpdateBaseSalaryByRolePayload){
        // Giả định có endpoint POST/PUT để cập nhật lương cơ bản theo role
        // Ví dụ: PUT /api/users/update-base-salary-by-role
        const endpoint = `/api/users/update-base-salary-by-role`;
        const res = await api.request<any>({
            method: 'PUT',
            url: endpoint,
            data: data,
        });
        return res.data;
    },

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
    }

}