package edu.uth.evservice.repositories;

import edu.uth.evservice.models.Notification;
import edu.uth.evservice.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface INotificationRepository extends JpaRepository<Notification, Integer> {
    //Lấy danh sách thông báo theo người nhận
    List<Notification> findByUser(User user);
}
