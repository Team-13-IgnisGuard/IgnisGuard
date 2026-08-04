package com.lpg.distribution.repository;

import com.lpg.distribution.entity.Cylinder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CylinderRepository extends JpaRepository<Cylinder, Integer> {
    Optional<Cylinder> findByQrToken(String qrToken);
    Optional<Cylinder> findByEngravedSerialNumber(String engravedSerialNumber);
    boolean existsByEngravedSerialNumber(String engravedSerialNumber);
    List<Cylinder> findByDistributorId(Integer distributorId);
}
