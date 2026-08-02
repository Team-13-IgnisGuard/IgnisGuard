package com.lpg.auth.service;

import com.lpg.auth.dto.*;

public interface AuthService {
    AuthResponseDto register(RegisterDto model);
    AuthResponseDto login(LoginDto model);
    UserDto getUserById(String id);
    AuthResponseDto forgotPassword(ForgotPasswordDto model);
    boolean verifyOtp(VerifyOtpDto model);
    AuthResponseDto resetPassword(ResetPasswordDto model);
    UserDto createAgentUser(RegisterDto model);
    void deleteUser(String id);
}
