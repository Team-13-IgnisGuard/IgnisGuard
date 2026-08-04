package com.lpg.distribution.repository;

import com.lpg.distribution.entity.DeliveryAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DeliveryAgentRepository extends JpaRepository<DeliveryAgent, Integer> {
    Optional<DeliveryAgent> findByUserId(String userId);
    List<DeliveryAgent> findByDistributorId(int distributorId);
}
