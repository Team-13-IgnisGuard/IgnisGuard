package com.lpg.distribution.controller;

import com.lpg.distribution.dto.DistributorResponseDto;
import com.lpg.distribution.service.DistributorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final DistributorService distributorService;

    public AdminController(DistributorService distributorService) {
        this.distributorService = distributorService;
    }

    @GetMapping("/distributors")
    public ResponseEntity<List<DistributorResponseDto>> getAllDistributors() {
        return ResponseEntity.ok(distributorService.getAllDistributors());
    }

    @GetMapping("/agents")
    public ResponseEntity<List<Map<String, Object>>> getAllAgents() {
        return ResponseEntity.ok(distributorService.getAllDeliveryAgents());
    }

    @PostMapping("/distributors/{id}/stock")
    public ResponseEntity<?> replenishStock(@PathVariable("id") int id, @RequestBody int quantity) {
        distributorService.replenishStock(id, quantity);
        
        var dist = distributorService.getDistributorEntityById(id);
        
        Map<String, Object> body = new HashMap<>();
        body.put("message", "Distributor stock replenished successfully.");
        body.put("agencyName", dist.getAgencyName());
        body.put("newStock", dist.getCurrentStock());
        
        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/distributors/{id}")
    public ResponseEntity<?> deleteDistributor(@PathVariable("id") int id) {
        distributorService.deleteDistributor(id);
        return ResponseEntity.ok(Map.of("message", "Distributor agency, drivers, and history deleted successfully."));
    }
}
