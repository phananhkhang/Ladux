package org.akira.ladux.controller.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.system.request.ContactRequest;
import org.akira.ladux.service.ContactService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<Map<String, String>> sendContactMessage(
            @Valid @RequestBody ContactRequest request
    ) {
        contactService.sendContactMessage(request);

        return ResponseEntity.ok(Map.of(
                "message",
                "Yêu cầu của bạn đã được gửi thành công"
        ));
    }
}