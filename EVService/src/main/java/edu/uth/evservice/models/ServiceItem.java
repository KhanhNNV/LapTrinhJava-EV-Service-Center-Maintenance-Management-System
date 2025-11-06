package edu.uth.evservice.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Nationalized;
import java.util.List;

@Entity
@Table(name = "serviceItems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    Integer itemId;

    @Nationalized
    @Column(name = "item_name", nullable = false, length = 30)
    String itemName;

    @Nationalized
    @Column(name = "description", nullable = false, length = 1000)
    String description;

    @Column(name = "price", nullable = false)
    Double price;

    @OneToMany(mappedBy = "serviceItem", cascade = CascadeType.ALL, orphanRemoval = true)
    List<TicketServiceItem> ticketServiceItems;
}
