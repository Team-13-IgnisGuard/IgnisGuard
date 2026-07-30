package com.lpg.notification.listener;

import com.lpg.notification.config.RabbitConfig;
import com.lpg.notification.service.SmsService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.Map;

@Component
public class NotificationListener {

    @Value("${notification.email-log-path}")
    private String emailLogPath;

    private final SmsService smsService;

    public NotificationListener(SmsService smsService) {
        this.smsService = smsService;
    }

    @RabbitListener(queues = RabbitConfig.WELCOME_QUEUE)
    public void receiveWelcomeEmail(Map<String, String> message) {
        String email = message.get("email");
        String firstName = message.get("firstName");
        String lastName = message.get("lastName");

        String body = String.format("""
                To: %s
                Subject: Welcome to LPG Cylinder Booking!
                Date: %s
                
                Hello %s %s,
                
                Your registration was successful. Welcome to the LPG Cylinder Booking & Distribution Management System!
                You can now log in and complete your gas connection profile to start booking cylinder refills.
                """, email, LocalDateTime.now(), firstName, lastName);

        logEmail(body);
    }

    @RabbitListener(queues = RabbitConfig.OTP_QUEUE)
    public void receiveOtpEmail(Map<String, String> message) {
        String email = message.get("email");
        String otp = message.get("otp");

        String body = String.format("""
                To: %s
                Subject: LPG Cylinder Booking - Password Reset OTP
                Date: %s
                
                We received a request to reset your password.
                Your 6-Digit One-Time Password (OTP) is: %s
                This OTP is valid for 15 minutes.
                """, email, LocalDateTime.now(), otp);

        logEmail(body);
    }

    @RabbitListener(queues = RabbitConfig.BOOKING_QUEUE)
    public void receiveBookingUpdate(Map<String, Object> message) {
        Object bookingId = message.get("bookingId");
        String status = (String) message.get("status");
        String email = (String) message.get("email");
        String phone = (String) message.get("phone");
        String otp = (String) message.get("otp");
        String amount = (String) message.get("amount");

        String subject = "LPG Cylinder Booking - Order Update #" + bookingId;
        String content = "";

        if ("Paid".equalsIgnoreCase(status)) {
            content = String.format("""
                    Thank you! Your payment of Rs. %s has been received successfully for Booking #%s.
                    Your booking is now confirmed. We will assign a delivery driver shortly.
                    """, amount, bookingId);
        } else if ("Assigned".equalsIgnoreCase(status)) {
            content = String.format("""
                    Your Booking #%s has been assigned to a delivery driver.
                    It will be dispatched for doorstep delivery soon.
                    """, bookingId);
        } else if ("OutForDelivery".equalsIgnoreCase(status)) {
            content = String.format("""
                    Your cylinder Booking #%s is out for delivery!
                    Please share this 6-digit doorstep OTP with the driver to confirm receipt:
                    OTP CODE: %s
                    """, bookingId, otp);

            smsService.sendSms(phone, String.format(
                    "Your LPG Cylinder Booking #%s is out for delivery. Share OTP %s with the delivery agent to confirm receipt. Do not share this OTP with anyone else.",
                    bookingId, otp));
        } else if ("Delivered".equalsIgnoreCase(status)) {
            content = String.format("""
                    Hooray! Your cylinder Booking #%s has been successfully delivered.
                    Thank you for choosing LPG Cylinder Booking!
                    """, bookingId);
        } else if ("DeliveryFailed".equalsIgnoreCase(status)) {
            content = String.format("""
                    Delivery update: Handover failed for cylinder Booking #%s.
                    Our driver was unable to complete the delivery. Please coordinate with your distributor agency.
                    """, bookingId);
        } else {
            content = String.format("Cylinder Booking #%s status has been updated to: %s", bookingId, status);
        }

        String body = String.format("""
                To: %s
                Subject: %s
                Date: %s
                
                %s
                """, email, subject, LocalDateTime.now(), content);

        logEmail(body);
    }

    private synchronized void logEmail(String body) {
        try (FileWriter fw = new FileWriter(emailLogPath, true);
             PrintWriter pw = new PrintWriter(fw)) {
            pw.println("================================================================================");
            pw.print(body);
            pw.println("================================================================================");
            pw.println();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
