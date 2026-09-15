package org.akira.ladux.catalog.application.query;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.akira.ladux.catalog.api.CatalogQuery;
import org.akira.ladux.catalog.api.dto.ProductPage;
import org.akira.ladux.catalog.api.dto.ProductSearch;
import org.akira.ladux.catalog.api.dto.ProductVariantView;
import org.akira.ladux.catalog.api.dto.ProductView;
import org.akira.ladux.catalog.application.port.out.ProductIdPage;
import org.akira.ladux.catalog.application.port.out.ProductReadPort;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

/** Catalog's read boundary; it exports immutable snapshots, never JPA entities. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetProductUseCase implements CatalogQuery {

    private final ProductReadPort productReadPort;

    public ProductView execute(Integer id) {
        return getProduct(id);
    }

    @Override
    public ProductView getProduct(Integer id) {
        requirePositiveId(id, "productId");
        return productReadPort.findProductById(id)
                .map(ProductMapper::toView)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id = " + id));
    }

    @Override
    public ProductVariantView getVariant(Integer variantId) {
        requirePositiveId(variantId, "variantId");
        return productReadPort.findVariantById(variantId)
                .map(ProductMapper::toVariantView)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể sản phẩm với id = " + variantId));
    }

    @Override
    public boolean variantExists(Integer variantId) {
        return variantId != null && variantId > 0 && productReadPort.variantExists(variantId);
    }

    @Override
    public ProductPage searchProducts(ProductSearch search) {
        if (search.brandId() != null && !productReadPort.brandExists(search.brandId())) {
            throw new ResourceNotFoundException("Không tìm thấy brand với id = " + search.brandId());
        }
        if (search.categoryId() != null && !productReadPort.categoryExists(search.categoryId())) {
            throw new ResourceNotFoundException("Không tìm thấy category với id = " + search.categoryId());
        }
        ProductIdPage idPage = productReadPort.findProductIds(search);
        if (idPage.ids().isEmpty()) {
            return toPage(List.of(), search, idPage.totalElements());
        }

        Map<Integer, ProductView> productsById = new HashMap<>();
        productReadPort.findProductsByIds(idPage.ids()).forEach(product ->
                productsById.put(product.getId(), ProductMapper.toView(product)));
        List<ProductView> content = idPage.ids().stream()
                .map(productsById::get)
                .filter(java.util.Objects::nonNull)
                .toList();
        return toPage(content, search, idPage.totalElements());
    }

    private ProductPage toPage(List<ProductView> content, ProductSearch search, long totalElements) {
        int totalPages = totalElements == 0 ? 0 : (int) Math.ceil((double) totalElements / search.pageSize());
        boolean first = search.pageNumber() == 0;
        boolean last = totalPages == 0 || search.pageNumber() >= totalPages - 1;
        return new ProductPage(content, search.pageNumber(), search.pageSize(), totalElements,
                totalPages, first, last, content.isEmpty());
    }

    private void requirePositiveId(Integer id, String name) {
        if (id == null || id < 1) {
            throw new IllegalArgumentException(name + " must be a positive integer");
        }
    }
}
