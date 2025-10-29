package edu.uth.evservice.EVService.controller.Customer;

import edu.uth.evservice.EVService.dto.CustomerPackageContractDto;
import edu.uth.evservice.EVService.dto.NotificationDto;
import edu.uth.evservice.EVService.dto.VehicleDto;
import edu.uth.evservice.EVService.services.ICustomerPackageContractService;
import edu.uth.evservice.EVService.services.INotificationService;
import edu.uth.evservice.EVService.services.IVehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//=======Theo dõi xe và nhắc nhở=========//
@RestController
@RequestMapping("/api/customer/tracking")
public class VehicleTrackingController {

    @Autowired
    private IVehicleService vehicleService;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private ICustomerPackageContractService contractService;

    /**
     * Lấy danh sách thông báo nhắc nhở (VD: bảo dưỡng) theo customerId
     */
    @GetMapping("/{customerId}/notifications")
    public ResponseEntity<List<NotificationDto>> getNotifications(@PathVariable int customerId) {
        List<NotificationDto> notifications = notificationService.getNotificationsByUser(customerId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Lấy danh sách các hợp đồng gói dịch vụ (để nhắc nhở thanh toán và gia hạn)
     */
    @GetMapping("/{customerId}/contracts")
    public ResponseEntity<List<CustomerPackageContractDto>> getPackageContracts(@PathVariable int customerId) {
        List<CustomerPackageContractDto> contracts = contractService.getContractsByCustomerId(customerId);
        return ResponseEntity.ok(contracts);
    }

    /**
     * Lấy danh sách xe của khách hàng
     */
    @GetMapping("/{customerId}/vehicles")
    public ResponseEntity<List<VehicleDto>> getCustomerVehicles(@PathVariable int customerId) {
        List<VehicleDto> vehicles = vehicleService.getVehiclesByUser(customerId);
        return ResponseEntity.ok(vehicles);
    }

    /**
     * Đánh dấu một thông báo đã đọc
     */
    @PutMapping("/notifications/{notificationId}/mark-read")
    public ResponseEntity<NotificationDto> markNotificationAsRead(@PathVariable int notificationId) {
        NotificationDto updatedNotification = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(updatedNotification);
    }
}