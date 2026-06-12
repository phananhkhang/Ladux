package org.akira.auratech;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
@EnableScheduling
@EnableCaching
public class AuraTechApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuraTechApplication.class, args);

    }
}
