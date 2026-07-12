package org.akira.ladux.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.akira.ladux.AbstractIntegrationTest;
import org.akira.ladux.model.Product;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Integration test cho co che TRU KHO ATOMIC (deductStockAtomically) — luat nghiep vu chong oversell.
 *
 * Tao san pham rieng cho test (commit that) va xoa o @AfterEach de khong anh huong du lieu seed.
 * Moi lan tru kho duoc boc trong mot transaction rieng (TransactionTemplate) vi cau lenh @Modifying
 * yeu cau co transaction.
 */
class ProductRepositoryTest extends AbstractIntegrationTest {

    @Autowired ProductRepository productRepository;
    @Autowired BrandRepository brandRepository;
    @Autowired CategoryRepository categoryRepository;
    @Autowired PlatformTransactionManager txManager;

    private Integer createdProductId;

    @AfterEach
    void cleanup() {
        if (createdProductId != null) {
            productRepository.deleteById(createdProductId);
            createdProductId = null;
        }
    }

    private Product newProduct(int stock) {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        Product product = Product.builder()
                .brand(brandRepository.findAll().get(0))
                .category(categoryRepository.findAll().get(0))
                .sku("TEST-" + unique)
                .name("Test Product " + unique)
                .slug("test-product-" + unique)
                .basePrice(new BigDecimal("100.00"))
                .stockQuantity(stock)
                .isActive(true)
                .build();
        product = productRepository.save(product);
        createdProductId = product.getId();
        return product;
    }

    private int deductInOwnTx(int productId, int qty) {
        TransactionTemplate tx = new TransactionTemplate(txManager);
        return tx.execute(status -> productRepository.deductStockAtomically(productId, qty));
    }

    @Test
    void deductStock_succeeds_whenEnoughStock() {
        Product product = newProduct(10);
        int updated = deductInOwnTx(product.getId(), 3);
        assertEquals(1, updated, "Du hang -> update 1 dong");
        assertEquals(7, productRepository.findById(product.getId()).orElseThrow().getStockQuantity());
    }

    @Test
    void deductStock_fails_whenInsufficientStock() {
        Product product = newProduct(2);
        int updated = deductInOwnTx(product.getId(), 5);
        assertEquals(0, updated, "Khong du hang -> khong update dong nao");
        assertEquals(2, productRepository.findById(product.getId()).orElseThrow().getStockQuantity(),
                "Ton kho khong bi thay doi khi tru that bai");
    }

    @Test
    void deductStock_isAtomic_noOverselling_underConcurrency() throws Exception {
        int stock = 50;
        int attempts = 100; // gap doi ton kho -> chi mot nua thanh cong
        Product product = newProduct(stock);

        ExecutorService pool = Executors.newFixedThreadPool(16);
        CountDownLatch startGate = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger();

        CompletableFuture<?>[] futures = new CompletableFuture[attempts];
        for (int i = 0; i < attempts; i++) {
            futures[i] = CompletableFuture.runAsync(() -> {
                try {
                    startGate.await(); // dong loat xuat phat de toi da hoa tranh chap
                    if (deductInOwnTx(product.getId(), 1) == 1) {
                        successCount.incrementAndGet();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, pool);
        }

        startGate.countDown();
        CompletableFuture.allOf(futures).get(60, TimeUnit.SECONDS);
        pool.shutdown();

        assertEquals(stock, successCount.get(), "Chi dung 50 lan tru kho thanh cong (khong oversell)");
        assertEquals(0, productRepository.findById(product.getId()).orElseThrow().getStockQuantity(),
                "Ton kho ve dung 0, khong bao gio am");
    }
}
