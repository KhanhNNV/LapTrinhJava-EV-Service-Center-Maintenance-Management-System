package edu.uth.evservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EvServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(EvServiceApplication.class, args);
	}

}