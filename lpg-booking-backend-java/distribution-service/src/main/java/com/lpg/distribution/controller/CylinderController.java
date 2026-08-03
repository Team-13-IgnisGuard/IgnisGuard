package com.lpg.distribution.controller;

import com.lpg.distribution.dto.*;
import com.lpg.distribution.service.CylinderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class CylinderController {

    private final CylinderService cylinderService;

    public CylinderController(CylinderService cylinderService) {
        this.cylinderService = cylinderService;
    }

    // Registration: intended for Warehouse Manager / Super Admin when a new cylinder enters the system.
    @PostMapping("/api/distributor/cylinders/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterCylinderDto dto,
                                       @RequestHeader("X-User-Role") String role) {
        requireRole(role, "WarehouseManager", "SuperAdmin", "Admin");
        CylinderResponseDto result = cylinderService.registerCylinder(dto);
        return ResponseEntity.ok(Map.of(
                "message", "Cylinder registered and QR assigned.",
                "cylinder", result
        ));
    }

    // Generic movement scan: used by Warehouse Manager, Distributor, and Delivery Agent apps
    // for every non-final-delivery checkpoint (dispatch, handover, return, refill pickup).
    @PostMapping("/api/distributor/cylinders/scan")
    public ResponseEntity<?> scan(@Valid @RequestBody CylinderScanRequestDto dto,
                                   @RequestHeader("X-User-Id") String userId,
                                   @RequestHeader("X-User-Role") String role) {
        CylinderResponseDto result = cylinderService.scanCylinder(dto, userId, role);
        return ResponseEntity.ok(Map.of(
                "message", "Scan recorded. Cylinder status: " + result.getStatus(),
                "cylinder", result
        ));
    }

    @GetMapping("/api/distributor/cylinders/{id}")
    public ResponseEntity<CylinderResponseDto> getCylinder(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(cylinderService.getCylinder(id));
    }

    @GetMapping("/api/distributor/cylinders")
    public ResponseEntity<List<CylinderResponseDto>> getAllCylinders() {
        return ResponseEntity.ok(cylinderService.getAllCylinders());
    }

    // Full chain-of-custody visibility for the calling distributor: cylinders
    // currently at their agency, with their delivery agents, or with their
    // customers — not just what's physically on-site right now.
    @GetMapping("/api/distributor/cylinders/mine")
    public ResponseEntity<List<CylinderResponseDto>> getMyCylinders(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(cylinderService.getCylindersForDistributor(userId));
    }

    @GetMapping("/api/distributor/cylinders/{id}/history")
    public ResponseEntity<List<CylinderEventResponseDto>> getHistory(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(cylinderService.getHistory(id));
    }

    // Admin/Super Admin discrepancy view: every scan ever flagged as suspicious.
    @GetMapping("/api/distributor/cylinders/flagged")
    public ResponseEntity<List<CylinderEventResponseDto>> getFlagged(@RequestHeader("X-User-Role") String role) {
        requireRole(role, "Admin", "SuperAdmin");
        return ResponseEntity.ok(cylinderService.getFlaggedEvents());
    }

    // --- INTERNAL API (called by booking-service via Feign during OTP-based delivery confirmation) ---
    @PostMapping("/api/distributor/internal/cylinders/verify-delivery")
    public ResponseEntity<DeliveryScanVerifyResponseDto> verifyDelivery(@RequestBody DeliveryScanVerifyRequestDto dto) {
        return ResponseEntity.ok(cylinderService.verifyDeliveryScan(dto));
    }

    private void requireRole(String actualRole, String... allowedRoles) {
        for (String allowed : allowedRoles) {
            if (allowed.equalsIgnoreCase(actualRole)) return;
        }
        throw new IllegalArgumentException("You do not have permission to perform this action.");
    }
}
