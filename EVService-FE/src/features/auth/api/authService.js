import apiClient from '../../../services/api';

//. Gửi yêu cầu đăng nhập đến server.
export const login = (username, password) => {
  return apiClient.post('/auth/login', {
    usernameOrEmail: username,
    password: password,
  });
};

//. Gửi yêu cầu đăng ký đến server
export const register = (userData)=>{
    return apiClient.post('/auth/register', userData);
}