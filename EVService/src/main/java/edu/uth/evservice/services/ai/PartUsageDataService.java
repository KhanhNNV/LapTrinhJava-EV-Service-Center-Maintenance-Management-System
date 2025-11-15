package edu.uth.evservice.services.ai;

import edu.uth.evservice.models.Part;
import edu.uth.evservice.models.ServiceTicket;
import edu.uth.evservice.models.TicketPart;
import edu.uth.evservice.models.ai.PartUsageData;
import edu.uth.evservice.models.ai.PartUsageStats;
import edu.uth.evservice.models.ai.SeasonalTrend;
import edu.uth.evservice.models.enums.ServiceTicketStatus;
import edu.uth.evservice.repositories.IServiceTicketRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.models.enums.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PartUsageDataService {

    private final IServiceTicketRepository ticketRepository;
    private final IUserRepository userRepository;

    public PartUsageData getPartUsageData(Integer centerId, LocalDate startDate, LocalDate endDate) {
        log.info("Collecting part usage data for center {} from {} to {}", centerId, startDate, endDate);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        // Sử dụng method repository đã sửa
        List<ServiceTicket> completedTickets = ticketRepository
                .findByStatusAndAppointment_Center_CenterIdAndEndTimeBetween(
                        ServiceTicketStatus.COMPLETED, centerId, start, end);

        log.info("Found {} completed tickets for center {}", completedTickets.size(), centerId);

        List<PartUsageStats> usageStats = calculatePartUsageStats(completedTickets);
        List<SeasonalTrend> seasonalTrends = analyzeSeasonalTrends(centerId, startDate, endDate);

        return PartUsageData.builder()
                .centerId(centerId)
                .periodStart(startDate)
                .periodEnd(endDate)
                .partUsageStats(usageStats)
                .seasonalTrends(seasonalTrends)
                .technicianCount(countTechnicians(centerId))
                .expectedVehicles(forecastVehicleArrivals(centerId, startDate, endDate))
                .avgDeliveryDays(calculateAvgDeliveryDays())
                .build();
    }

    private List<PartUsageStats> calculatePartUsageStats(List<ServiceTicket> tickets) {
        Map<Part, List<Integer>> partUsageMap = new HashMap<>();

        for (ServiceTicket ticket : tickets) {
            if (ticket.getTicketParts() != null && !ticket.getTicketParts().isEmpty()) {
                for (TicketPart ticketPart : ticket.getTicketParts()) {
                    Part part = ticketPart.getPart();
                    partUsageMap.computeIfAbsent(part, k -> new ArrayList<>())
                            .add(ticketPart.getQuantity());
                }
            }
        }

        log.info("Calculated usage stats for {} parts", partUsageMap.size());

        return partUsageMap.entrySet().stream()
                .map(entry -> {
                    Part part = entry.getKey();
                    List<Integer> usages = entry.getValue();

                    double average = usages.stream().mapToInt(Integer::intValue).average().orElse(0);
                    int max = usages.stream().mapToInt(Integer::intValue).max().orElse(0);
                    int min = usages.stream().mapToInt(Integer::intValue).min().orElse(0);
                    int total = usages.stream().mapToInt(Integer::intValue).sum();

                    return PartUsageStats.builder()
                            .partId(part.getPartId())
                            .partName(part.getPartName())
                            .totalUsage(total)
                            .monthlyAverage(average * 30)
                            .maxUsage(max)
                            .minUsage(min)
                            .usageFrequency(usages.size())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<SeasonalTrend> analyzeSeasonalTrends(Integer centerId, LocalDate start, LocalDate end) {
        // Simplified seasonal analysis
        List<SeasonalTrend> trends = new ArrayList<>();

        // Example trends - bạn có thể thay thế bằng logic phân tích thực tế
        trends.add(SeasonalTrend.builder()
                .partName("Battery Pack")
                .season("SUMMER")
                .increasePercentage(15.0)
                .build());

        trends.add(SeasonalTrend.builder()
                .partName("Brake Pads")
                .season("RAINY")
                .increasePercentage(20.0)
                .build());

        return trends;
    }

    private int countTechnicians(Integer centerId) {
        try {
            return userRepository.findByServiceCenter_CenterIdAndRole(centerId, Role.TECHNICIAN).size();
        } catch (Exception e) {
            log.warn("Error counting technicians for center {}, using fallback: {}", centerId, e.getMessage());
            // Fallback: đếm thủ công
            return (int) userRepository.findAll().stream()
                    .filter(user -> user.getRole() == Role.TECHNICIAN)
                    .filter(user -> user.getServiceCenter() != null &&
                            user.getServiceCenter().getCenterId().equals(centerId))
                    .count();
        }
    }

    private int forecastVehicleArrivals(Integer centerId, LocalDate start, LocalDate end) {
        try {
            // Simple forecasting based on historical data
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(start, end);

            List<ServiceTicket> historicalTickets = ticketRepository
                    .findByAppointment_Center_CenterIdAndEndTimeBetween(centerId, start.atStartOfDay(), end.atTime(23, 59, 59));

            long ticketCount = historicalTickets.size();
            double dailyAverage = (double) ticketCount / Math.max(daysBetween, 1);
            return (int) (dailyAverage * 30); // Monthly forecast
        } catch (Exception e) {
            log.warn("Error forecasting vehicle arrivals, using default: {}", e.getMessage());
            return 50; // Default forecast
        }
    }

    private int calculateAvgDeliveryDays() {
        // Placeholder - in production, calculate from actual delivery data
        return 7;
    }

    public void recordTicketCompletion(ServiceTicket ticket) {
        log.info("Recording ticket completion for AI learning: Ticket {}", ticket.getTicketId());
        // In production, you might store this in a dedicated AI training table
    }
}