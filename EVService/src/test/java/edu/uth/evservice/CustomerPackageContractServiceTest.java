package edu.uth.evservice;

import edu.uth.evservice.models.CustomerPackageContract;
import edu.uth.evservice.models.ServicePackage;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.enums.ContractStatus;
import edu.uth.evservice.repositories.ICustomerPackageContractRepository;
import edu.uth.evservice.requests.NotificationRequest;
import edu.uth.evservice.services.INotificationService;
import edu.uth.evservice.services.impl.CustomerPackageContractServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerPackageContractServiceTest {

    @Mock
    private ICustomerPackageContractRepository contractRepository;

    @Mock
    private INotificationService notificationService;

    // Các mock khác nếu cần (userRepo, packageRepo) dù test case này chưa dùng tới

    @InjectMocks
    private CustomerPackageContractServiceImpl contractService;

    @Test
    void testScanAndNotifyMaintenance_ShouldSendNotification_WhenExactly3Months() {
        // 1. GIẢ LẬP DỮ LIỆU (DATA SEEDING)
        // Giả sử hôm nay chạy test, thì hợp đồng phải bắt đầu từ 3 tháng trước
        LocalDate today = LocalDate.now();
        LocalDate threeMonthsAgo = today.minusMonths(3);

        User mockUser = new User();
        mockUser.setUserId(1);
        mockUser.setUsername("testUser");

        ServicePackage mockPackage = new ServicePackage();
        mockPackage.setPackageName("Gói Vip");

        CustomerPackageContract contract = CustomerPackageContract.builder()
                .contractId(100)
                .user(mockUser)
                .servicePackage(mockPackage)
                .startDate(threeMonthsAgo) // Quan trọng: Set ngày bắt đầu là 3 tháng trước
                .status(ContractStatus.ACTIVE)
                .build();

        // Khi repo gọi tìm active contract, trả về list chứa hợp đồng trên
        when(contractRepository.findAllByStatus(ContractStatus.ACTIVE))
                .thenReturn(List.of(contract));

        // 2. GỌI HÀM TEST (Hành động)
        contractService.scanAndNotifyMaintenance();

        // 3. KHẲNG ĐỊNH (Verify)
        // Kiểm tra xem hàm createNotification có được gọi đúng 1 lần không?
        verify(notificationService, times(1)).createNotification(any(NotificationRequest.class));
    }

    @Test
    void testScanAndNotifyMaintenance_ShouldNOTSend_WhenNotDueDate() {
        // Giả lập hợp đồng mới mua 1 tháng trước -> Chưa đến hạn
        LocalDate oneMonthAgo = LocalDate.now().minusMonths(1);

        CustomerPackageContract contract = CustomerPackageContract.builder()
                .startDate(oneMonthAgo)
                .status(ContractStatus.ACTIVE)
                .build();

        when(contractRepository.findAllByStatus(ContractStatus.ACTIVE))
                .thenReturn(List.of(contract));

        contractService.scanAndNotifyMaintenance();

        // Verify là KHÔNG được gọi lần nào
        verify(notificationService, never()).createNotification(any());
    }
}
