package com.lpg.distribution.service;

import com.lpg.distribution.dto.*;
import com.lpg.distribution.entity.Distributor;
import java.util.List;
import java.util.Map;

public interface DistributorService {
    DistributorResponseDto getProfileByUserId(String userId);
    DistributorResponseDto completeProfile(String userId, CompleteDistributorProfileDto model);
    
    List<AgentResponseDto> getDeliveryAgents(String distributorUserId);
    AgentResponseDto addDeliveryAgent(String distributorUserId, CreateDeliveryAgentDto model);
    void deleteDeliveryAgent(String distributorUserId, int agentId);
    
    // Internal & Admin helper methods
    Distributor getDistributorEntityById(int id);
    void updateStock(int id, int quantityChange);
    AgentResponseDto getAgentById(int id);
    
    List<DistributorResponseDto> getAllDistributors();
    List<Map<String, Object>> getAllDeliveryAgents();
    void replenishStock(int distributorId, int quantity);
    void deleteDistributor(int distributorId);
}
