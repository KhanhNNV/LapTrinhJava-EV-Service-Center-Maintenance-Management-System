# 1. Build Stage: Dùng Node để build React
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Serve Stage: Dùng Nginx để chạy
FROM nginx:alpine
# Copy file build từ bước trước vào thư mục nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copy file cấu hình nginx (nếu bạn dùng React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]