package edu.uth.evservice.services.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.uth.evservice.dtos.CustomerPackageContractDto;
import edu.uth.evservice.models.CustomerPackageContract;
import edu.uth.evservice.models.ServicePackage;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.enums.ContractStatus;
import edu.uth.evservice.repositories.ICustomerPackageContractRepository;
import edu.uth.evservice.repositories.IServicePackageRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.requests.CustomerPackageContractRequest;
import edu.uth.evservice.requests.NotificationRequest;
import edu.uth.evservice.services.ICustomerPackageContractService;
import edu.uth.evservice.services.INotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerPackageContractServiceImpl implements ICustomerPackageContractService {

    private final ICustomerPackageContractRepository contractRepository;
    private final IUserRepository userRepository;
    private final IServicePackageRepository packageRepository;
    private final INotificationService notificationService;

    @Override
    @Transactional
    public CustomerPackageContractDto purchasePackage(CustomerPackageContractRequest request,
            Integer UserId) {

        // 1. Tìm khách hàng (User) từ username trong token
        User customer = userRepository.findByUserId(UserId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng."));

        // 2. Tìm gói dịch vụ (ServicePackage) mà khách muốn mua
        ServicePackage servicePackage = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy gói dịch vụ với ID: " + request.getPackageId()));

        // 3. Kiểm tra logic: Khách hàng đã mua gói này và còn 'ACTIVE' không?
        boolean alreadyActive = contractRepository.existsByUser_UserIdAndServicePackage_PackageIdAndStatus(
                UserId,
                request.getPackageId(),
                ContractStatus.ACTIVE);
        if (alreadyActive) {
            throw new RuntimeException("Bạn đã mua gói dịch vụ này và nó vẫn còn đang hoạt động.");
        }

        // 4. Tính toán ngày
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusMonths(servicePackage.getDuration());

        // 5. Tạo hợp đồng mới
        CustomerPackageContract newContract = CustomerPackageContract.builder()
                .user(customer)
                .servicePackage(servicePackage)
                .contractId(null) // Để JPA tự sinh ID
                .contractName(servicePackage.getPackageName()) // Tự động tạo tên
                .startDate(startDate)
                .endDate(endDate)
                .status(ContractStatus.ACTIVE)
                .build();

        CustomerPackageContract savedContract = contractRepository.save(newContract);

        // (Bước 6: Tương lai sẽ gọi service tạo hóa đơn ở đây)

        return toDTO(savedContract);
    }

    @Override
    public List<CustomerPackageContractDto> getMyContracts(Integer UserId) {
        return contractRepository.findByUser_UserId(UserId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerPackageContractDto getMyContractById(Integer contractId, Integer UserId) {
        CustomerPackageContract contract = contractRepository
                .findByContractIdAndUser_UserId(contractId, UserId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy hợp đồng hoặc bạn không có quyền xem."));
        return toDTO(contract);
    }

    @Override
    @Transactional
    public CustomerPackageContractDto cancelMyContract(Integer contractId, Integer UserId) {
        CustomerPackageContract contract = contractRepository
                .findByContractIdAndUser_UserId(contractId, UserId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy hợp đồng hoặc bạn không có quyền hủy."));

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new RuntimeException("Chỉ có thể hủy các hợp đồng đang ở trạng thái ACTIVE.");
        }

        contract.setStatus(ContractStatus.CANCELLED);

        CustomerPackageContract cancelledContract = contractRepository.save(contract);
        return toDTO(cancelledContract);
    }

    // --- HÀM HELPER CHUYỂN ĐỔI SANG DTO ---
    private CustomerPackageContractDto toDTO(CustomerPackageContract contract) {
        // Map dữ liệu từ Entity sang DTO
        return CustomerPackageContractDto.builder()
                .contractId(contract.getContractId())
                .customerId(contract.getUser().getUserId())
                .customerName(contract.getUser().getFullName())
                .packageId(contract.getServicePackage().getPackageId())
                .packageName(contract.getServicePackage().getPackageName())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .status(contract.getStatus().name()) // Chuyển Enum sang String
                .build();
    }


    // --- JOB 1: TỰ ĐỘNG CHUYỂN TRẠNG THÁI HẾT HẠN (Chạy 0h đêm) ---
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void scanAndExpireContracts() {
        LocalDate today = LocalDate.now();
        // Tìm các gói đang ACTIVE mà ngày kết thúc < hôm nay
        List<CustomerPackageContract> expiredContracts = contractRepository
                .findByStatusAndEndDateBefore(ContractStatus.ACTIVE, today);

        for (CustomerPackageContract contract : expiredContracts) {
            contract.setStatus(ContractStatus.EXPIRED);
        }
        contractRepository.saveAll(expiredContracts);
        System.out.println("Đã cập nhật trạng thái EXPIRED cho {} hợp đồng.");
    }

    // --- JOB 2: NHẮC NHỞ BẢO DƯỠNG (Chạy 9h sáng) ---
    @Scheduled(cron = "0 0 0 * * ?")
    //@Scheduled(fixedRate = 60000) //Nếu muốn test ngay
    @Transactional
    public void scanAndNotifyMaintenance() {
        List<CustomerPackageContract> activeContracts = contractRepository.findAllByStatus(ContractStatus.ACTIVE);
        LocalDate today = LocalDate.now();

        for (CustomerPackageContract contract : activeContracts) {
            LocalDate startDate = contract.getStartDate();
            long monthsBetween = ChronoUnit.MONTHS.between(startDate, today);

            // Logic: Tròn chu kỳ 3 tháng (3, 6, 9...) VÀ đúng ngày
            if (monthsBetween > 0 && monthsBetween % 3 == 0) {
                LocalDate expectedDate = startDate.plusMonths(monthsBetween);

                if (today.equals(expectedDate)) {
                    // Kiểm tra chặn trùng lặp: Nếu hôm nay đã gửi rồi thì bỏ qua
                    if (today.equals(contract.getLastMaintenanceNotificationDate())) {
                        continue;
                    }

                    // Gửi thông báo
                    sendMaintenanceNotification(contract, monthsBetween);

                    // Lưu lại trạng thái đã gửi
                    contract.setLastMaintenanceNotificationDate(today);
                    contractRepository.save(contract);
                }
            }
        }
    }

    // Hàm helper để gửi thông báo cho gọn code
    private void sendMaintenanceNotification(CustomerPackageContract contract, long monthCount) {
        User customer = contract.getUser();

        NotificationRequest notiRequest = new NotificationRequest();
        notiRequest.setUserId(customer.getUserId());
        notiRequest.setTitle("Nhắc nhở Bảo dưỡng Định kỳ");

        // Nội dung: "Gói dịch vụ [Tên gói] của bạn đã sử dụng được [3] tháng. Vui lòng mang xe đến bảo dưỡng."
        String message = String.format(
                "Gói dịch vụ '%s' của bạn đã hoạt động được %d tháng. " +
                        "Đã đến lúc bảo dưỡng định kỳ (Chu kỳ 3 tháng/lần). " +
                        "Vui lòng đặt lịch hẹn sớm nhất.",
                contract.getServicePackage().getPackageName(),
                monthCount
        );

        notiRequest.setMessage(message);

        // Gọi service thông báo
        try {
            notificationService.createNotification(notiRequest);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }
}