package edu.uth.evservice.EVService.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.EVService.model.Part;

@Repository
public interface IPartRepository extends JpaRepository<Part, Integer> {
    boolean existsByPartName(String partName);
}
