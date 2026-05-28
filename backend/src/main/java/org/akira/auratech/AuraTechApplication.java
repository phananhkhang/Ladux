package org.akira.auratech;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AuraTechApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuraTechApplication.class, args);

    }
}
