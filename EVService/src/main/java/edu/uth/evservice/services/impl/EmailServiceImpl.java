package edu.uth.evservice.services.impl;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import edu.uth.evservice.services.IEmailService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements IEmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationEmail(String toEmail, String verifyLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Xác nhận email - EV Service Center");
        message.setText(
                "Xin chào,\n\n" +
                        "Vui lòng nhấp vào liên kết sau để xác nhận email của bạn:\n" +
                        verifyLink +
                        "\n\nNếu bạn không yêu cầu, vui lòng bỏ qua email này.");
        mailSender.send(message);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Đặt lại mật khẩu - EV Service Center");
        message.setText(
                "Xin chào,\n\n" +
                        "Bạn đã yêu cầu đặt lại mật khẩu. Nhấp vào liên kết sau để tạo mật khẩu mới:\n" +
                        resetLink +
                        "\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.");
        mailSender.send(message);
    }
}
