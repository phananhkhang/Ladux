package org.akira.ladux.catalog.infrastructure.persistence;

import java.util.List;
import java.util.Optional;

import org.akira.ladux.catalog.api.dto.ProductSearch;
import org.akira.ladux.catalog.application.port.out.ProductIdPage;
import org.akira.ladux.catalog.application.port.out.ProductReadPort;
import org.akira.ladux.catalog.domain.model.Product;
import org.akira.ladux.catalog.domain.model.ProductVariant;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;


@Repository
@RequiredArgsConstructor 
public class ProductRepositoryAdapter implements ProductReadPort {

    private final SpringDataProductRepository repository;
    private final SpringDataProductVariantRepository variantRepository;
    private final SpringDataBrandRepository brandRepository;
    private final SpringDataCategoryRepository categoryRepository;

    @Override
    public Optional<Product> findProductById(Integer id) {
        return repository.findById(id);
    }

    @Override
    public Optional<ProductVariant> findVariantById(Integer id) {
        return variantRepository.findById(id);
    }

    @Override
    public boolean variantExists(Integer id) {
        return variantRepository.existsById(id);
    }

    @Override
    public ProductIdPage findProductIds(ProductSearch search) {
        String requestedSort = search.sortBy() == null ? "id" : search.sortBy();
        String sortProperty = switch (requestedSort) {
            case "name", "createdAt", "id" -> search.sortBy();
            default -> "id";
        };
        Sort sort = Sort.by(search.ascending() ? Sort.Direction.ASC : Sort.Direction.DESC, sortProperty);
        PageRequest pageable = PageRequest.of(search.pageNumber(), search.pageSize(), sort);
        String text = search.text() == null || search.text().isBlank() ? null : search.text().trim();
        var ids = repository.findIds(text, search.brandId(), search.categoryId(), pageable);
        return new ProductIdPage(ids.getContent(), ids.getTotalElements());
    }

    @Override
    public List<Product> findProductsByIds(List<Integer> ids) {
        return ids.isEmpty() ? List.of() : repository.findDetailsByIdIn(ids);
    }

    @Override
    public boolean brandExists(Integer id) {
        return brandRepository.existsById(id);
    }

    @Override
    public boolean categoryExists(Integer id) {
        return categoryRepository.existsById(id);
    }
}
