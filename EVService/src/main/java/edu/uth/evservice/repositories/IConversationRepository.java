package edu.uth.evservice.repositories;

import edu.uth.evservice.models.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IConversationRepository extends JpaRepository<Conversation, Integer> {
}
