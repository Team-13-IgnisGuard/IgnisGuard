package com.lpg.distribution.config;

import com.lpg.distribution.entity.DeliveryAgent;
import com.lpg.distribution.entity.Distributor;
import com.lpg.distribution.repository.DeliveryAgentRepository;
import com.lpg.distribution.repository.DistributorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SeedDataRunner implements CommandLineRunner {

    private final DistributorRepository distributorRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;

    public SeedDataRunner(DistributorRepository distributorRepository,
                          DeliveryAgentRepository deliveryAgentRepository) {
        this.distributorRepository = distributorRepository;
        this.deliveryAgentRepository = deliveryAgentRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed Distributor
        String distUserId = "distributor-id-2222";
        Optional<Distributor> existingDist = distributorRepository.findByUserId(distUserId);
        Distributor distributor;
        if (existingDist.isEmpty()) {
            distributor = new Distributor();
            distributor.setUserId(distUserId);
            distributor.setAgencyName("Super Gas Agency");
            distributor.setAddress("45 Ring Road, Sector 5, Mumbai");
            distributor.setContactNumber("9988776655");
            distributor.setInventoryCapacity(1000);
            distributor.setCurrentStock(450);
            distributor = distributorRepository.save(distributor);
        } else {
            distributor = existingDist.get();
        }

        // Seed Delivery Agent
        String agentUserId = "agent-id-3333";
        Optional<DeliveryAgent> existingAgent = deliveryAgentRepository.findByUserId(agentUserId);
        if (existingAgent.isEmpty()) {
            DeliveryAgent agent = new DeliveryAgent();
            agent.setUserId(agentUserId);
            agent.setName("Ramesh Kumar");
            agent.setPhone("9112233445");
            agent.setVehicleNumber("MH-02-AB-1234");
            agent.setDistributorId(distributor.getId());
            agent.setAvailable(true);
            deliveryAgentRepository.save(agent);
        }
    }
}
