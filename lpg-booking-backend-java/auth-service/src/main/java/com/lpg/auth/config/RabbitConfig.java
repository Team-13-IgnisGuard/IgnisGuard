package com.lpg.auth.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String EXCHANGE_NAME = "lpg.notification.exchange";
    public static final String WELCOME_QUEUE = "welcome-email-queue";
    public static final String OTP_QUEUE = "otp-email-queue";
    
    public static final String ROUTING_KEY_REGISTERED = "user.registered";
    public static final String ROUTING_KEY_OTP = "user.forgot-password";

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue welcomeQueue() {
        return new Queue(WELCOME_QUEUE, true);
    }

    @Bean
    public Queue otpQueue() {
        return new Queue(OTP_QUEUE, true);
    }

    @Bean
    public Binding welcomeBinding(Queue welcomeQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(welcomeQueue).to(notificationExchange).with(ROUTING_KEY_REGISTERED);
    }

    @Bean
    public Binding otpBinding(Queue otpQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(otpQueue).to(notificationExchange).with(ROUTING_KEY_OTP);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
