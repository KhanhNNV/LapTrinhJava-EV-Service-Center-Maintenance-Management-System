package edu.uth.evservice.services.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.uth.evservice.dtos.CustomerPackageContractDto;
import edu.uth.evservice.models.CustomerPackageContract;
import edu.uth.evservice.models.Invoice;
import edu.uth.evservice.models.ServicePackage;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.enums.ContractStatus;
import edu.uth.evservice.models.enums.PaymentMethod;
import edu.uth.evservice.models.enums.PaymentStatus;
import edu.uth.evservice.repositories.ICustomerPackageContractRepository;
import edu.uth.evservice.repositories.IInvoiceRepository; // MỚI
import edu.uth.evservice.repositories.IServicePackageRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.requests.CustomerPackageContractRequest;
import edu.uth.evservice.requests.NotificationRequest;
import edu.uth.evservice.services.ICustomerPackageContractService;
import edu.uth.evservice.services.INotificationService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerPackageContractServiceImpl implements ICustomerPackageContractService {

    private final ICustomerPackageContractRepository contractRepository;
    private final IUserRepository userRepository;
    private final IServicePackageRepository packageRepository;
    private final IInvoiceRepository invoiceRepository; // 1. Inject Repository Hóa đơn
    private final INotificationService notificationService;

    @Override
    @Transactional
    public CustomerPackageContractDto purchasePackage(CustomerPackageContractRequest request, Integer UserId) {

        // 1. Tìm khách hàng
        User customer = userRepository.findByUserId(UserId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng."));

        // 2. Tìm gói dịch vụ
        ServicePackage servicePackage = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gói dịch vụ với ID: " + request.getPackageId()));

        // 3. Kiểm tra logic: Đã mua và còn hạn (ACTIVE hoặc PENDING_PAYMENT)
        boolean alreadyActive = contractRepository.existsByUser_UserIdAndServicePackage_PackageIdAndStatus(
                UserId,
                request.getPackageId(),
                ContractStatus.ACTIVE);

        // Nên chặn cả nếu đang chờ thanh toán để tránh spam
        boolean pending = contractRepository.existsByUser_UserIdAndServicePackage_PackageIdAndStatus(
                UserId,
                request.getPackageId(),
                ContractStatus.PENDING);

        if (alreadyActive) {
            throw new RuntimeException("Bạn đã mua gói dịch vụ này và nó vẫn còn đang hoạt động.");
        }
        if (pending) {
            throw new RuntimeException("Bạn đã đăng ký gói này và đang chờ thanh toán. Vui lòng kiểm tra mục Hóa đơn.");
        }

        // 4. Tính toán ngày
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusMonths(servicePackage.getDuration());

        // 5. Tạo hợp đồng mới
        CustomerPackageContract newContract = CustomerPackageContract.builder()
                .user(customer)
                .servicePackage(servicePackage)
                .contractId(null)
                .contractName(servicePackage.getPackageName())
                .startDate(startDate)
                .endDate(endDate)
                .status(ContractStatus.PENDING) // 2. Đổi trạng thái thành Chờ thanh toán
                .build();

        CustomerPackageContract savedContract = contractRepository.save(newContract);

        // 6. TỰ ĐỘNG TẠO HÓA ĐƠN (LOGIC MỚI)
        Invoice invoice = Invoice.builder()
                .invoiceDate(LocalDateTime.now())
                .totalAmount(servicePackage.getPrice().doubleValue()) // Chuyển BigDecimal sang Double nếu cần
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(PaymentMethod.UNSPECIFIED)
                .user(customer)
                // Quan trọng: Gắn hóa đơn với hợp đồng vừa tạo
                // Lưu ý: Bạn cần đảm bảo Entity Invoice đã có field 'contract' hoặc 'serviceTicket' cho phép null
                .serviceTicket(null) // Hóa đơn này không thuộc về Ticket sửa chữa
                .contract(savedContract) // Nếu bạn đã thêm cột contract vào Invoice (Recommended)
                .build();

        // Nếu Entity Invoice chưa có quan hệ trực tiếp với Contract, bạn có thể lưu contractId vào note
        // hoặc xử lý tạm thời bằng cách tạo quan hệ 1-1.
        // Giả sử ở đây bạn đã update Invoice Entity có field 'contract' như hướng dẫn trước:
        // invoice.setContract(savedContract);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // 7. Trả về DTO kèm InvoiceId
        CustomerPackageContractDto dto = toDTO(savedContract);
        dto.setInvoiceId(savedInvoice.getInvoiceId()); // Cần thêm field này vào CustomerPackageContractDto

        return dto;
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng hoặc bạn không có quyền xem."));
        return toDTO(contract);
    }

    @Override
    @Transactional
    public CustomerPackageContractDto cancelMyContract(Integer contractId, Integer UserId) {
        CustomerPackageContract contract = contractRepository
                .findByContractIdAndUser_UserId(contractId, UserId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng hoặc bạn không có quyền hủy."));

        if (contract.getStatus() != ContractStatus.ACTIVE && contract.getStatus() != ContractStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy các hợp đồng đang ACTIVE hoặc PENDING.");
        }

        contract.setStatus(ContractStatus.CANCELLED);
        CustomerPackageContract cancelledContract = contractRepository.save(contract);
        return toDTO(cancelledContract);
    }

    // --- HÀM HELPER CHUYỂN ĐỔI SANG DTO ---
    private CustomerPackageContractDto toDTO(CustomerPackageContract contract) {
        return CustomerPackageContractDto.builder()
                .contractId(contract.getContractId())
                .customerId(contract.getUser().getUserId())
                .customerName(contract.getUser().getFullName())
                .packageId(contract.getServicePackage().getPackageId())
                .packageName(contract.getServicePackage().getPackageName())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .status(contract.getStatus().name())
                // .invoiceId(...) // Nếu muốn lấy invoiceId ở đây thì phải query ngược lại từ InvoiceRepo
                .build();
    }

    // --- JOB 1: TỰ ĐỘNG CHUYỂN TRẠNG THÁI HẾT HẠN ---
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void scanAndExpireContracts() {
        LocalDate today = LocalDate.now();
        List<CustomerPackageContract> expiredContracts = contractRepository
                .findByStatusAndEndDateBefore(ContractStatus.ACTIVE, today);

        for (CustomerPackageContract contract : expiredContracts) {
            contract.setStatus(ContractStatus.EXPIRED);
        }
        contractRepository.saveAll(expiredContracts);
    }

    // --- JOB 2: NHẮC NHỞ BẢO DƯỠNG ---
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void scanAndNotifyMaintenance() {
        List<CustomerPackageContract> activeContracts = contractRepository.findAllByStatus(ContractStatus.ACTIVE);
        LocalDate today = LocalDate.now();

        for (CustomerPackageContract contract : activeContracts) {
            LocalDate startDate = contract.getStartDate();
            long monthsBetween = ChronoUnit.MONTHS.between(startDate, today);

            if (monthsBetween > 0 && monthsBetween % 3 == 0) {
                LocalDate expectedDate = startDate.plusMonths(monthsBetween);

                if (today.equals(expectedDate)) {
                    if (today.equals(contract.getLastMaintenanceNotificationDate())) {
                        continue;
                    }
                    sendMaintenanceNotification(contract, monthsBetween);
                    contract.setLastMaintenanceNotificationDate(today);
                    contractRepository.save(contract);
                }
            }
        }
    }

    private void sendMaintenanceNotification(CustomerPackageContract contract, long monthCount) {
        User customer = contract.getUser();
        NotificationRequest notiRequest = new NotificationRequest();
        notiRequest.setUserId(customer.getUserId());
        notiRequest.setTitle("Nhắc nhở Bảo dưỡng Định kỳ");
        String message = String.format(
                "Gói dịch vụ '%s' của bạn đã hoạt động được %d tháng. Vui lòng đặt lịch hẹn bảo dưỡng.",
                contract.getServicePackage().getPackageName(),
                monthCount
        );
        notiRequest.setMessage(message);
        try {
            notificationService.createNotification(notiRequest);
        } catch (Exception e) {
            // Log error
        }
    }
}