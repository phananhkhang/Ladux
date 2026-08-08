package org.akira.ladux.controller.chatbot;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/gemini")
public class GeminiController {
    private final ChatClient chatClient;
    private final ChatMemory chatMemory = MessageWindowChatMemory.builder().build();
    private final EmbeddingModel embeddingModel;
    @Autowired
    private final VectorStore vectorStore;

    public GeminiController(ChatClient.Builder builder, EmbeddingModel embeddingModel, VectorStore vectorStore) {
        this.embeddingModel = embeddingModel;
        this.vectorStore = vectorStore;
        this.chatClient = builder
                .defaultAdvisors(
                        MessageChatMemoryAdvisor
                                .builder(chatMemory)
                                .build())
                .build();
    }
    // Gửi prompt
    @PostMapping("/send-prompt")
    public ResponseEntity<String> sendPrompt(@RequestParam String query) {
         String response = chatClient
                 .prompt(query)
                 .call()
                 .content();
         return ResponseEntity.ok(response);
    }
}
