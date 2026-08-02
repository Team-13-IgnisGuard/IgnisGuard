package com.lpg.distribution.controller;

import com.lpg.distribution.dto.AgentResponseDto;
import com.lpg.distribution.entity.DeliveryAgent;
import com.lpg.distribution.repository.DeliveryAgentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
public class DeliveryAgentController {

    private final DeliveryAgentRepository deliveryAgentRepository;

    public DeliveryAgentController(DeliveryAgentRepository deliveryAgentRepository) {
        this.deliveryAgentRepository = deliveryAgentRepository;
    }

    // Called by the agent's own frontend, through the gateway — carries real
    // X-User-Id / X-User-Role headers set by GatewayHeaderAuthenticationFilter.
    @GetMapping("/api/deliveryagent/profile")
    public ResponseEntity<AgentResponseDto> getProfile(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(toDto(lookupByUserId(userId)));
    }

    // --- INTERNAL API (service-to-service Feign calls bypass the gateway,
    // so they never carry the gateway's auth headers — this must live under
    // the permitAll /api/distributor/internal/** prefix, same as every other
    // inter-service call in this project) ---
    @GetMapping("/api/distributor/internal/agents/by-user/{userId}")
    public ResponseEntity<AgentResponseDto> getAgentProfileInternal(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(toDto(lookupByUserId(userId)));
    }

    private DeliveryAgent lookupByUserId(String userId) {
        return deliveryAgentRepository.findByUserId(userId)
                .orElseThrow(() -> new NoSuchElementException("Delivery agent profile not found."));
    }

    private AgentResponseDto toDto(DeliveryAgent agent) {
        return new AgentResponseDto(
                agent.getId(),
                agent.getName(),
                agent.getPhone(),
                agent.getVehicleNumber(),
                agent.isAvailable()
        );
    }
}
