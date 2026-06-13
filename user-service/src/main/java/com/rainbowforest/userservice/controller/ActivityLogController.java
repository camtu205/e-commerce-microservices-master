package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.ActivityLog;
import com.rainbowforest.userservice.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;

@RestController
public class ActivityLogController {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @GetMapping("/accounts/activity-logs")
    public ResponseEntity<List<ActivityLog>> getActivityLogs() {
        List<ActivityLog> logs = activityLogRepository.findAllByOrderByTimestampDesc();
        return new ResponseEntity<>(logs, HttpStatus.OK);
    }

    @PostMapping("/accounts/activity-logs")
    public ResponseEntity<ActivityLog> createActivityLog(@RequestBody ActivityLog log, HttpServletRequest request) {
        if (log.getTimestamp() == null) {
            log.setTimestamp(LocalDateTime.now());
        }
        if (log.getIpAddress() == null || log.getIpAddress().isEmpty()) {
            // Get client IP address, checking X-Forwarded-For header if behind a gateway/proxy
            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getRemoteAddr();
            }
            log.setIpAddress(ip);
        }
        ActivityLog savedLog = activityLogRepository.save(log);
        return new ResponseEntity<>(savedLog, HttpStatus.CREATED);
    }
}
