package com.lpg.notification.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileWriter;
import java.io.PrintWriter;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class SmsService {

    @Value("${sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.from-number:}")
    private String fromNumber;

    @Value("${notification.email-log-path}")
    private String logPath;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Sends an SMS to the given 10-digit Indian mobile number via Twilio's REST API.
     * If sms.enabled=false or Twilio credentials aren't configured, this simulates
     * the send by writing to the same log file used for mock emails, so the
     * delivery-OTP flow still works end-to-end during a demo without a live
     * Twilio account.
     */
    public void sendSms(String phone, String message) {
        if (phone == null || phone.isBlank()) {
            log("[SMS SKIPPED] No mobile number on file — cannot send: " + message);
            return;
        }

        boolean configured = accountSid != null && !accountSid.isBlank()
                && authToken != null && !authToken.isBlank()
                && fromNumber != null && !fromNumber.isBlank();

        if (!smsEnabled || !configured) {
            log("[SMS SIMULATED — set sms.enabled=true and your Twilio credentials in application.yml to send for real]\n"
                    + "To: +91" + phone + "\n" + message);
            return;
        }

        try {
            String toE164 = "+91" + phone;
            String form = "To=" + URLEncoder.encode(toE164, StandardCharsets.UTF_8)
                    + "&From=" + URLEncoder.encode(fromNumber, StandardCharsets.UTF_8)
                    + "&Body=" + URLEncoder.encode(message, StandardCharsets.UTF_8);

            String credentials = Base64.getEncoder().encodeToString(
                    (accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json"))
                    .header("Authorization", "Basic " + credentials)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log("[SMS SENT via Twilio] To: " + toE164 + " | Response: " + response.body());
            } else {
                log("[SMS FAILED via Twilio] To: " + toE164 + " | HTTP " + response.statusCode() + " | " + response.body());
            }
        } catch (Exception e) {
            // Never let an SMS failure break the booking/delivery flow.
            log("[SMS ERROR] To: +91" + phone + " | " + e.getMessage());
        }
    }

    private synchronized void log(String body) {
        try (FileWriter fw = new FileWriter(logPath, true);
             PrintWriter pw = new PrintWriter(fw)) {
            pw.println("================================================================================");
            pw.println("Date: " + LocalDateTime.now());
            pw.println(body);
            pw.println("================================================================================");
            pw.println();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
