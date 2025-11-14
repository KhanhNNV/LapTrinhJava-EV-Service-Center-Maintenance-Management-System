package edu.uth.evservice.services.impl;

import edu.uth.evservice.services.IEmailService;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import jakarta.mail.Message.RecipientType;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Collections;
import java.util.Properties;

@Service
public class EmailServiceImpl implements IEmailService {

    @Value("${GOOGLE_CLIENT_ID}")
    private String clientId;

    @Value("${GOOGLE_CLIENT_SECRET}")
    private String clientSecret;

    @Value("${google.gmail.user-email:}")
    private String fromEmail;

    @Autowired
    private RefreshTokenGeneratorServiceImpl refreshTokenGeneratorService;

    private static final String APPLICATION_NAME = "EV Service";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    /**
     * Tạo GoogleClientSecrets từ clientId và clientSecret
     */
    private GoogleClientSecrets getClientSecrets() {
        GoogleClientSecrets.Details details = new GoogleClientSecrets.Details();
        details.setClientId(clientId);
        details.setClientSecret(clientSecret);
        
        GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
        clientSecrets.setWeb(details);
        
        return clientSecrets;
    }

    /**
     * Tạo đối tượng Gmail service đã được xác thực.
     */
    private Gmail getGmailService() throws Exception {
        final NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        
        // Đọc refresh token từ file
        String refreshToken = refreshTokenGeneratorService.readRefreshTokenFromFile();
        if (refreshToken == null) {
            throw new RuntimeException("Refresh Token chưa được tạo. Vui lòng khởi động ứng dụng để tạo token.");
        }

        // Tạo Credential từ Refresh Token
        GoogleCredential credential = new GoogleCredential.Builder()
            .setTransport(httpTransport)
            .setJsonFactory(JSON_FACTORY)
            .setClientSecrets(clientId, clientSecret)
            .build();
        
        credential.setRefreshToken(refreshToken);
        
        // Tự động làm mới Access Token
        credential.refreshToken();

        return new Gmail.Builder(httpTransport, JSON_FACTORY, credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    /**
     * Tạo một MimeMessage (nội dung email)
     */
    private MimeMessage createMimeMessage(String to, String subject, String htmlContent) throws Exception {
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        MimeMessage email = new MimeMessage(session);

        // Sử dụng email người gửi từ config, nếu không có thì dùng "noreply"
        String sender = fromEmail != null && !fromEmail.trim().isEmpty() ? fromEmail : "noreply@evservice.com";
        email.setFrom(new InternetAddress(sender));
        email.addRecipient(RecipientType.TO, new InternetAddress(to));
        email.setSubject(subject);
        email.setContent(htmlContent, "text/html; charset=utf-8");
        return email;
    }

    /**
     * Gửi Email.
     */
    @Override
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            // 1. Tạo nội dung email (MimeMessage)
            MimeMessage mimeMessage = createMimeMessage(to, subject, htmlContent);

            // 2. Chuyển MimeMessage sang định dạng Base64
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            mimeMessage.writeTo(buffer);
            String encodedEmail = com.google.api.client.util.Base64.encodeBase64URLSafeString(buffer.toByteArray());

            // 3. Tạo đối tượng Message của Google
            Message message = new Message();
            message.setRaw(encodedEmail);

            // 4. Lấy service Gmail đã xác thực
            Gmail service = getGmailService();

            // 5. Gửi email - sử dụng "me" thay vì fromEmail
            service.users().messages().send("me", message).execute();

            System.out.println("✅ Email đã được gửi đến: " + to);

        } catch (Exception e) {
            // Xử lý lỗi chi tiết hơn
            System.err.println("❌ Lỗi gửi email đến " + to + ": " + e.getMessage());
            throw new RuntimeException("Không thể gửi email qua Gmail API: " + e.getMessage(), e);
        }
    }
}