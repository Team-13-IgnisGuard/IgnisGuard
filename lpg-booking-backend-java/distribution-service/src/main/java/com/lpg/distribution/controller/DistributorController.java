package com.lpg.distribution.controller;

import com.lpg.distribution.dto.*;
import com.lpg.distribution.entity.Distributor;
import com.lpg.distribution.service.DistributorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/distributor")
public class DistributorController {

    private final DistributorService distributorService;

    public DistributorController(DistributorService distributorService) {
        this.distributorService = distributorService;
    }

    @GetMapping("/profile")
    public ResponseEntity<DistributorResponseDto> getProfile(@RequestHeader("X-User-Id") String userId) {
        DistributorResponseDto profile = distributorService.getProfileByUserId(userId);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/profile")
    public ResponseEntity<DistributorResponseDto> completeProfile(@RequestHeader("X-User-Id") String userId,
                                                                   @Valid @RequestBody CompleteDistributorProfileDto model) {
        DistributorResponseDto profile = distributorService.completeProfile(userId, model);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/agents")
    public ResponseEntity<List<AgentResponseDto>> getAgents(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(distributorService.getDeliveryAgents(userId));
    }

    @PostMapping("/agents")
    public ResponseEntity<?> addAgent(@RequestHeader("X-User-Id") String userId,
                                      @Valid @RequestBody CreateDeliveryAgentDto model) {
        AgentResponseDto agent = distributorService.addDeliveryAgent(userId, model);
        Map<String, Object> body = new HashMap<>();
        body.put("message", "Delivery agent registered successfully.");
        body.put("agent", agent);
        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/agents/{id}")
    public ResponseEntity<?> deleteAgent(@RequestHeader("X-User-Id") String userId,
                                         @PathVariable("id") int agentId) {
        distributorService.deleteDeliveryAgent(userId, agentId);
        return ResponseEntity.ok(Map.of("message", "Delivery agent deleted successfully."));
    }

    // INTERNAL API FOR OTHER SERVICES (E.G. BOOKING SERVICE)
    @GetMapping("/internal/check-stock/{id}")
    public ResponseEntity<DistributorResponseDto> checkStock(@PathVariable("id") int id) {
        Distributor dist = distributorService.getDistributorEntityById(id);
        return ResponseEntity.ok(new DistributorResponseDto(
                dist.getId(),
                dist.getUserId(),
                dist.getAgencyName(),
                dist.getAddress(),
                dist.getContactNumber(),
                dist.getInventoryCapacity(),
                dist.getCurrentStock()
        ));
    }

    @PostMapping("/internal/deduct-stock/{id}/{count}")
    public ResponseEntity<Void> deductStock(@PathVariable("id") int id, @PathVariable("count") int count) {
        distributorService.updateStock(id, -count);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/internal/restore-stock/{id}/{count}")
    public ResponseEntity<Void> restoreStock(@PathVariable("id") int id, @PathVariable("count") int count) {
        distributorService.updateStock(id, count);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/internal/agents/{id}")
    public ResponseEntity<AgentResponseDto> getAgentById(@PathVariable("id") int id) {
        return ResponseEntity.ok(distributorService.getAgentById(id));
    }

    @GetMapping("/internal/all")
    public ResponseEntity<List<DistributorResponseDto>> getAllDistributorsInternal() {
        return ResponseEntity.ok(distributorService.getAllDistributors());
    }
}
