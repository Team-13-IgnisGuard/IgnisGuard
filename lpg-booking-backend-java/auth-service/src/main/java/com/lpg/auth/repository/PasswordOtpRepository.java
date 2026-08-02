package com.lpg.auth.repository;

import com.lpg.auth.entity.PasswordOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordOtpRepository extends JpaRepository<PasswordOtp, Long> {
    Optional<PasswordOtp> findTopByUserEmailAndOtpCodeOrderByExpiresAtDesc(String userEmail, String otpCode);
}
