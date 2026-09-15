package org.akira.ladux.catalog.api;

import org.akira.ladux.catalog.api.dto.ProductVariantView;
import org.akira.ladux.catalog.api.dto.ProductView;
import org.akira.ladux.catalog.api.dto.ProductPage;
import org.akira.ladux.catalog.api.dto.ProductSearch;

public interface CatalogQuery {
    ProductView getProduct(Integer id);

    ProductVariantView getVariant(Integer variantId);

    boolean variantExists(Integer variantId);

    ProductPage searchProducts(ProductSearch search);
}
