package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.WishlistRequest;
import org.akira.auratech.dto.WishlistResponse;
import org.akira.auratech.model.Product;
import org.akira.auratech.model.User;
import org.akira.auratech.model.Wishlist;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.repository.WishlistRepository;
import org.akira.auratech.service.WishlistService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {
    private final WishlistRepository repo;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public List<WishlistResponse> getAllWishlists() {
        return repo.findAll().stream()
                .map(WishlistResponse::fromEntity)
                .toList();
    }

    @Override
    public WishlistResponse getWishlistById(int id) {
        return WishlistResponse.fromEntity(repo.findById(id).orElse(null));
    }

    @Override
    public List<WishlistResponse> getWishlistsByUserId(int userId) {
        return repo.findByUserId(userId).stream()
                .map(WishlistResponse::fromEntity)
                .toList();
    }

    @Override
    public List<WishlistResponse> getWishlistsByProductId(int productId) {
        return repo.findByProductId(productId).stream()
                .map(WishlistResponse::fromEntity)
                .toList();
    }

    @Override
    public WishlistResponse createWishlist(WishlistRequest request) {
        User user = userRepository.findById(request.getUserId()).orElse(null);
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (user == null || product == null) {
            return null;
        }
        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();
        return WishlistResponse.fromEntity(repo.save(wishlist));
    }

    @Override
    public WishlistResponse updateWishlist(int id, WishlistRequest request) {
        Wishlist wishlist = repo.findById(id).orElse(null);
        if (wishlist == null) {
            return null;
        }
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId()).orElse(null);
            if (user == null) {
                return null;
            }
            wishlist.setUser(user);
        }
        if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId()).orElse(null);
            if (product == null) {
                return null;
            }
            wishlist.setProduct(product);
        }
        return WishlistResponse.fromEntity(repo.save(wishlist));
    }

    @Override
    public void deleteWishlistById(int id) {
        repo.deleteById(id);
    }
}
