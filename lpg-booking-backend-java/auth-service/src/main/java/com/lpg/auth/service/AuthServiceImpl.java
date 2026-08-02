package com.lpg.auth.service;

import com.lpg.auth.config.RabbitConfig;
import com.lpg.auth.dto.*;
import com.lpg.auth.entity.PasswordOtp;
import com.lpg.auth.entity.User;
import com.lpg.auth.repository.PasswordOtpRepository;
import com.lpg.auth.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordOtpRepository passwordOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final RabbitTemplate rabbitTemplate;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.issuer}")
    private String jwtIssuer;

    @Value("${jwt.audience}")
    private String jwtAudience;

    @Value("${jwt.expiry-minutes}")
    private long jwtExpiryMinutes;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordOtpRepository passwordOtpRepository,
                           PasswordEncoder passwordEncoder,
                           RabbitTemplate rabbitTemplate) {
        this.userRepository = userRepository;
        this.passwordOtpRepository = passwordOtpRepository;
        this.passwordEncoder = passwordEncoder;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public AuthResponseDto register(RegisterDto model) {
        Optional<User> existingUser = userRepository.findByEmail(model.getEmail());
        if (existingUser.isPresent()) {
            return new AuthResponseDto(false, List.of("User already exists with this email address."));
        }

        if (!model.getPassword().equals(model.getConfirmPassword())) {
            return new AuthResponseDto(false, List.of("Password and Confirm Password do not match."));
        }

        User user = new User();
        user.setFirstName(model.getFirstName());
        user.setLastName(model.getLastName());
        user.setEmail(model.getEmail());
        user.setPasswordHash(passwordEncoder.encode(model.getPassword()));
        user.setRole(model.getRole());
        user.setActive(true);

        User savedUser = userRepository.save(user);
        String token = generateJwtToken(savedUser);

        // Publish event to RabbitMQ for welcome email
        Map<String, String> emailMsg = new HashMap<>();
        emailMsg.put("email", savedUser.getEmail());
        emailMsg.put("firstName", savedUser.getFirstName());
        emailMsg.put("lastName", savedUser.getLastName());
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE_NAME, RabbitConfig.ROUTING_KEY_REGISTERED, emailMsg);

        AuthResponseDto response = new AuthResponseDto();
        response.setSuccess(true);
        response.setToken(token);
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());
        response.setUserId(savedUser.getId());
        return response;
    }

    @Override
    public AuthResponseDto login(LoginDto model) {
        Optional<User> optionalUser = userRepository.findByEmail(model.getEmail());
        if (optionalUser.isEmpty()) {
            return new AuthResponseDto(false, List.of("Invalid email or password."));
        }

        User user = optionalUser.get();
        if (!user.isActive()) {
            return new AuthResponseDto(false, List.of("Your account has been deactivated. Please contact support."));
        }

        if (!passwordEncoder.matches(model.getPassword(), user.getPasswordHash())) {
            return new AuthResponseDto(false, List.of("Invalid email or password."));
        }

        String token = generateJwtToken(user);

        AuthResponseDto response = new AuthResponseDto();
        response.setSuccess(true);
        response.setToken(token);
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setUserId(user.getId());
        return response;
    }

    @Override
    public UserDto getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + id));
        return mapToDto(user);
    }

    @Override
    public AuthResponseDto forgotPassword(ForgotPasswordDto model) {
        Optional<User> optionalUser = userRepository.findByEmail(model.getEmail());
        if (optionalUser.isEmpty()) {
            return new AuthResponseDto(false, List.of("User with this email address does not exist."));
        }

        User user = optionalUser.get();

        // Generate 6 digit random code
        String otp = String.format("%06d", new Random().nextInt(1000000));

        PasswordOtp passwordOtp = new PasswordOtp();
        passwordOtp.setUserEmail(user.getEmail());
        passwordOtp.setOtpCode(otp);
        passwordOtp.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        passwordOtpRepository.save(passwordOtp);

        // Publish event to RabbitMQ for OTP notification
        Map<String, String> emailMsg = new HashMap<>();
        emailMsg.put("email", user.getEmail());
        emailMsg.put("otp", otp);
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE_NAME, RabbitConfig.ROUTING_KEY_OTP, emailMsg);

        AuthResponseDto response = new AuthResponseDto();
        response.setSuccess(true);
        return response;
    }

    @Override
    public boolean verifyOtp(VerifyOtpDto model) {
        Optional<PasswordOtp> optionalOtp = passwordOtpRepository
                .findTopByUserEmailAndOtpCodeOrderByExpiresAtDesc(model.getEmail(), model.getOtp());
        
        if (optionalOtp.isEmpty()) {
            return false;
        }

        PasswordOtp passwordOtp = optionalOtp.get();
        return passwordOtp.getExpiresAt().isAfter(LocalDateTime.now());
    }

    @Override
    public AuthResponseDto resetPassword(ResetPasswordDto model) {
        Optional<User> optionalUser = userRepository.findByEmail(model.getEmail());
        if (optionalUser.isEmpty()) {
            return new AuthResponseDto(false, List.of("User with this email address does not exist."));
        }

        User user = optionalUser.get();

        VerifyOtpDto verifyDto = new VerifyOtpDto();
        verifyDto.setEmail(model.getEmail());
        verifyDto.setOtp(model.getOtp());
        if (!verifyOtp(verifyDto)) {
            return new AuthResponseDto(false, List.of("The OTP entered is invalid or has expired."));
        }

        user.setPasswordHash(passwordEncoder.encode(model.getNewPassword()));
        userRepository.save(user);

        AuthResponseDto response = new AuthResponseDto();
        response.setSuccess(true);
        return response;
    }

    @Override
    public UserDto createAgentUser(RegisterDto model) {
        Optional<User> existingUser = userRepository.findByEmail(model.getEmail());
        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("Email address is already in use.");
        }

        User user = new User();
        user.setFirstName(model.getFirstName());
        user.setLastName(model.getLastName());
        user.setEmail(model.getEmail());
        user.setPasswordHash(passwordEncoder.encode(model.getPassword()));
        user.setRole(model.getRole());
        user.setActive(true);

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    @Override
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + id));
        userRepository.delete(user);
    }

    private String generateJwtToken(User user) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpiryMinutes * 60 * 1000);

        return Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .issuedAt(now)
                .expiration(expiry)
                .issuer(jwtIssuer)
                .audience().add(jwtAudience).and()
                .signWith(key)
                .compact();
    }

    private UserDto mapToDto(User user) {
        return new UserDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.isActive()
        );
    }
}
