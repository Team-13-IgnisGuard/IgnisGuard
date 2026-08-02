package com.lpg.auth.config;

import com.lpg.auth.entity.User;
import com.lpg.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SeedDataRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SeedDataRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed Super Admin
        String superAdminEmail = "superadmin@lpgbooking.com";
        Optional<User> existingSuperAdmin = userRepository.findByEmail(superAdminEmail);
        if (existingSuperAdmin.isEmpty()) {
            User superAdmin = new User();
            superAdmin.setId("superadmin-id-0000");
            superAdmin.setFirstName("Super");
            superAdmin.setLastName("Admin");
            superAdmin.setEmail(superAdminEmail);
            superAdmin.setPasswordHash(passwordEncoder.encode("SuperAdmin@123"));
            superAdmin.setRole("SuperAdmin");
            superAdmin.setActive(true);
            userRepository.save(superAdmin);
        }

        // Seed Warehouse Manager
        String warehouseEmail = "warehouse1@lpgbooking.com";
        Optional<User> existingWarehouse = userRepository.findByEmail(warehouseEmail);
        if (existingWarehouse.isEmpty()) {
            User warehouse = new User();
            warehouse.setId("warehouse-id-4444");
            warehouse.setFirstName("Priya");
            warehouse.setLastName("Sharma");
            warehouse.setEmail(warehouseEmail);
            warehouse.setPasswordHash(passwordEncoder.encode("Warehouse@123"));
            warehouse.setRole("WarehouseManager");
            warehouse.setActive(true);
            userRepository.save(warehouse);
        }

        // Seed Admin
        String adminEmail = "admin@lpgbooking.com";
        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);
        if (existingAdmin.isEmpty()) {
            User admin = new User();
            admin.setId("admin-id-1111");
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            admin.setRole("Admin");
            admin.setActive(true);
            userRepository.save(admin);
        }

        // Seed Distributor
        String distEmail = "distributor1@lpgbooking.com";
        Optional<User> existingDist = userRepository.findByEmail(distEmail);
        if (existingDist.isEmpty()) {
            User dist = new User();
            dist.setId("distributor-id-2222");
            dist.setFirstName("Super");
            dist.setLastName("Agency");
            dist.setEmail(distEmail);
            dist.setPasswordHash(passwordEncoder.encode("Distributor@123"));
            dist.setRole("Distributor");
            dist.setActive(true);
            userRepository.save(dist);
        }

        // Seed Delivery Agent
        String agentEmail = "agent1@lpgbooking.com";
        Optional<User> existingAgent = userRepository.findByEmail(agentEmail);
        if (existingAgent.isEmpty()) {
            User agent = new User();
            agent.setId("agent-id-3333");
            agent.setFirstName("Ramesh");
            agent.setLastName("Kumar");
            agent.setEmail(agentEmail);
            agent.setPasswordHash(passwordEncoder.encode("Agent@123"));
            agent.setRole("DeliveryAgent");
            agent.setActive(true);
            userRepository.save(agent);
        }
    }
}
