package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.ReviewRequest;
import org.akira.auratech.dto.response.ReviewResponse;
import org.akira.auratech.model.Product;
import org.akira.auratech.model.Review;
import org.akira.auratech.model.User;
import org.akira.auratech.model.enums.OrderStatus;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.repository.ReviewRepository;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.ReviewService;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository repo;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {
        return repo.findAll().stream()
                .map(ReviewResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(int id) {
        return ReviewResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay review voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByProductId(int productId) {
        return repo.findByProductId(productId).stream()
                .map(ReviewResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByUserId(int userId) {
        return repo.findByUserId(userId).stream()
                .map(ReviewResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + request.userId()));
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + request.productId()));
        if (user == null || product == null) {
            return null;
        }
        if (repo.existsByUserIdAndProductId(user.getId(), product.getId())) {
            throw new BusinessRuleException("Nguoi dung da danh gia san pham nay");
        }
        if (!orderRepository.existsOrderContainingProductWithStatus(user.getId(), product.getId(), OrderStatus.DELIVERED)) {
            throw new BusinessRuleException("Chi co the danh gia san pham sau khi don hang da DELIVERED");
        }
        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.rating())
                .comment(request.comment())
                .build();
        return ReviewResponse.fromEntity(repo.save(review));
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(int id, ReviewRequest request) {
        Review review = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay review voi id = " + id));
        if (request.userId() != null) {
            User user = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + request.userId()));
            review.setUser(user);
        }
        if (request.productId() != null) {
            Product product = productRepository.findById(request.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + request.productId()));
            review.setProduct(product);
        }
        if (request.rating() != null) {
            review.setRating(request.rating());
        }
        if (request.comment() != null) {
            review.setComment(request.comment());
        }
        return ReviewResponse.fromEntity(review);
    }

    @Override
    @Transactional
    public void deleteReviewById(int id) {
        repo.deleteById(id);
    }
}
