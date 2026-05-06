package com.example.demo.controllers;

import com.example.demo.domain.Product;
import com.example.demo.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

@Controller
public class BuyProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/buyProduct")
    public String buyProduct(@RequestParam("productID") Long productId, RedirectAttributes redirectAttributes) {
        Optional<Product> productOptional = productRepository.findById(productId);

        if (productOptional.isPresent()) {
            Product product = productOptional.get();
            if (product.getInv() > 0) {
                product.setInv(product.getInv() - 1);
                productRepository.save(product);
                redirectAttributes.addFlashAttribute("successMessage", "Purchase successful");
            } else {
                redirectAttributes.addFlashAttribute("errorMessage", "Purchase failed, product out of stock.");
            }
        } else {
            redirectAttributes.addFlashAttribute("errorMessage", "Purchase failed, product not found");
        }

        return "redirect:/mainscreen";
    }
}