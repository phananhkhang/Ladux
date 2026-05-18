package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.CartItemRequest;
import org.akira.auratech.dto.response.CartItemResponse;
import org.akira.auratech.model.Cart;
import org.akira.auratech.model.CartItem;
import org.akira.auratech.model.Product;
import org.akira.auratech.repository.CartItemRepository;
import org.akira.auratech.repository.CartRepository;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.service.CartItemService;
import org.akira.auratech.exception.BusinessRuleException;
import org.springframework.stereotype.Service;
import org.akira.auratech.exception.ResourceNotFoundException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartItemServiceImpl implements CartItemService {
    private final CartItemRepository repo;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @Override
    public List<CartItemResponse> getAllCartItems() {
        return repo.findAll().stream()
                .map(CartItemResponse::fromEntity)
                .toList();
    }

    @Override
    public CartItemResponse getCartItemById(int id) {
        return CartItemResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay cart item voi id = " + id)));
    }

    @Override
    public List<CartItemResponse> getCartItemsByCartId(int cartId) {
        return repo.findByCartId(cartId).stream()
                .map(CartItemResponse::fromEntity)
                .toList();
    }

    @Override
    public List<CartItemResponse> getCartItemsByProductId(int productId) {
        return repo.findByProductId(productId).stream()
                .map(CartItemResponse::fromEntity)
                .toList();
    }

    @Override
    public CartItemResponse createCartItem(CartItemRequest request) {
        Cart cart = cartRepository.findById(request.cartId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay cart voi id = " + request.cartId()));
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + request.productId()));
        if (cart == null || product == null) {
            return null;
        }
        validateCartQuantity(product, request.quantity());
        CartItem item = CartItem.builder()
                .cart(cart)
                .product(product)
                .quantity(request.quantity())
                .build();
        return CartItemResponse.fromEntity(repo.save(item));
    }

    @Override
    public CartItemResponse updateCartItem(int id, CartItemRequest request) {
        CartItem item = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay cart item voi id = " + id));
        if (request.cartId() != null) {
            Cart cart = cartRepository.findById(request.cartId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay cart voi id = " + request.cartId()));
            item.setCart(cart);
        }
        if (request.productId() != null) {
            Product product = productRepository.findById(request.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + request.productId()));
            item.setProduct(product);
        }
        validateCartQuantity(item.getProduct(), request.quantity());
        item.setQuantity(request.quantity());
        return CartItemResponse.fromEntity(repo.save(item));
    }

    @Override
    public void deleteCartItemById(int id) {
        repo.deleteById(id);
    }

    private void validateCartQuantity(Product product, int quantity) {
        if (!product.isActive()) {
            throw new BusinessRuleException("San pham dang ngung kinh doanh");
        }
        if (product.getStockQuantity() < quantity) {
            throw new BusinessRuleException("So luong trong gio vuot qua ton kho hien co");
        }
    }
}
