package edu.uth.evservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.models.Part;

@Repository
public interface IPartRepository extends JpaRepository<Part, Integer> {
}
