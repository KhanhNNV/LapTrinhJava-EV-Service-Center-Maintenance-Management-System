# EV Service Center Maintenance Management System

## Cấu trúc dự án

```plaintext
📁 LapTrinhJava-EV-Service-Center-Maintenance-Management-System/
├── 📁 EVService/
│   ├── 📁 .mvn/
│   │   └── 📁 wrapper/
│   │       └── 📄 maven-wrapper.properties
│   ├── 📁 src/
│   │   ├── 📁 main/
│   │   │   ├── 📁 java/
│   │   │   │   └── 📁 edu/
│   │   │   │       └── 📁 uth/
│   │   │   │           └── 📁 evservice/
│   │   │   │               └── 📁 EVService/
│   │   │   │                   ├── 📁 config/
│   │   │   │                   │   └── ☕ SecurityConfig.java
│   │   │   │                   ├── 📁 controller/
│   │   │   │                   │   ├── ☕ AppointmentController.java
│   │   │   │                   │   ├── ☕ ConversationController.java
│   │   │   │                   │   ├── ☕ CustomerPackageContractController.java
│   │   │   │                   │   ├── ☕ InventoryController.java
│   │   │   │                   │   ├── ☕ InvoiceController.java
│   │   │   │                   │   ├── ☕ MessageController.java
│   │   │   │                   │   ├── ☕ NotificationController.java
│   │   │   │                   │   ├── ☕ PartController.java
│   │   │   │                   │   ├── ☕ ServiceCenterController.java
│   │   │   │                   │   ├── ☕ ServiceItemController.java
│   │   │   │                   │   ├── ☕ ServiceItemPartController.java
│   │   │   │                   │   ├── ☕ ServicePackageController.java
│   │   │   │                   │   ├── ☕ ServiceTicketController.java
│   │   │   │                   │   ├── ☕ TicketPartController.java
│   │   │   │                   │   └── ☕ TicketServiceItemController.java
│   │   │   │                   ├── 📁 dto/
│   │   │   │                   │   ├── ☕ AppointmentDto.java
│   │   │   │                   │   ├── ☕ CertificateDto.java
│   │   │   │                   │   ├── ☕ ConversationDto.java
│   │   │   │                   │   ├── ☕ CustomerPackageContractDto.java
│   │   │   │                   │   ├── ☕ InventoryDto.java
│   │   │   │                   │   ├── ☕ InvoiceDto.java
│   │   │   │                   │   ├── ☕ MessageDto.java
│   │   │   │                   │   ├── ☕ NotificationDto.java
│   │   │   │                   │   ├── ☕ PartDto.java
│   │   │   │                   │   ├── ☕ ServiceCenterDto.java
│   │   │   │                   │   ├── ☕ ServiceItemDto.java
│   │   │   │                   │   ├── ☕ ServiceItemPartDto.java
│   │   │   │                   │   ├── ☕ ServicePackageDto.java
│   │   │   │                   │   ├── ☕ ServiceTicketDto.java
│   │   │   │                   │   ├── ☕ TicketPartDto.java
│   │   │   │                   │   ├── ☕ TicketServiceItemDto.java
│   │   │   │                   │   ├── ☕ UserDto.java
│   │   │   │                   │   └── ☕ VehicleDto.java
│   │   │   │                   ├── 📁 model/
│   │   │   │                   │   ├── 📁 enums/
│   │   │   │                   │   │   ├── ☕ AppointmentStatus.java
│   │   │   │                   │   │   ├── ☕ ContractStatus.java
│   │   │   │                   │   │   ├── ☕ ConversationStatus.java
│   │   │   │                   │   │   ├── ☕ PaymentMethod.java
│   │   │   │                   │   │   ├── ☕ PaymentStatus.java
│   │   │   │                   │   │   └── ☕ Role.java
│   │   │   │                   │   ├── ☕ Appointment.java
│   │   │   │                   │   ├── ☕ Certificate.java
│   │   │   │                   │   ├── ☕ Conversation.java
│   │   │   │                   │   ├── ☕ CustomerPackageContract.java
│   │   │   │                   │   ├── ☕ Inventory.java
│   │   │   │                   │   ├── ☕ Invoice.java
│   │   │   │                   │   ├── ☕ Message.java
│   │   │   │                   │   ├── ☕ Notification.java
│   │   │   │                   │   ├── ☕ Part.java
│   │   │   │                   │   ├── ☕ ServiceCenter.java
│   │   │   │                   │   ├── ☕ ServiceItem.java
│   │   │   │                   │   ├── ☕ ServiceItemPart.java
│   │   │   │                   │   ├── ☕ ServiceItemPartId.java
│   │   │   │                   │   ├── ☕ ServicePackage.java
│   │   │   │                   │   ├── ☕ ServiceTicket.java
│   │   │   │                   │   ├── ☕ TechnicianCertificate.java
│   │   │   │                   │   ├── ☕ TechnicianCertificateId.java
│   │   │   │                   │   ├── ☕ TicketPart.java
│   │   │   │                   │   ├── ☕ TicketPartId.java
│   │   │   │                   │   ├── ☕ TicketServiceItem.java
│   │   │   │                   │   ├── ☕ TicketServiceItemId.java
│   │   │   │                   │   ├── ☕ User.java
│   │   │   │                   │   └── ☕ Vehicle.java
│   │   │   │                   ├── 📁 repositories/
│   │   │   │                   │   ├── ☕ IAppointmentRepository.java
│   │   │   │                   │   ├── ☕ ICertificateRepository.java
│   │   │   │                   │   ├── ☕ IConversationRepository.java
│   │   │   │                   │   ├── ☕ ICustomerPackageContractRepository.java
│   │   │   │                   │   ├── ☕ IInventoryRepository.java
│   │   │   │                   │   ├── ☕ IInvoiceRepository.java
│   │   │   │                   │   ├── ☕ IMessageRepository.java
│   │   │   │                   │   ├── ☕ INotificationRepository.java
│   │   │   │                   │   ├── ☕ IPartRepository.java
│   │   │   │                   │   ├── ☕ IServiceCenterRepository.java
│   │   │   │                   │   ├── ☕ IServiceItemPartRepository.java
│   │   │   │                   │   ├── ☕ IServiceItemRepository.java
│   │   │   │                   │   ├── ☕ IServicePackageRepository.java
│   │   │   │                   │   ├── ☕ IServiceTicketRepository.java
│   │   │   │                   │   ├── ☕ ITicketPartRepository.java
│   │   │   │                   │   ├── ☕ ITicketServiceItemRepository.java
│   │   │   │                   │   ├── ☕ IUserRepository.java
│   │   │   │                   │   └── ☕ IVehicleRepository.java
│   │   │   │                   ├── 📁 requests/
│   │   │   │                   │   ├── ☕ AppointmentRequest.java
│   │   │   │                   │   ├── ☕ CertificateRequest.java
│   │   │   │                   │   ├── ☕ CreateConversationRequest.java
│   │   │   │                   │   ├── ☕ CreateInvoiceRequest.java
│   │   │   │                   │   ├── ☕ CreateMessageRequest.java
│   │   │   │                   │   ├── ☕ CreateServiceItemRequest.java
│   │   │   │                   │   ├── ☕ CreateTicketServiceItemRequest.java
│   │   │   │                   │   ├── ☕ CreateUserRequest.java
│   │   │   │                   │   ├── ☕ CustomerPackageContractRequest.java
│   │   │   │                   │   ├── ☕ InventoryRequest.java
│   │   │   │                   │   ├── ☕ NotificationRequest.java
│   │   │   │                   │   ├── ☕ PartRequest.java
│   │   │   │                   │   ├── ☕ ServiceCenterRequest.java
│   │   │   │                   │   ├── ☕ ServiceItemPartRequest.java
│   │   │   │                   │   ├── ☕ ServicePackageRequest.java
│   │   │   │                   │   ├── ☕ ServiceTicketRequest.java
│   │   │   │                   │   ├── ☕ TicketPartRequest.java
│   │   │   │                   │   └── ☕ VehicleRequest.java
│   │   │   │                   ├── 📁 services/
│   │   │   │                   │   ├── 📁 impl/
│   │   │   │                   │   │   ├── ☕ AppointmentServiceImpl.java
│   │   │   │                   │   │   ├── ☕ CertificateServiceImpl.java
│   │   │   │                   │   │   ├── ☕ ConversationServiceImp.java
│   │   │   │                   │   │   ├── ☕ CustomerPackageContractServiceImpl.java
│   │   │   │                   │   │   ├── ☕ InventoryServiceImpl.java
│   │   │   │                   │   │   ├── ☕ InvoiceServiceImpl.java
│   │   │   │                   │   │   ├── ☕ MessageServiceImpl.java
│   │   │   │                   │   │   ├── ☕ NotificationServiceImpl.java
│   │   │   │                   │   │   ├── ☕ PartServiceImpl.java
│   │   │   │                   │   │   ├── ☕ ServiceCenterServiceImpl.java
│   │   │   │                   │   │   ├── ☕ ServiceItemPartServiceImpl.java
│   │   │   │                   │   │   ├── ☕ ServiceItemService.java
│   │   │   │                   │   │   ├── ☕ ServicePackageServiceImpl.java
│   │   │   │                   │   │   ├── ☕ ServiceTicketServiceImpl.java
│   │   │   │                   │   │   ├── ☕ TicketPartServiceImpl.java
│   │   │   │                   │   │   ├── ☕ TicketServiceItemService.java
│   │   │   │                   │   │   ├── ☕ UserServiceImpl.java
│   │   │   │                   │   │   └── ☕ VehicleServiceImpl.java
│   │   │   │                   │   ├── ☕ IAppointmentService.java
│   │   │   │                   │   ├── ☕ ICertificateService.java
│   │   │   │                   │   ├── ☕ IConversationService.java
│   │   │   │                   │   ├── ☕ ICustomerPackageContractService.java
│   │   │   │                   │   ├── ☕ IInventoryService.java
│   │   │   │                   │   ├── ☕ IInvoiceService.java
│   │   │   │                   │   ├── ☕ IMessageService.java
│   │   │   │                   │   ├── ☕ INotificationService.java
│   │   │   │                   │   ├── ☕ IPartService.java
│   │   │   │                   │   ├── ☕ IServiceCenterService.java
│   │   │   │                   │   ├── ☕ IServiceItemPartService.java
│   │   │   │                   │   ├── ☕ IServiceItemService.java
│   │   │   │                   │   ├── ☕ IServicePackageService.java
│   │   │   │                   │   ├── ☕ IServiceTicketService.java
│   │   │   │                   │   ├── ☕ ITicketPartService.java
│   │   │   │                   │   ├── ☕ ITicketServiceItemService.java
│   │   │   │                   │   ├── ☕ IUserService.java
│   │   │   │                   │   └── ☕ IVehicleService.java
│   │   │   │                   └── ☕ EvServiceApplication.java
│   │   │   └── 📁 resources/
│   │   │       ├── 📁 static/
│   │   │       ├── 📁 templates/
│   │   │       └── 📄 application.properties
│   │   └── 📁 test/
│   │       └── 📁 java/
│   │           └── 📁 edu/
│   │               └── 📁 uth/
│   │                   └── 📁 evservice/
│   │                       └── 📁 EVService/
│   │                           └── ☕ EvServiceApplicationTests.java
│   ├── ⚙️ .gitattributes
│   ├── ⚙️ .gitignore
│   ├── 📝 HELP.md
│   ├── 📄 mvnw
│   ├── 📄 mvnw.cmd
│   └── ⚙️ pom.xml
├── ⚙️ .gitignore
└── 📝 README.md
```
