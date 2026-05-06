package com.example.demo.services;

import com.example.demo.entities.Cart;
import com.example.demo.entities.CartItem;
import com.example.demo.entities.Customer;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Purchase {
    @NonNull
    private Customer customer;
    @NonNull
    private Cart cart;
    @NonNull
    private Set<CartItem> cartItems;
}