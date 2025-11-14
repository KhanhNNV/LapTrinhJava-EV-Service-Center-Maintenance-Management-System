package edu.uth.evservice.services;

import edu.uth.evservice.dtos.ProfitReportDto;

public interface IProfitReportService {
    ProfitReportDto getMonthlyProfitReport(int year, int month);
}
