package edu.uth.evservice.EVService.model;

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
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer itemId;

    @Nationalized
    @Column(nullable = false, length = 30)
    String itemName;

    @Nationalized
    @Column(nullable=false,length=1000)
    String description;

    @Column(nullable=false)
    Double price;

    // Quan hệ 1-n với TicketServiceItem
    @OneToMany(mappedBy = "serviceItem", cascade = CascadeType.ALL)
    List<TicketServiceItem> ticketServiceItems;




}
