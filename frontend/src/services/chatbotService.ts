import apiClient from "./apiClient";

export const chatbotService = {
    chat: (query: string, conversationId: string): Promise<string> =>
        apiClient.post("/chatbot/chat", undefined, {
            params: { query, conversationId },
        }) as unknown as Promise<string>,
};
