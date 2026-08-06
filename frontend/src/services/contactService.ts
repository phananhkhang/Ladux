import apiClient from "./apiClient";

export interface ContactMessagePayload {
    fullName: string;
    contact: string;
    message: string;
}

export const contactService = {
    sendContactMessage: async (payload: ContactMessagePayload): Promise<{ message: string }> => {
        return (await apiClient.post("/contact", payload)) as any;
    },
};
