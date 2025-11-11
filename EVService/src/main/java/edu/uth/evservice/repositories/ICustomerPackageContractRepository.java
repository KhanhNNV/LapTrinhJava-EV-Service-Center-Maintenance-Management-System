package edu.uth.evservice.repositories;

import edu.uth.evservice.models.CustomerPackageContract;
import edu.uth.evservice.models.enums.ContractStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ICustomerPackageContractRepository extends JpaRepository<CustomerPackageContract, Integer> {
    List<CustomerPackageContract> findByUser_UserId(Integer userId);
    // Lý do: Lấy tất cả hợp đồng của một người dùng cụ thể.
    // Dùng 'user.username' vì trường trong Entity là 'User user'
    List<CustomerPackageContract> findByUser_Username(String username);

    // Lý do: Tìm một hợp đồng cụ thể VÀ xác minh nó thuộc về đúng người dùng.
    Optional<CustomerPackageContract> findByContractIdAndUser_Username(Integer contractId, String username);
    
    // Lý do: Kiểm tra xem khách hàng đã mua gói này và nó còn đang 'ACTIVE' không.
    boolean existsByUser_UsernameAndServicePackage_PackageIdAndStatus(
        String username, Integer packageId, ContractStatus status
    );
}