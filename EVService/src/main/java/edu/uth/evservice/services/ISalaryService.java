package edu.uth.evservice.services;

import edu.uth.evservice.dtos.SalaryDto;

import java.time.YearMonth;
import java.util.List;

public interface ISalaryService {
    List<SalaryDto> calculateMonthlySalaries(YearMonth month);
}
