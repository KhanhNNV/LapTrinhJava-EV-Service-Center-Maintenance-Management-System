package edu.uth.evservice.services.ai;

import edu.uth.evservice.models.Part;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartUsage {
    private Part part;
    private Integer totalQuantityUsed;
    private Integer usageCount;

    public double getAverageQuantity() {
        return usageCount > 0 ? (double) totalQuantityUsed / usageCount : 0;
    }

    public void incrementUsage(int quantity) {
        this.totalQuantityUsed += quantity;
        this.usageCount++;
    }
}