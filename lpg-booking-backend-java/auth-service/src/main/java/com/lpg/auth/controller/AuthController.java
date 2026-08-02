package com.lpg.auth.controller;

import com.lpg.auth.dto.*;
import com.lpg.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterDto model) {
        AuthResponseDto result = authService.register(model);
        if (!result.isSuccess()) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginDto model) {
        AuthResponseDto result = authService.login(model);
        if (!result.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("X-User-Id") String userId,
                                            @RequestHeader("X-User-Email") String email,
                                            @RequestHeader("X-User-Role") String role) {
        Map<String, String> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("role", role);
        return ResponseEntity.ok(claims);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponseDto> forgotPassword(@Valid @RequestBody ForgotPasswordDto model) {
        AuthResponseDto result = authService.forgotPassword(model);
        if (!result.isSuccess()) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpDto model) {
        boolean isValid = authService.verifyOtp(model);
        Map<String, Object> response = new HashMap<>();
        response.put("isSuccess", isValid);
        response.put("message", isValid ? "OTP code matches." : "Invalid or expired OTP.");
        
        if (!isValid) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponseDto> resetPassword(@Valid @RequestBody ResetPasswordDto model) {
        AuthResponseDto result = authService.resetPassword(model);
        if (!result.isSuccess()) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    // INTERNAL API FOR FEIGN CLIENTS (NOT ACCESSIBLE OUTSIDE CLUSTER)
    @GetMapping("/internal/users/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(authService.getUserById(id));
    }

    @PostMapping("/internal/users/agent")
    public ResponseEntity<UserDto> createAgentUser(@RequestBody RegisterDto model) {
        return ResponseEntity.ok(authService.createAgentUser(model));
    }

    @DeleteMapping("/internal/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        authService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}
