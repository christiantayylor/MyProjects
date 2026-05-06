package com.example.demo.bootstrap;

import com.example.demo.domain.OutsourcedPart;
import com.example.demo.domain.Part;
import com.example.demo.domain.Product;
import com.example.demo.repositories.OutsourcedPartRepository;
import com.example.demo.repositories.PartRepository;
import com.example.demo.repositories.ProductRepository;
import com.example.demo.service.OutsourcedPartService;
import com.example.demo.service.OutsourcedPartServiceImpl;
import com.example.demo.service.ProductService;
import com.example.demo.service.ProductServiceImpl;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 *
 */
@Component
public class BootStrapData implements CommandLineRunner {

    private final PartRepository partRepository;
    private final ProductRepository productRepository;

    private final OutsourcedPartRepository outsourcedPartRepository;

    public BootStrapData(PartRepository partRepository, ProductRepository productRepository, OutsourcedPartRepository outsourcedPartRepository) {
        this.partRepository = partRepository;
        this.productRepository = productRepository;
        this.outsourcedPartRepository = outsourcedPartRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        if (partRepository.count() == 0 && productRepository.count() == 0) addSampleInventory();


        List<OutsourcedPart> outsourcedParts = (List<OutsourcedPart>) outsourcedPartRepository.findAll();
        for (OutsourcedPart part : outsourcedParts) {
            System.out.println(part.getName() + " " + part.getCompanyName());
        }


        System.out.println("Started in Bootstrap");
        System.out.println("Number of Products" + productRepository.count());
        System.out.println(productRepository.findAll());
        System.out.println("Number of Parts" + partRepository.count());
        System.out.println(partRepository.findAll());

    }

    private void addSampleInventory() {
        createAndSaveOutsourcedPart("Dell Multi-Device Wireless Keyboard – KB700", 64.99, 500, 0, 500, "Dell");
        createAndSaveOutsourcedPart("Logitech Brio 101 Full HD 1080p Webcam", 38.54, 10, 0, 500, "LogiTech");
        createAndSaveOutsourcedPart("Lenovo IdeaPad Gaming H100 Headset", 25.99, 500, 0, 500, "Lenovo");
        createAndSaveOutsourcedPart("Ercielook Ethernet Cable 100 ft", 16.39, 0, 0, 500, "Ercielook");
        createAndSaveOutsourcedPart("APC Electric SurgeArrest 8-Outlet Surge Protector", 23.99, 500, 0, 500, "APC");

        createAndSaveProduct("Lenovo ThinkCentre M625 Mini Desktop", 169.99, 500);
        createAndSaveProduct("Coolby Yealbox MINI PC Intel Celeron N3350", 69.98, 100);
        createAndSaveProduct("HP EliteDesk 800 G2 Mini Desktop PC", 89.0, 100);
        createAndSaveProduct("Dell Inspiron Small Desktop", 649.99, 500);
        createAndSaveProduct("Dell XPS 13 Laptop", 699.0, 100);
    }

    private void createAndSaveOutsourcedPart(String name, double price, int inventory, int minInv, int maxInv, String companyName) {
        OutsourcedPart part = new OutsourcedPart();
        part.setName(name);
        part.setPrice(price);
        part.setInv(inventory);
        part.setMinInv(minInv);
        part.setMaxInv(maxInv);
        part.setCompanyName(companyName);
        outsourcedPartRepository.save(part);
    }

    private void createAndSaveProduct(String name, double price, int inventory) {
        Product product = new Product();
        product.setName(name);
        product.setPrice(price);
        product.setInv(inventory);
        productRepository.save(product);
    }

}