package com.lpg.distribution.client;

import com.lpg.distribution.dto.RegisterDto;
import com.lpg.distribution.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "auth-service")
public interface AuthFeignClient {

    @GetMapping("/api/auth/internal/users/{id}")
    UserDto getUserById(@PathVariable("id") String id);

    @PostMapping("/api/auth/internal/users/agent")
    UserDto createAgentUser(@RequestBody RegisterDto model);

    @DeleteMapping("/api/auth/internal/users/{id}")
    void deleteUser(@PathVariable("id") String id);
}
