package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.Notification;
import edu.uth.evservice.EVService.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface INotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByReceiver(User receiver);
}
