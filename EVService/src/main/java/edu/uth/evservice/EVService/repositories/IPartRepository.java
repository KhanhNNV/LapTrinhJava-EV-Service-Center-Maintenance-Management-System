package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IPartRepository extends JpaRepository<Part, Integer> {
    boolean existsByPartName(String partName);
}
