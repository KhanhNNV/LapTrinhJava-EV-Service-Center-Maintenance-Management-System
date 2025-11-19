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

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'CUSTOMER' | 'STAFF' | 'TECHNICIAN' | 'ADMIN';
  createdAt?: string;
  avatar?: string;
  // Các trường bổ sung tùy role (optional)
  department?: string; 
  specialization?: string;
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

}