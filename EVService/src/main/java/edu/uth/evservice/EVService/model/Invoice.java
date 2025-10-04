package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;

public class Invoice {

    private int invoiceId;

    private String customerId;


    private Double totalAmount;


    private String paymentMethod;


    private String paymentStatus;


    private int ticketID;


    private int customerID;

    // ==============================
    // Constructor không tham số
    // ==============================
    public Invoice() {}

    // ==============================
    // Constructor đầy đủ tham số
    // ==============================
    public Invoice(int invoiceId, String customerId, Double totalAmount,
                   String paymentMethod, String paymentStatus,
                   int ticketID, int customerID) {
        this.invoiceId = invoiceId;
        this.customerId = customerId;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.ticketID = ticketID;
        this.customerID = customerID;
    }

    // ==============================
    // Getter & Setter
    // ==============================
    public int getInvoiceId() { return invoiceId; }
    public void setInvoiceId(int invoiceId) { this.invoiceId = invoiceId; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public int getTicketID() { return ticketID; }
    public void setTicketID(int ticketID) { this.ticketID = ticketID; }

    public int getCustomerID() { return customerID; }
    public void setCustomerID(int customerID) { this.customerID = customerID; }
}
