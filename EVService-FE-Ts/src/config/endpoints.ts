export const ENDPOINTS = {
  // ─── AuthController ──────────────────────────────────────────────────────
  auth: {
    login: {
      method: "POST" as const,
      url: "/auth/login",
    },
    register: {
      method: "POST" as const,
      url: "/auth/register",
    },
    refresh: {
      method: "POST" as const,
      url: "/auth/refresh",
    },
    change_password: {
     method: "POST" as const, 
      url: "/auth/change-password",
    },
  },

  // ─── AppointmentController ───────────────────────────────────────────────
  appointments: {
    // GET /api/appointments/status/{status}
    byStatus: (status: string) => ({
      method: "GET" as const,
      url: `/api/appointments/status/${status}`,
    }),

    // GET /api/appointments/technician
    technicianList: {
      method: "GET" as const,
      url: "/api/appointments/technician",
    },

    // GET /api/appointments/{appointmentId}/suggestedTechnicians
    suggestedTechnicians: (appointmentId: number | string) => ({
      method: "GET" as const,
      url: `/api/appointments/${appointmentId}/suggestedTechnicians`,
    }),

    // POST /api/appointments
    create: {
      method: "POST" as const,
      url: "/api/appointments",
    },

    // DELETE /api/appointments/{appointmentId}
    delete: (appointmentId: number | string) => ({
      method: "DELETE" as const,
      url: `/api/appointments/${appointmentId}`,
    }),

    // PUT /api/appointments/{appointmentId}/assignTechnician
    assignTechnician: (appointmentId: number | string) => ({
      method: "PUT" as const,
      url: `/api/appointments/${appointmentId}/assignTechnician`,
    }),

    // PUT /api/appointments/{appointmentId}/check-in
    checkIn: (appointmentId: number | string) => ({
      method: "PUT" as const,
      url: `/api/appointments/${appointmentId}/check-in`,
    }),

    // PUT /api/appointments/{appointmentId}/confirmForCustomer
    confirmForCustomer: (appointmentId: number | string) => ({
      method: "PUT" as const,
      url: `/api/appointments/${appointmentId}/confirmForCustomer`,
    }),
  },

  // ─── CertificateController ───────────────────────────────────────────────
  certificates: {
    list: {
      method: "GET" as const,
      url: "/api/certificates",
    },
    create: {
      method: "POST" as const,
      url: "/api/certificates",
    },
    detail: (id: number | string) => ({
      method: "GET" as const,
      url: `/api/certificates/${id}`,
    }),
    update: (id: number | string) => ({
      method: "PUT" as const,
      url: `/api/certificates/${id}`,
    }),
    delete: (id: number | string) => ({
      method: "DELETE" as const,
      url: `/api/certificates/${id}`,
    }),
  },

  // ─── CustomerPackageContractController ───────────────────────────────────
  contracts: {
    list: {
      method: "GET" as const,
      url: "/api/contracts",
    },
    create: {
      method: "POST" as const,
      url: "/api/contracts",
    },
    detail: (id: number | string) => ({
      method: "GET" as const,
      url: `/api/contracts/${id}`,
    }),
    cancel: (id: number | string) => ({
      method: "PUT" as const,
      url: `/api/contracts/${id}/cancel`,
    }),
  },

  // ─── ConversationController ──────────────────────────────────────────────
  conversations: {
    list: {
      method: "GET" as const,
      url: "/api/conversations",
    },
    create: {
      method: "POST" as const,
      url: "/api/conversations",
    },
    detail: (id: number | string) => ({
      method: "GET" as const,
      url: `/api/conversations/${id}`,
    }),
    delete: (id: number | string) => ({
      method: "DELETE" as const,
      url: `/api/conversations/${id}`,
    }),
    claim: (id: number | string) => ({
      method: "PUT" as const,
      url: `/api/conversations/${id}/claim`,
    }),
    close: (id: number | string) => ({
      method: "PUT" as const,
      url: `/api/conversations/${id}/close`,
    }),
  },

  // ─── InventoryController ─────────────────────────────────────────────────
  inventory: {
    addStock: {
      method: "POST" as const,
      url: "/api/inventories/add-stock",
    },
  },

  // ─── InvoiceController ───────────────────────────────────────────────────
  invoices: {
    createForTicket: (ticketId: number | string) => ({
      method: "POST" as const,
      url: `/api/invoices/${ticketId}`,
    }),
    getByTicket: (ticketId: number | string) => ({
      method: "GET" as const,
      url: `/api/invoices/${ticketId}`,
    }),
    updateStatus: (invoiceId: number | string) => ({
      method: "PUT" as const,
      url: `/api/invoices/${invoiceId}/status`,
    }),
  },

  // ─── MessageController ───────────────────────────────────────────────────
  messages: {
    list: {
      method: "GET" as const,
      url: "/api/messages",
    },
    listByConversation: (conversationId: number | string) => ({
      method: "GET" as const,
      url: `/api/messages/conversation/${conversationId}`,
    }),
    detail: (id: number | string) => ({
      method: "GET" as const,
      url: `/api/messages/${id}`,
    }),
    create: {
      method: "POST" as const,
      url: "/api/messages",
    },
    update: (id: number | string) => ({
      method: "PUT" as const,
      url: `/api/messages/${id}`,
    }),
    delete: (id: number | string) => ({
      method: "DELETE" as const,
      url: `/api/messages/${id}`,
    }),
  },

  // ─── MyCertificatesController ────────────────────────────────────────────
  myCertificates: {
    create: {
      method: "POST" as const,
      url: "/api/my-certificates",
    },
    list: {
      method: "GET" as const,
      url: "/api/my-certificates",
    },
    delete: (certificateId: number | string) => ({
      method: "DELETE" as const,
      url: `/api/my-certificates/${certificateId}`,
    }),
  },

  // ─── PartController ──────────────────────────────────────────────────────
  parts: {
    create: {
      method: "POST" as const,
      url: "/api/parts",
    },
    list: {
      method: "GET" as const,
      url: "/api/parts",
    },
    detail: (partId: number | string) => ({
      method: "GET" as const,
      url: `/api/parts/${partId}`,
    }),
    update: (partId: number | string) => ({
      method: "PUT" as const,
      url: `/api/parts/${partId}`,
    }),
    delete: (partId: number | string) => ({
      method: "DELETE" as const,
      url: `/api/parts/${partId}`,
    }),
  },

  // ─── ServiceCenterController ─────────────────────────────────────────────
  serviceCenters: {
    create: {
      method: "POST" as const,
      url: "/api/service-centers",
    },
    list: {
      method: "GET" as const,
      url: "/api/service-centers",
    },
    detail: (id: number | string) => ({
      method: "GET" as const,
      url: `/api/service-centers/${id}`,
    }),
    update: (id: number | string) => ({
      method: "PUT" as const,
      url: `/api/service-centers/${id}`,
    }),
    delete: (id: number | string) => ({
      method: "DELETE" as const,
      url: `/api/service-centers/${id}`,
    }),
  },


  // ─── ServiceItemController ───────────────────────────────────────────────
  serviceItems: {
    create: {
      method: "POST" as const,
      url: "/api/service-items",
    },
    suggestPart: (itemId: number | string) => ({
      method: "POST" as const,
      url: `/api/service-items/${itemId}/suggest-part`,
    }),
    list: {
      method: "GET" as const,
      url: "/api/service-items",
    },
    update: (itemId: number | string) => ({
      method: "PUT" as const,
      url: `/api/service-items/${itemId}`,
    }),
    deleteSuggestedPart: (
      itemId: number | string,
      partId: number | string
    ) => ({
      method: "DELETE" as const,
      url: `/api/service-items/${itemId}/suggest-part/${partId}`,
    }),
  },

  // ─── ServicePackageController ────────────────────────────────────────────
  servicePackages: {
    create: {
      method: "POST" as const,
      url: "/api/service-packages",
    },
    list: {
      method: "GET" as const,
      url: "/api/service-packages",
    },
    detail: (id: number | string) => ({
      method: "GET" as const,
      url: `/api/service-packages/${id}`,
    }),
    update: (id: number | string) => ({
      method: "PUT" as const,
      url: `/api/service-packages/${id}`,
    }),
    delete: (id: number | string) => ({
      method: "DELETE" as const,
      url: `/api/service-packages/${id}`,
    }),
  },

  // ─── ServiceTicketController ─────────────────────────────────────────────
  serviceTickets: {
    performance: {
      method: "GET" as const,
      url: "/api/service-tickets/performance",
    },
    createForAppointment: (appointmentId: number | string) => ({
      method: "POST" as const,
      url: `/api/service-tickets/technician/${appointmentId}/create-service-ticket`,
    }),
    addServiceItems: (ticketId: number | string) => ({
      method: "POST" as const,
      url: `/api/service-tickets/${ticketId}/service-items`,
    }),
    completeByTechnician: (ticketId: number | string) => ({
      method: "PUT" as const,
      url: `/api/service-tickets/technician/${ticketId}/complete`,
    }),
    updateParts: (ticketId: number | string) => ({
      method: "PUT" as const,
      url: `/api/service-tickets/${ticketId}/parts`,
    }),
    deleteServiceItem: (
      ticketId: number | string,
      itemId: number | string
    ) => ({
      method: "DELETE" as const,
      url: `/api/service-tickets/${ticketId}/service-items/${itemId}`,
    }),
  },

  // ─── UserController ──────────────────────────────────────────────────────
  users: {
    search: {
      method: "GET" as const,
      url: "/api/users/search",
    },
    byRole: (role: string) => ({
      method: "GET" as const,
      url: `/api/users/role/${role}`,
    }),
    detail: (id: number | string) => ({
      method: "GET" as const,
      url: `/api/users/${id}`,
    }),
    get_profile: {
      method: "GET" as const,
      url: "/api/users/profile",
    },
    update_profile: {
      method:"PUT" as const,
      url:"/api/users/profile"
    },
    calculate: {
      method: "GET" as const,
      url: "/api/users/calculate",
    },
    profit: {
      method: "GET" as const,
      url: "/api/users/profit",
    },
    update: (id: number | string) => ({
      method: "PUT" as const,
      url: `/api/users/${id}`,
    }),
    delete: (id: number | string) => ({
      method: "DELETE" as const,
      url: `/api/users/${id}`,
    }),
    createStaff: {
      method: "POST" as const,
      url: "/api/users/createStaff",
    },
    createTechnician: {
      method: "POST" as const,
      url: "/api/users/createTechnician",
    },
    getListUserByRole:{
      method: "GET" as const,
      url: "/api/users"
    },
    addCertificate: (id: number | string) => ({
      method: "POST" as const,
      url: `/api/users/${id}/certificates`,
    }),
  },

  // ─── VehicleController ───────────────────────────────────────────────────
  vehicles: {
    create: {
      method: "POST" as const,
      url: "/api/vehicle",
    },
    list: {
      method: "GET" as const,
      url: "/api/vehicles",
    },
    detail: (id: number | string) => ({
      method: "GET" as const,
      url: `/api/vehicles/${id}`,
    }),
    update: (id: number | string) => ({
      method: "PUT" as const,
      url: `/api/vehicles/${id}`,
    }),
    delete: (id: number | string) => ({
      method: "DELETE" as const,
      url: `/api/vehicles/${id}`,
    }),
  },

  // ─── NotificationController ──────────────────────────────────────────────
  notifications: {
    list: {
      method: "GET" as const,
      url: "/api/notifications",
    },
    detail: (id: number | string) => ({
      method: "GET" as const,
      url: `/api/notifications/${id}`,
    }),
    byUser: (userId: number | string) => ({
      method: "GET" as const,
      url: `/api/notifications/user/${userId}`,
    }),
    create: {
      method: "POST" as const,
      url: "/api/notifications",
    },
    markRead: (id: number | string) => ({
      method: "PUT" as const,
      url: `/api/notifications/${id}/read`,
    }),
    update: (id: number | string) => ({
      method: "PUT" as const,
      url: `/api/notifications/${id}`,
    }),
  },

  // ─── TicketServiceItemController ─────────────────────────────────────────
  ticketServiceItems: {
    list: {
      method: "GET" as const,
      url: "/api/ticket-service-items",
    },
    detail: (ticketId: number | string, itemId: number | string) => ({
      method: "GET" as const,
      url: `/api/ticket-service-items/${ticketId}/${itemId}`,
    }),
    create: {
      method: "POST" as const,
      url: "/api/ticket-service-items",
    },
    update: {
      method: "PUT" as const,
      url: "/api/ticket-service-items/",
    },
    delete: (ticketId: number | string, itemId: number | string) => ({
      method: "DELETE" as const,
      url: `/api/ticket-service-items/${ticketId}/${itemId}`,
    }),
  },
};

export type EndpointConfig = typeof ENDPOINTS;
