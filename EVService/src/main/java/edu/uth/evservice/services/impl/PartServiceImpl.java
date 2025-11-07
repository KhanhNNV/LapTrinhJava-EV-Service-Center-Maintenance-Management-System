package edu.uth.evservice.services.impl;

import edu.uth.evservice.dtos.PartDto;
import edu.uth.evservice.exception.ResourceNotFoundException;
import edu.uth.evservice.models.Inventory;
import edu.uth.evservice.models.Part;
import edu.uth.evservice.models.ServiceCenter;
import edu.uth.evservice.repositories.IInventoryRepository;
import edu.uth.evservice.repositories.IPartRepository;
import edu.uth.evservice.repositories.IServiceCenterRepository;
import edu.uth.evservice.repositories.ITicketPartRepository;
import edu.uth.evservice.requests.AddStockRequest;
import edu.uth.evservice.requests.PartRequest;
import edu.uth.evservice.services.IPartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartServiceImpl implements IPartService {

    private final IPartRepository partRepo;
    private final IInventoryRepository inventoryRepo;
    private final ITicketPartRepository ticketPartRepo;
    private final IServiceCenterRepository centerRepo;

    @Override
    @Transactional // Đảm bảo cả hai hành động cùng thành công
    public PartDto createPart(PartRequest request) {
        // 1. Tạo đối tượng Part
        Part part = Part.builder()
                .partName(request.getPartName())
                .unitPrice(request.getUnitPrice())
                .costPrice(request.getCostPrice())
                .build();
        Part savedPart = partRepo.save(part);

        // 3. Trả về DTO
        return toDto(savedPart);
    }

    @Override
    @Transactional(readOnly = true) // Chỉ đọc
    public List<PartDto> getAllParts() {
        return partRepo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PartDto getPartById(Integer partId) {
        Part part = partRepo.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng có Id: " + partId));

        return toDto(part);
    }

    @Override
    @Transactional
    public PartDto updatePart(Integer partId, PartRequest request) {
        Part part = partRepo.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng có Id: " + partId));

        part.setPartName(request.getPartName());
        part.setUnitPrice(request.getUnitPrice());
        part.setCostPrice(request.getCostPrice());
        Part savedPart = partRepo.save(part);

        return toDto(savedPart);
    }

    @Override
    @Transactional
    public void deletePart(Integer partId) {
        // Kiểm tra xem phụ tùng đã từng được dùng trong ticket nào chưa
        boolean inUse = ticketPartRepo.existsByPart_PartId(partId);
        if (inUse) {
            throw new IllegalStateException("Không thể xóa phụ tùng: Phụ tùng này được tham chiếu bởi phiếu dịch vụ khác.");
        }


        Part part = partRepo.findById(partId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng với Id: " + partId));

        // 1. Xóa Inventory trước
        List<Inventory> inventories = inventoryRepo.findAllByPart_PartId(partId);
        inventoryRepo.deleteAll(inventories);

        // 2. Xóa Part
        partRepo.delete(part);
    }

    private PartDto toDto(Part part) {
        return PartDto.builder()
                .partId(part.getPartId())
                .partName(part.getPartName())
                .unitPrice(part.getUnitPrice())
                .build();
    }
}
