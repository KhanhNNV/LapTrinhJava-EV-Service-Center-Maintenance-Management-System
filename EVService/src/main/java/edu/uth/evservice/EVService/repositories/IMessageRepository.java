package edu.uth.evservice.EVService.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.EVService.model.Message;

@Repository
public interface IMessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findByConversationId(Integer conversationId);
}
