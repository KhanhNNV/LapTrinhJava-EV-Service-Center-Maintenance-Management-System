package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.CustomerNotiDTO;
import edu.uth.evservice.EVService.model.Notification;
import edu.uth.evservice.EVService.repositories.INotificationRepository;
import edu.uth.evservice.EVService.requests.CustomerNotiRequest;
import edu.uth.evservice.EVService.services.ICustomerNotiService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerNotiServiceImpl implements ICustomerNotiService {


    private final INotificationRepository customerNotiRepository;

    @Override
    public List<CustomerNotiDTO> getAllNotifications() {
        return customerNotiRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CustomerNotiDTO> getNotificationsByCustomer(int customerId) {
        return customerNotiRepository.findByCustomerId(customerId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerNotiDTO getNotificationById(int id) {
        return customerNotiRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    @Override
    public CustomerNotiDTO createNotification(CustomerNotiRequest request) {
        Notification noti = Notification.builder()
                .customerId(request.getCustomerId())
                .title(request.getTitle())
                .message(request.getMessage())
                .readStatus(false)
                .build();

        return toDTO(customerNotiRepository.save(noti));
    }

    @Override
    public CustomerNotiDTO markAsRead(int id) {
        Notification noti = customerNotiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        noti.setReadStatus(true);
        return toDTO(customerNotiRepository.save(noti));
    }

    @Override
    public void deleteNotification(int id) {
        customerNotiRepository.deleteById(id);
    }

    private CustomerNotiDTO toDTO(Notification noti) {
        return CustomerNotiDTO.builder()
                .notiId(noti.getNotiId())
                .customerId(noti.getCustomerId())
                .title(noti.getTitle())
                .message(noti.getMessage())
                .readStatus(noti.isReadStatus())
                .createdAt(noti.getCreatedAt())
                .build();
    }
}
