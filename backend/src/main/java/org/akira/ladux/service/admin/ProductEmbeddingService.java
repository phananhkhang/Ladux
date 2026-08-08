package org.akira.ladux.service.admin;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Product;
import org.akira.ladux.repository.ProductRepository;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductEmbeddingService {
    private final ProductRepository productRepository;
    private final ProductDocumentMapper productDocumentMapper;
    private final VectorStore vectorStore;

    @Transactional(readOnly = true)
    public void indexProduct(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id = " + id));
        vectorStore.add(List.of(productDocumentMapper.toDocument(product)));
    }

    @Transactional(readOnly = true)
    public int indexAllProducts() {
        List<Document> documents = productRepository.findAllForEmbedding().stream()
                .map(productDocumentMapper::toDocument)
                .toList();

        if (!documents.isEmpty()) {
            vectorStore.add(documents);
        }
        return documents.size();
    }
}
