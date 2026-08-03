package com.lpg.distribution.service;

import com.lpg.distribution.dto.*;

import java.util.List;

public interface CylinderService {
    CylinderResponseDto registerCylinder(RegisterCylinderDto dto);
    CylinderResponseDto scanCylinder(CylinderScanRequestDto dto, String userId, String role);
    CylinderResponseDto getCylinder(Integer id);
    List<CylinderResponseDto> getAllCylinders();
    List<CylinderResponseDto> getCylindersForDistributor(String userId);
    List<CylinderEventResponseDto> getHistory(Integer cylinderId);
    List<CylinderEventResponseDto> getFlaggedEvents();
    DeliveryScanVerifyResponseDto verifyDeliveryScan(DeliveryScanVerifyRequestDto dto);
}
