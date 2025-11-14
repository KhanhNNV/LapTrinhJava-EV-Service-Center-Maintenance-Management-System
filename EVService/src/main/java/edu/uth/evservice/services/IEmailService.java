package edu.uth.evservice.services;

public interface IEmailService {
    void sendHtmlEmail(String to, String subject, String htmlContent);
    
}