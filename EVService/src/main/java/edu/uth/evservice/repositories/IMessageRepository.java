package edu.uth.evservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.models.Message;

@Repository
public interface IMessageRepository extends JpaRepository<Message, Integer> {
    List<Message>  findByConversation_ConversationId(Integer conversationId);
}
