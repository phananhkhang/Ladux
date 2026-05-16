package org.akira.auratech;

import org.akira.auratech.model.*;
import org.akira.auratech.model.enums.*;
import org.akira.auratech.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@SpringBootApplication
public class AuraTechApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuraTechApplication.class, args);

    }


}
