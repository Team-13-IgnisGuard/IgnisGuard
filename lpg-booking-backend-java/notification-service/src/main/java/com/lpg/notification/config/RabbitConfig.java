package com.lpg.notification.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String WELCOME_QUEUE = "welcome-email-queue";
    public static final String OTP_QUEUE = "otp-email-queue";
    public static final String BOOKING_QUEUE = "booking-update-queue";

    @Bean
    public Queue welcomeQueue() {
        return new Queue(WELCOME_QUEUE, true);
    }

    @Bean
    public Queue otpQueue() {
        return new Queue(OTP_QUEUE, true);
    }

    @Bean
    public Queue bookingQueue() {
        return new Queue(BOOKING_QUEUE, true);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
