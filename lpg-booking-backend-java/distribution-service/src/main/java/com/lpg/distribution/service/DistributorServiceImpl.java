package com.lpg.distribution.service;

import com.lpg.distribution.client.AuthFeignClient;
import com.lpg.distribution.client.BookingFeignClient;
import com.lpg.distribution.dto.*;
import com.lpg.distribution.entity.DeliveryAgent;
import com.lpg.distribution.entity.Distributor;
import com.lpg.distribution.repository.DeliveryAgentRepository;
import com.lpg.distribution.repository.DistributorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class DistributorServiceImpl implements DistributorService {

    private final DistributorRepository distributorRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final AuthFeignClient authFeignClient;
    private final BookingFeignClient bookingFeignClient;

    public DistributorServiceImpl(DistributorRepository distributorRepository,
                                  DeliveryAgentRepository deliveryAgentRepository,
                                  AuthFeignClient authFeignClient,
                                  BookingFeignClient bookingFeignClient) {
        this.distributorRepository = distributorRepository;
        this.deliveryAgentRepository = deliveryAgentRepository;
        this.authFeignClient = authFeignClient;
        this.bookingFeignClient = bookingFeignClient;
    }

    @Override
    public DistributorResponseDto getProfileByUserId(String userId) {
        Distributor distributor = distributorRepository.findByUserId(userId)
                .orElse(null);
        return distributor != null ? mapToDto(distributor) : null;
    }

    @Override
    public DistributorResponseDto completeProfile(String userId, CompleteDistributorProfileDto model) {
        Distributor distributor = distributorRepository.findByUserId(userId)
                .orElse(null);

        if (distributor == null) {
            distributor = new Distributor();
            distributor.setUserId(userId);
        }

        distributor.setAgencyName(model.getAgencyName());
        distributor.setAddress(model.getAddress());
        distributor.setContactNumber(model.getContactNumber());
        distributor.setInventoryCapacity(model.getInventoryCapacity());
        
        if (model.getCurrentStock() > model.getInventoryCapacity()) {
            throw new IllegalArgumentException("Current stock cannot exceed maximum inventory capacity.");
        }
        distributor.setCurrentStock(model.getCurrentStock());

        Distributor saved = distributorRepository.save(distributor);
        return mapToDto(saved);
    }

    @Override
    public List<AgentResponseDto> getDeliveryAgents(String distributorUserId) {
        Distributor distributor = distributorRepository.findByUserId(distributorUserId)
                .orElseThrow(() -> new NoSuchElementException("Distributor profile not found."));

        return deliveryAgentRepository.findByDistributorId(distributor.getId()).stream()
                .map(this::mapToAgentDto)
                .collect(Collectors.toList());
    }

    @Override
    public AgentResponseDto addDeliveryAgent(String distributorUserId, CreateDeliveryAgentDto model) {
        Distributor distributor = distributorRepository.findByUserId(distributorUserId)
                .orElseThrow(() -> new NoSuchElementException("Distributor profile not found."));

        // Call Auth service to create user
        RegisterDto registerDto = new RegisterDto();
        registerDto.setEmail(model.getEmail());
        registerDto.setPassword(model.getPassword());
        registerDto.setConfirmPassword(model.getPassword());
        registerDto.setRole("DeliveryAgent");

        // Split name for auth account
        String[] nameParts = model.getName().split(" ", 2);
        registerDto.setFirstName(nameParts[0]);
        registerDto.setLastName(nameParts.length > 1 ? nameParts[1] : "Driver");

        // Execute inter-service registration call
        UserDto authUser = authFeignClient.createAgentUser(registerDto);

        // Save local Delivery Agent profile
        DeliveryAgent agent = new DeliveryAgent();
        agent.setUserId(authUser.getId());
        agent.setName(model.getName());
        agent.setPhone(model.getPhone());
        agent.setVehicleNumber(model.getVehicleNumber());
        agent.setDistributorId(distributor.getId());
        agent.setAvailable(true);

        DeliveryAgent saved = deliveryAgentRepository.save(agent);
        return mapToAgentDto(saved);
    }

    @Override
    public void deleteDeliveryAgent(String distributorUserId, int agentId) {
        Distributor distributor = distributorRepository.findByUserId(distributorUserId)
                .orElseThrow(() -> new NoSuchElementException("Distributor profile not found."));

        DeliveryAgent agent = deliveryAgentRepository.findById(agentId)
                .orElseThrow(() -> new NoSuchElementException("Delivery agent not found."));

        if (agent.getDistributorId() != distributor.getId()) {
            throw new IllegalArgumentException("Unauthorized attempt to access another distributor's agent.");
        }

        // Call Booking service to check active deliveries
        long activeCount = bookingFeignClient.getActiveBookingCountByAgentId(agentId);
        if (activeCount > 0) {
            throw new IllegalStateException("Cannot delete delivery agent with active or pending deliveries. Reassign or complete those bookings first.");
        }

        // Delete profile and user account
        deliveryAgentRepository.delete(agent);
        authFeignClient.deleteUser(agent.getUserId());
    }

    @Override
    public Distributor getDistributorEntityById(int id) {
        return distributorRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Distributor not found: " + id));
    }

    @Override
    public void updateStock(int id, int quantityChange) {
        Distributor distributor = getDistributorEntityById(id);
        int newStock = distributor.getCurrentStock() + quantityChange;
        
        if (newStock < 0) {
            throw new IllegalArgumentException("Insufficient inventory stock.");
        }
        if (newStock > distributor.getInventoryCapacity()) {
            throw new IllegalArgumentException("Operation would exceed warehouse inventory capacity.");
        }
        
        distributor.setCurrentStock(newStock);
        distributorRepository.save(distributor);
    }

    @Override
    public AgentResponseDto getAgentById(int id) {
        DeliveryAgent agent = deliveryAgentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Delivery agent not found: " + id));
        return mapToAgentDto(agent);
    }

    @Override
    public List<DistributorResponseDto> getAllDistributors() {
        return distributorRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getAllDeliveryAgents() {
        List<DeliveryAgent> agents = deliveryAgentRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (DeliveryAgent agent : agents) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", agent.getId());
            map.put("name", agent.getName());
            map.put("phone", agent.getPhone());
            map.put("vehicleNumber", agent.getVehicleNumber());
            map.put("isAvailable", agent.isAvailable());
            
            // Resolve emails from auth service
            try {
                UserDto user = authFeignClient.getUserById(agent.getUserId());
                map.put("email", user.getEmail());
            } catch (Exception e) {
                map.put("email", "");
            }

            // Resolve agency name
            try {
                Distributor dist = getDistributorEntityById(agent.getDistributorId());
                map.put("distributorAgencyName", dist.getAgencyName());
            } catch (Exception e) {
                map.put("distributorAgencyName", "Not Assigned");
            }
            
            result.add(map);
        }
        return result;
    }

    @Override
    public void replenishStock(int distributorId, int quantity) {
        Distributor distributor = getDistributorEntityById(distributorId);
        
        if (quantity <= 0) {
            throw new IllegalArgumentException("Replenishment quantity must be greater than zero.");
        }

        if (distributor.getCurrentStock() + quantity > distributor.getInventoryCapacity()) {
            throw new IllegalArgumentException("Replenishment of " + quantity + " cylinders would exceed maximum capacity. Remaining capacity is " + (distributor.getInventoryCapacity() - distributor.getCurrentStock()) + " cylinders.");
        }

        distributor.setCurrentStock(distributor.getCurrentStock() + quantity);
        distributorRepository.save(distributor);
    }

    @Override
    public void deleteDistributor(int distributorId) {
        Distributor distributor = getDistributorEntityById(distributorId);

        // Check active bookings in booking-service
        long activeCount = bookingFeignClient.getActiveBookingCountByDistributorId(distributorId);
        if (activeCount > 0) {
            throw new IllegalStateException("Cannot delete distributor agency with active or pending bookings. Complete or cancel those bookings first.");
        }

        // Delete all agents and user logins under this distributor
        List<DeliveryAgent> agents = deliveryAgentRepository.findByDistributorId(distributorId);
        for (DeliveryAgent agent : agents) {
            deliveryAgentRepository.delete(agent);
            try {
                authFeignClient.deleteUser(agent.getUserId());
            } catch (Exception e) {
                // Log and continue if auth fails
            }
        }

        // Delete distributor profile and user login
        distributorRepository.delete(distributor);
        try {
            authFeignClient.deleteUser(distributor.getUserId());
        } catch (Exception e) {
            // Log and continue
        }
    }

    private DistributorResponseDto mapToDto(Distributor dist) {
        return new DistributorResponseDto(
                dist.getId(),
                dist.getUserId(),
                dist.getAgencyName(),
                dist.getAddress(),
                dist.getContactNumber(),
                dist.getInventoryCapacity(),
                dist.getCurrentStock()
        );
    }

    private AgentResponseDto mapToAgentDto(DeliveryAgent agent) {
        return new AgentResponseDto(
                agent.getId(),
                agent.getName(),
                agent.getPhone(),
                agent.getVehicleNumber(),
                agent.isAvailable()
        );
    }
}
