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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository repo;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
        return repo.findAll(pageable)
                .map(ReviewResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(int id) {
        return ReviewResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay review voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByProductId(int productId, Pageable pageable) {
        return repo.findByProductId(productId, pageable)
                .map(ReviewResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByUserId(int userId, Pageable pageable) {
        return repo.findByUserId(userId, pageable)
                .map(ReviewResponse::fromEntity);
    }

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + request.userId()));
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + request.productId()));
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
    public ReviewResponse updateReview(int userId, int reviewId, ReviewRequest request) {
        Review review = repo.findByUserIdAndId(userId, reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay review voi id = " + reviewId + " va userId = " + userId));
        if (request.rating() != null) {
            if (request.rating() < 1 || request.rating() > 5) {
                throw new BusinessRuleException("Rating phai nam trong khoang 1 den 5");
            }
            review.setRating(request.rating());
        }
        if (request.comment() != null) {
            review.setComment(request.comment());
        }
        return ReviewResponse.fromEntity(review);
    }

    @Override
    @Transactional
    public void deleteReviewById(int userId, int reviewId) {
        Review review = repo.findByUserIdAndId(userId, reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay review voi id = " + reviewId + " va userId = " + userId));
        repo.delete(review);
    }
}
