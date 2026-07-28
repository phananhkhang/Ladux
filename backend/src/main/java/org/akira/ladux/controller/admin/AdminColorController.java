package org.akira.ladux.controller.admin;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.request.ColorRequest;
import org.akira.ladux.dto.response.ColorResponse;
import org.akira.ladux.model.Color;
import org.akira.ladux.service.ColorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.function.EntityResponse;
import org.springframework.web.servlet.function.ServerResponse;

import javax.swing.text.html.parser.Entity;


@RestController
@RequestMapping("/api/v1/admin/color")
@RequiredArgsConstructor
public class AdminColorController {
    private final ColorService colorService;
    // Thêm các phương thức xử lý yêu cầu liên quan đến màu sắc tại đây
    // Thêm màu sắc
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ColorResponse> addColor(@RequestBody ColorRequest request) {
         Color color = colorService.addColor(request);
         return new ResponseEntity<>(ColorResponse.fromEntity(color), HttpStatus.CREATED);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ColorResponse> updateColor(@PathVariable int id, @RequestBody ColorRequest request) {
        Color updatedColor = colorService.updateColor(id, request);
        return new ResponseEntity<>(ColorResponse.fromEntity(updatedColor), HttpStatus.OK);
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteColor(@PathVariable int id) {
        colorService.deleteColor(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
