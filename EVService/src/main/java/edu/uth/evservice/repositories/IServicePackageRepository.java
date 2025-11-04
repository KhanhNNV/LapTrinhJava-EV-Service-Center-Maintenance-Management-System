package edu.uth.evservice.repositories;

import edu.uth.evservice.models.ServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IServicePackageRepository extends JpaRepository<ServicePackage, Integer> {
    // Đảm bảo tên mỗi gói dịch vụ là duy nhất, dựa trên trường 'packageName'
    boolean existsByPackageName(String packageName);
}
