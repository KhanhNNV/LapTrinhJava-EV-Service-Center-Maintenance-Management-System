package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Nationalized;

import java.util.List;

@Entity
@Table(name = "service_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer itemId;

    @Nationalized
    String itemName;

    @Nationalized
    String description;

    Double price;

    // Quan hệ 1-n với TicketServiceItem
    @OneToMany(mappedBy = "serviceItem", cascade = CascadeType.ALL)
    List<TicketServiceItem> ticketServiceItems;
}
