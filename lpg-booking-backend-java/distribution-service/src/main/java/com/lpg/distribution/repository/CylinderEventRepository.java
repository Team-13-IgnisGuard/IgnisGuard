package com.lpg.distribution.repository;

import com.lpg.distribution.entity.CylinderEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CylinderEventRepository extends JpaRepository<CylinderEvent, Long> {
    List<CylinderEvent> findByCylinderIdOrderByTimestampDesc(Integer cylinderId);
    Optional<CylinderEvent> findFirstByCylinderIdAndEventTypeOrderByTimestampDesc(Integer cylinderId, String eventType);
    List<CylinderEvent> findBySuspiciousTrueOrderByTimestampDesc();
}
