package com.rainbowforest.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import com.rainbowforest.userservice.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUserName(String userName);
    List<User> findByRole_Id(Long roleId);
    List<User> findByRole_IdIn(java.util.Collection<Long> roleIds);
}
