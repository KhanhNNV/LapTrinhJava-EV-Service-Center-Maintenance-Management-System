package edu.uth.evservice.services.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeRequestUrl;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.GmailScopes;
import edu.uth.evservice.services.IRefreshTokenGeneratorService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileWriter;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Scanner;

@Service
public class RefreshTokenGeneratorServiceImpl implements IRefreshTokenGeneratorService {

    @Value("${GOOGLE_CLIENT_ID}")
    private String clientId;
    @Value("${GOOGLE_CLIENT_SECRET}")
    private String clientSecret;
    @Value("${google.gmail.refresh-token-file:src/main/resources/refresh-token.txt}")
    private String refreshTokenFile;
    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String REDIRECT_URI;
    
    private static final List<String> SCOPES = Collections.singletonList(GmailScopes.GMAIL_SEND);

    /**
     * Tự động chạy khi ứng dụng khởi động
     */
    @PostConstruct
    @Override
    public void initializeRefreshToken() throws IOException {
        if (!isRefreshTokenExists()) {
            System.out.println("🔄 Không tìm thấy Refresh Token. Bắt đầu quá trình tạo...");
            generateAndSaveRefreshToken();
        } else {
            System.out.println("✅ Refresh Token đã tồn tại.");
        }
    }

    /**
     * Tạo GoogleClientSecrets từ clientId và clientSecret
     */
    private GoogleClientSecrets getClientSecrets() {
        GoogleClientSecrets.Details details = new GoogleClientSecrets.Details();
        details.setClientId(clientId);
        details.setClientSecret(clientSecret);
        details.setRedirectUris(Collections.singletonList(REDIRECT_URI));

        GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
        clientSecrets.setWeb(details);

        return clientSecrets;
    }

    private void generateAndSaveRefreshToken() throws IOException {
        try {
            GoogleClientSecrets clientSecrets = getClientSecrets();

            // Tạo authorization flow
            GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance(),
                    clientSecrets,
                    SCOPES)
                    .setAccessType("offline")
                    .build();

            // Tạo authorization URL
            String authorizationUrl = new GoogleAuthorizationCodeRequestUrl(
                    clientSecrets,
                    REDIRECT_URI,
                    SCOPES)
                    .setAccessType("offline")
                    .setApprovalPrompt("force")
                    .build();

            System.out.println("==================================================");
            System.out.println("🔗 Vui lòng mở URL sau trong browser:");
            System.out.println(authorizationUrl);
            System.out.println("==================================================");
            System.out.println("📝 HƯỚNG DẪN:");
            System.out.println("1. Mở URL trên trong browser");
            System.out.println("2. Đăng nhập và cấp quyền");
            System.out.println("3. Trang sẽ hiển thị mã code (dạng: 4/XXXXXXX)");
            System.out.println("4. Copy mã code và paste vào đây");
            System.out.println("==================================================");
            System.out.print("👉 Nhập authorization code: ");

            // Nhận authorization code từ user
            Scanner scanner = new Scanner(System.in);
            String authorizationCode = scanner.nextLine().trim();

            // Exchange code for tokens
            GoogleTokenResponse tokenResponse = flow.newTokenRequest(authorizationCode)
                    .setRedirectUri(REDIRECT_URI)
                    .execute();

            // Lấy refresh token
            String refreshToken = tokenResponse.getRefreshToken();

            // Lưu refresh token vào file
            saveRefreshTokenToFile(refreshToken);

            System.out.println("✅ Refresh Token đã được lưu: " + refreshTokenFile);
            System.out.println("🔄 Ứng dụng đã sẵn sàng sử dụng Gmail API.");

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo Refresh Token: " + e.getMessage(), e);
        }
    }

    private void saveRefreshTokenToFile(String refreshToken) throws IOException {
        try (FileWriter writer = new FileWriter(refreshTokenFile)) {
            writer.write(refreshToken);
        }
    }

    @Override
    public String readRefreshTokenFromFile() throws IOException {
        try {
            java.io.File file = new java.io.File(refreshTokenFile);
            if (!file.exists()) {
                return null;
            }

            try (Scanner scanner = new Scanner(file)) {
                return scanner.nextLine().trim();
            }
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public boolean isRefreshTokenExists() {
        try {
            String refreshToken = readRefreshTokenFromFile();
            return refreshToken != null && !refreshToken.trim().isEmpty();
        } catch (Exception e) {
            return false;
        }
    }
}