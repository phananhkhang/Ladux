package org.akira.ladux.service;

import org.akira.ladux.dto.system.request.ContactRequest;

public interface ContactService {

    void sendContactMessage(ContactRequest request);
}