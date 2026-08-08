package org.akira.ladux.service.user;

import org.akira.ladux.model.Product;
import org.akira.ladux.model.ProductVariant;
import org.akira.ladux.repository.ProductRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
public class ChatbotService {
    private final ChatClient chatClient;
    private final ProductRepository productRepository;
    private final ChatMemory chatMemory = MessageWindowChatMemory.builder().build();

    public ChatbotService(
            ChatClient.Builder builder,
            ProductRepository productRepository
    ) {
        this.chatClient = builder
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
        this.productRepository = productRepository;
    }

    public String chat(String query, String conversationId) {
        String context = buildContext(findRelevantProducts(query));

        return chatClient
                .prompt()
                .system("""
                        Bạn là trợ lý bán hàng của Ladux.

                        Chỉ sử dụng dữ liệu sản phẩm được cung cấp
                        để tư vấn về sản phẩm Ladux.

                        Nếu không có đủ thông tin thì hãy nói rõ
                        rằng hệ thống chưa có dữ liệu phù hợp.

                        Dữ liệu sản phẩm:
                        %s
                        """.formatted(context))
                .user(query)
                .advisors(advisor -> advisor.param(ChatMemory.CONVERSATION_ID, conversationId))
                .call()
                .content();
    }

    private List<Product> findRelevantProducts(String query) {
        List<Product> products = productRepository.findByIsActiveTrue();
        List<String> keywords = Arrays.stream(query.toLowerCase(Locale.ROOT).split("\\s+"))
                .filter(keyword -> keyword.length() > 2)
                .toList();

        if (keywords.isEmpty()) {
            return products.stream().limit(8).toList();
        }

        List<Product> matches = products.stream()
                .filter(product -> keywords.stream().anyMatch(keyword -> productText(product).contains(keyword)))
                .limit(8)
                .toList();

        return matches.isEmpty() ? products.stream().limit(8).toList() : matches;
    }

    private String productText(Product product) {
        return String.join(" ",
                        product.getName(),
                        product.getBrand().getName(),
                        product.getCategory().getName(),
                        product.getCpu(),
                        product.getGpu(),
                        product.getDescription())
                .toLowerCase(Locale.ROOT)
                .replace("null", "");
    }

    private String buildContext(List<Product> products) {
        StringBuilder context = new StringBuilder();

        for (Product product : products) {
            context.append("SẢN PHẨM\n");
            context.append("Tên: ").append(product.getName()).append("\n");
            context.append("Brand: ").append(product.getBrand().getName()).append("\n");
            context.append("CPU: ").append(product.getCpu()).append("\n");
            context.append("GPU: ").append(product.getGpu()).append("\n");

            for (ProductVariant variant : product.getVariants()) {
                context.append("- RAM: ").append(variant.getRam())
                        .append(", ROM: ").append(variant.getRom())
                        .append(", giá: ")
                        .append(variant.getDiscountPrice() != null
                                ? variant.getDiscountPrice()
                                : variant.getPrice())
                        .append(", tồn kho: ")
                        .append(variant.getStockQuantity())
                        .append("\n");
            }

            context.append("\n");
        }

        return context.toString();
    }
}
