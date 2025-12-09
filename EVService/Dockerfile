# 1. Build Stage: Dùng Maven để build project
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
# Lệnh này build và bỏ qua test để tiết kiệm thời gian
RUN mvn clean package -DskipTests

# 2. Run Stage: Dùng JDK nhỏ gọn để chạy
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
# Copy file .jar từ bước build sang bước run
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]