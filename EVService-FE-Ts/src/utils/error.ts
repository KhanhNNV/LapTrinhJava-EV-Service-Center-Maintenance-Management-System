import axios from "axios";

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Lỗi kết nối server";
  }
  return "Đã có lỗi xảy ra";
};
