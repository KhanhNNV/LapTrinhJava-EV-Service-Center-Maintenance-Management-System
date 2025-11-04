package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.ServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IServicePackageRepository extends JpaRepository<ServicePackage, Integer> {
    // Đảm bảo tên mỗi gói dịch vụ là duy nhất, dựa trên trường 'packageName'
    boolean existsByPackageName(String packageName);
}
