package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.model.Wishlist;
import org.akira.auratech.repository.WishlistRepository;
import org.akira.auratech.service.WishlistService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {
    private final WishlistRepository repo;

    @Override
    public List<Wishlist> getAllWishlists() {
        return repo.findAll();
    }

    @Override
    public Wishlist getWishlistById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<Wishlist> getWishlistsByUserId(int userId) {
        return repo.findByUserId(userId);
    }

    @Override
    public List<Wishlist> getWishlistsByProductId(int productId) {
        return repo.findByProductId(productId);
    }

    @Override
    public Wishlist createWishlist(Wishlist wishlist) {
        return repo.save(wishlist);
    }

    @Override
    public Wishlist updateWishlist(Wishlist wishlist) {
        return repo.save(wishlist);
    }

    @Override
    public void deleteWishlistById(int id) {
        repo.deleteById(id);
    }
}

