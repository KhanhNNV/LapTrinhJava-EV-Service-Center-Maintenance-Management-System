package edu.uth.evservice.services;

public interface IEmailService {

    void sendVerificationEmail(String toEmail, String verifyLink);

    void sendPasswordResetEmail(String toEmail, String resetLink);
}
