package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IConversationRepository extends JpaRepository<Conversation, Integer> {
}
