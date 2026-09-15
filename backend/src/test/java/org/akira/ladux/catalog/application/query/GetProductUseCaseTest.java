package org.akira.ladux.catalog.application.query;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;

import org.akira.ladux.catalog.api.dto.ProductSearch;
import org.akira.ladux.catalog.application.port.out.ProductIdPage;
import org.akira.ladux.catalog.application.port.out.ProductReadPort;
import org.akira.ladux.catalog.domain.model.Brand;
import org.akira.ladux.catalog.domain.model.Category;
import org.akira.ladux.catalog.domain.model.Color;
import org.akira.ladux.catalog.domain.model.Product;
import org.akira.ladux.catalog.domain.model.ProductVariant;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GetProductUseCaseTest {

    @Mock
    private ProductReadPort productReadPort;

    @Test
    void returnsProductSnapshotWithoutStockQuantity() {
        Product product = product(17, "ThinkPad X1");
        when(productReadPort.findProductById(17)).thenReturn(Optional.of(product));

        var result = new GetProductUseCase(productReadPort).getProduct(17);

        assertEquals(17, result.id());
        assertEquals("ThinkPad X1", result.name());
        assertEquals("Lenovo", result.brandName());
        assertEquals(1, result.variants().size());
        assertEquals("X1-16-512-BLACK", result.variants().getFirst().sku());
    }

    @Test
    void retainsDatabasePageOrderAfterDetailFetch() {
        Product first = product(2, "First");
        Product second = product(5, "Second");
        ProductSearch search = new ProductSearch(null, null, null, 0, 20, "id", true);
        when(productReadPort.findProductIds(search)).thenReturn(new ProductIdPage(List.of(5, 2), 2));
        when(productReadPort.findProductsByIds(List.of(5, 2))).thenReturn(List.of(first, second));

        var result = new GetProductUseCase(productReadPort).searchProducts(search);

        assertEquals(List.of(5, 2), result.content().stream().map(view -> view.id()).toList());
        assertTrue(result.first());
        assertTrue(result.last());
        assertFalse(result.empty());
    }

    private Product product(Integer id, String name) {
        Brand brand = Brand.builder().id(3).name("Lenovo").slug("lenovo").build();
        Category category = Category.builder().id(4).name("Laptop").slug("laptop").build();
        Color color = Color.builder().id(7).name("Black").hexCode("#000000").build();
        Product product = Product.builder()
                .id(id)
                .brand(brand)
                .category(category)
                .name(name)
                .slug(name.toLowerCase().replace(' ', '-'))
                .isActive(true)
                .variants(new LinkedHashSet<>())
                .build();
        product.addVariant(ProductVariant.builder()
                .id(id + 100)
                .color(color)
                .sku("X1-16-512-BLACK")
                .ram("16GB")
                .rom("512GB")
                .price(new BigDecimal("30000000"))
                .isActive(true)
                .build());
        return product;
    }
}
