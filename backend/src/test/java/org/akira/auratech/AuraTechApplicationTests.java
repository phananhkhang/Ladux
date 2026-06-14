package org.akira.auratech;

import org.junit.jupiter.api.Test;

/**
 * Smoke test: chi kiem tra application context khoi dong thanh cong.
 * Ke thua AbstractIntegrationTest de dung Postgres (Testcontainers) + profile "test",
 * thay vi co ket noi DB that o localhost.
 */
class AuraTechApplicationTests extends AbstractIntegrationTest {

    @Test
    void contextLoads() {
    }
}
