package com.lpg.distribution.repository;

import com.lpg.distribution.entity.Distributor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DistributorRepository extends JpaRepository<Distributor, Integer> {
    Optional<Distributor> findByUserId(String userId);
}
