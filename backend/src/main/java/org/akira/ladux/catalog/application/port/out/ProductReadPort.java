package org.akira.ladux.catalog.application.port.out;

import java.util.List;
import java.util.Optional;

import org.akira.ladux.catalog.api.dto.ProductSearch;
import org.akira.ladux.catalog.domain.model.Product;
import org.akira.ladux.catalog.domain.model.ProductVariant;

/** Persistence operations required by Catalog read use cases. */
public interface ProductReadPort {
    Optional<Product> findProductById(Integer id);

    Optional<ProductVariant> findVariantById(Integer id);

    boolean variantExists(Integer id);

    ProductIdPage findProductIds(ProductSearch search);

    List<Product> findProductsByIds(List<Integer> ids);

    boolean brandExists(Integer id);

    boolean categoryExists(Integer id);
}
