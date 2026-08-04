package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.catalog.request.ReviewCreateRequest;
import org.akira.ladux.dto.catalog.request.ReviewUpdateRequest;
import org.akira.ladux.dto.catalog.response.ReviewResponse;
import org.akira.ladux.model.Product;
import org.akira.ladux.model.Review;
import org.akira.ladux.model.User;
import org.akira.ladux.model.enums.OrderStatus;
import org.akira.ladux.repository.OrderRepository;
import org.akira.ladux.repository.ProductRepository;
import org.akira.ladux.repository.ReviewRepository;
import org.akira.ladux.repository.UserRepository;
import org.akira.ladux.service.ReviewService;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository repo;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "reviews", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
        return repo.findAll(pageable)
                .map(ReviewResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "reviews", key = "'id:' + #id")
    public ReviewResponse getReviewById(int id) {
        return ReviewResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay review voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "reviews", key = "'product:' + #productId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<ReviewResponse> getReviewsByProductId(int productId, Pageable pageable) {
        return repo.findByProductId(productId, pageable)
                .map(ReviewResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "reviews", key = "'user:' + #userId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<ReviewResponse> getReviewsByUserId(int userId, Pageable pageable) {
        return repo.findByUserId(userId, pageable)
                .map(ReviewResponse::fromEntity);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "reviews", allEntries = true),
            @CacheEvict(value = "products", allEntries = true)
    })
    public ReviewResponse createReview(int userId, ReviewCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + userId));
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + request.productId()));
        if (repo.existsByUserIdAndProductId(user.getId(), product.getId())) {
            throw new BusinessRuleException("Nguoi dung da danh gia san pham nay");
        }
        if (!orderRepository.existsOrderContainingProductWithStatus(user.getId(), product.getId(), OrderStatus.DELIVERED)) {
            throw new BusinessRuleException("Chi co the danh gia san pham sau khi don hang da DELIVERED");
        }
        if (!validateReviewRating(request.rating())) {
            throw new BusinessRuleException("Rating phai tu 1 den 5");
        }
        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.rating())
                .comment(request.comment())
                .createdAt(Instant.now())
                .build();
        return ReviewResponse.fromEntity(repo.save(review));
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "reviews", allEntries = true),
            @CacheEvict(value = "products", allEntries = true)
    })
    public ReviewResponse updateReview(int userId, int reviewId, ReviewUpdateRequest request) {
        Review review = repo.findByUserIdAndId(userId, reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay review voi id = " + reviewId + " va userId = " + userId));
        if (request.rating() != null && validateReviewRating(request.rating())) {
            review.setRating(request.rating());
        }
        if (request.rating() != null && !validateReviewRating(request.rating())) {
            throw new BusinessRuleException("Rating phai tu 1 den 5"); 
        }
        if (request.comment() != null) {
            review.setComment(request.comment());
        }
        review.setCreatedAt(Instant.now());
        return ReviewResponse.fromEntity(review);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "reviews", allEntries = true),
            @CacheEvict(value = "products", allEntries = true)
    })
    public void deleteReviewById(int userId, int reviewId) {
        Review review = repo.findByUserIdAndId(userId, reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay review voi id = " + reviewId + " va userId = " + userId));
        repo.delete(review);
    }

    @Override
    public boolean validateReviewRating(int rating) {
        return rating >= 1 && rating <= 5;
    }
}
