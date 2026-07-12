package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.response.CartResponse;
import org.akira.auratech.model.Cart;
import org.akira.auratech.model.CartItem;
import org.akira.auratech.model.Product;
import org.akira.auratech.model.User;
import org.akira.auratech.repository.CartRepository;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.CartService;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

// Quan ly gio hang — moi user co dung mot cart (1-1 voi User).
// Moi thao tac ghi khoa cart (findByUserIdForUpdate) de tranh race voi checkout.
// Checkout thanh cong se clear cart o OrderServiceImpl.createOrder.
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepository repo;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "carts", key = "'user:' + #userId")
    public CartResponse getCartByUserId(int userId) {
        Cart cart = repo.findByUserId(userId);
        if (cart == null) {
            throw new ResourceNotFoundException("Khong tim thay cart voi userId = " + userId);
        }
        return CartResponse.fromEntity(cart);
    }
    @Override
    @Transactional
    @CacheEvict(value = "carts", allEntries = true)
    public void addItemToCart(int userId, int productId, int quantity) {
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + userId));
        Cart cart = repo.findByUserIdForUpdate(userId)
                .orElseGet(() -> Cart.builder()
                        .user(user)
                        .build());

        // 2. Tìm sản phẩm để đảm bảo nó tồn tại
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham id = " + productId));

        // 3. Logic xử lý Item: Tìm xem trong giỏ đã có món này chưa
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            // Nếu có rồi: Chỉ tăng số lượng
            existingItem.get().incrementQuantity(quantity);
        } else {
            // Nếu chưa có: Tạo mới một CartItem và add vào giỏ
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();
            cart.getItems().add(newItem);
        }
        repo.save(cart);
    }
    @Override
    @Transactional
    @CacheEvict(value = "carts", allEntries = true)
    public void updateQuantity(int userId, int productId, int quantity) {
        userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + userId));
        Cart cart = repo.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay cart voi userId = " + userId));
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham trong giỏ"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }
        repo.save(cart);
    }
    @Override
    @Transactional
    @CacheEvict(value = "carts", allEntries = true)
    public void removeItemFromCart(int userId, int productId) {
        userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + userId));
        Cart cart = repo.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay cart voi userId = " + userId));
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham trong giỏ"));
        cart.getItems().remove(item);
        repo.save(cart);
    }
    @Override
    @Transactional
    @CacheEvict(value = "carts", allEntries = true)
    public void clearCart(int userId) {
        userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + userId));
        Cart cart = repo.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay cart voi userId = " + userId));
        cart.getItems().clear();
        repo.save(cart);
    }
}
