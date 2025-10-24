package edu.uth.evservice.EVService.controller.Customer;

import edu.uth.evservice.EVService.dto.AppointmentDto;
import edu.uth.evservice.EVService.dto.ServiceCenterDto;
import edu.uth.evservice.EVService.requests.AppointmentRequest;
import edu.uth.evservice.EVService.services.IAppointmentService;
import edu.uth.evservice.EVService.services.IServiceCenterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller đặt lịch & theo dõi dịch vụ
 * 2.2.1 - Đặt lịch bảo dưỡng/sửa chữa trực tuyến
 * 2.2.2 - Chọn trung tâm dịch vụ và loại dịch vụ
 * 2.2.3 - Nhận xác nhận và thông báo trạng thái của xe
 */
@RestController
@RequestMapping("/api/customer/service-schedule")
public class ServiceScheduleController {

    @Autowired
    private IAppointmentService appointmentService;

    @Autowired
    private IServiceCenterService serviceCenterService;

    /**
     * 2.2.1 - Đặt lịch bảo dưỡng/sửa chữa trực tuyến
     */
    @PostMapping("/appointments")
    public ResponseEntity<AppointmentDto> createAppointment(@RequestBody AppointmentRequest request) {
        // Khách hàng là người tạo lịch, nên createdById chính là customerId
        request.setCreatedById(request.getCustomerId());
        AppointmentDto appointment = appointmentService.createAppointment(request);
        return ResponseEntity.ok(appointment);
    }

    /**
     * 2.2.2 - Lấy danh sách tất cả trung tâm dịch vụ
     */
    @GetMapping("/service-centers")
    public ResponseEntity<List<ServiceCenterDto>> getServiceCenters() {
        List<ServiceCenterDto> centers = serviceCenterService.getAllServiceCenters();
        return ResponseEntity.ok(centers);
    }

    /**
     * 2.2.2 - Lấy danh sách loại dịch vụ theo trung tâm
     * LƯU Ý: Chức năng này chưa có trong Service.
     * Cần thêm logic vào IServiceCenterService và ServiceCenterServiceImpl để nó hoạt động.
     */
    /*
    @GetMapping("/service-centers/{centerId}/service-types")
    public ResponseEntity<List<String>> getServiceTypes(@PathVariable int centerId) {
        // VÍ DỤ: List<String> serviceTypes = serviceCenterService.getServiceTypesByCenter(centerId);
        // return ResponseEntity.ok(serviceTypes);
        return ResponseEntity.notFound().build(); // Tạm thời trả về 404 Not Found
    }
    */

    /**
     * 2.2.3 - Lấy chi tiết lịch hẹn và theo dõi trạng thái
     */
    @GetMapping("/appointments/{appointmentId}")
    public ResponseEntity<AppointmentDto> getAppointmentDetail(@PathVariable int appointmentId) {
        AppointmentDto appointment = appointmentService.getAppointmentById(appointmentId);
        return ResponseEntity.ok(appointment);
    }

    /**
     * Lấy lịch sử đặt lịch của một khách hàng
     */
    @GetMapping("/customers/{customerId}/appointments")
    public ResponseEntity<List<AppointmentDto>> getAppointmentHistory(@PathVariable int customerId) {
        List<AppointmentDto> appointments = appointmentService.getByCustomer(customerId);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Hủy một lịch hẹn
     */
    @PutMapping("/appointments/{appointmentId}/cancel")
    public ResponseEntity<AppointmentDto> cancelAppointment(@PathVariable int appointmentId) {
        AppointmentDto cancelledAppointment = appointmentService.updateStatus(appointmentId, "CANCELLED");
        return ResponseEntity.ok(cancelledAppointment);
    }
}