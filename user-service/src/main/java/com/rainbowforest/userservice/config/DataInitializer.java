package com.rainbowforest.userservice.config;

import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (userRoleRepository.count() == 0) {
            UserRole admin = new UserRole();
            admin.setId(1L);
            admin.setRoleName("ADMIN");
            userRoleRepository.save(admin);

            UserRole staff = new UserRole();
            staff.setId(2L);
            staff.setRoleName("STAFF");
            userRoleRepository.save(staff);

            UserRole customer = new UserRole();
            customer.setId(3L);
            customer.setRoleName("CUSTOMER");
            userRoleRepository.save(customer);
            
            System.out.println("DataInitializer: Roles created successfully.");
        }
    }
}
