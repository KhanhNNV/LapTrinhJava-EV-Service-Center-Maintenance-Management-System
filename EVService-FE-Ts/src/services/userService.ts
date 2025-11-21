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
export interface UpdateProfile {
  fullName: string;
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
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: Role;
  createdAt?: string;
  centerName?: string;
  address?: string;
  serviceCenterId?: number;
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

export interface AssignCertificateRequest {
  certificateId: number;
  credentialId: string;
  issueDate: string; // Định dạng YYYY-MM-DD
  notes?: string;
}
export const userService = {

  //~ Lấy thông tin cá nhân
  async getProfile() {
    const endpoint = ENDPOINTS.users.get_profile;
    const res = await api.request<UserProfile>({
      method: endpoint.method,
      url: endpoint.url
    })
    return res.data
  },

  //~ Cập nhật thông tin cá nhân
  async updateProfile(data: UpdateProfile) {
    const endpoint = ENDPOINTS.users.update_profile
    const res = await api.request<UserProfile>({
      method: endpoint.method,
      url: endpoint.url,
      data: data
    })
    return res.data;
  },

  //~ Đổi mật khẩu
  async changePassword(data: PasswordChangeForm) {
    const endpoint = ENDPOINTS.auth.change_password
    const res = await api.request({
      method: endpoint.method,
      url: endpoint.url,
      data: data
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
      method: endpoint.method,
      url: endpoint.url,
      params: {
        role,
        page: page - 1,
        limit,
      },
    });
    return res.data;
  },

  async createStaff(data: CreateUserRequest) {
    const endpoint = ENDPOINTS.users.createStaff
    const res = await api.request({
      method: endpoint.method,
      url: endpoint.url,
      data: data
    })
    return res.data;
  },


  async createTechnician(data: CreateUserRequest) {
    const endpoint = ENDPOINTS.users.createTechnician
    const res = await api.request({
      method: endpoint.method,
      url: endpoint.url,
      data: data
    })
    return res.data;
  },


  async addCertificateToUser(userId: number, data: {
    certificateId: number;
    credentialId: string;
    issueDate: string;
    notes?: string
  }) {
    const endpoint = ENDPOINTS.users.addCertificate(userId);
    const res = await api.request({
      method: endpoint.method,
      url: endpoint.url,
      data: data
    });
    return res.data;
  },

  async getCertificatesByUserId(userId: number) {
    const endpoint = ENDPOINTS.users.getCerbyUser(userId);

    const res = await api.request({
      method: endpoint.method,
      url: endpoint.url,
    });
    return res.data;
  },
  async addCertificateToTech(userId: number, data: AssignCertificateRequest) {
    const endpoint = ENDPOINTS.users.updateCer(userId)

    const res = await api.request({
      method: endpoint.method,
      url: endpoint.url,
      data: data
    });

    return res.data;
  },

  //~ 3. Admin xóa chứng chỉ của Tech
  async removeCertificateFromTech(techId: number, certificateId: number) {
    const endpoint = ENDPOINTS.users.removeCer(techId, certificateId);

    const res = await api.request({
      method: endpoint.method,
      url: endpoint.url,
    });
    return res.data;
  },

  async updateUser(userId: number, data: any) {
    const endpoint = ENDPOINTS.users.update(userId);
    const res = await api.request({
      method: endpoint.method,
      url: endpoint.url,
      data: data
    });
    return res.data;
  },
  
};


