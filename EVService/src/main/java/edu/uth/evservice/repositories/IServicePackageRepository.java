package edu.uth.evservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.models.ServicePackage;

@Repository
public interface IServicePackageRepository extends JpaRepository<ServicePackage, Integer> {
    // Đảm bảo tên mỗi gói dịch vụ là duy nhất, dựa trên trường 'packageName'
    boolean existsByPackageName(String packageName);

    // === ĐÚNG – Spring Data hiểu và áp dụng @EntityGraph ===
    @EntityGraph(attributePaths = "serviceItems")
    List<ServicePackage> findAll();

    @EntityGraph(attributePaths = "serviceItems")
    Optional<ServicePackage> findByPackageId(Integer packageId);

    // Nếu anh thích tên dài hơn cho rõ nghĩa thì dùng @Query (vẫn áp dụng
    // EntityGraph)
    // @EntityGraph(attributePaths = "serviceItems")
    // Optional<ServicePackage> findByPackageIdWithServiceItemId(Integer id);
}
