package com.example.demo.BootStrapData;

import com.example.demo.dao.CustomerRepository;
import com.example.demo.dao.DivisionRepository;
import com.example.demo.entities.Customer;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class BootStrapData {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DivisionRepository divisionRepository;

    @PostConstruct
    public void loadInitialData() {

        if(customerRepository.count() == 1) {

            Customer customer1 = new Customer();
            customer1.setFirstName("John");
            customer1.setLastName("Doe");
            customer1.setPostal_code("12345");
            customer1.setAddress("123 Main Street");
            customer1.setPhone("(800) 555-1234");
            customer1.setDivision(divisionRepository.findAll().get(1));
            customer1.setCreate_date(new Date());
            customer1.setLast_update(new Date());

            Customer customer2 = new Customer();
            customer2.setFirstName("Jane");
            customer2.setLastName("Doe");
            customer2.setPostal_code("54321");
            customer2.setAddress("555 Second Street");
            customer2.setPhone("(800) 555-9876");
            customer2.setDivision(divisionRepository.findAll().get(2));
            customer2.setCreate_date(new Date());
            customer2.setLast_update(new Date());

            Customer customer3 = new Customer();
            customer3.setFirstName("Johnny");
            customer3.setLastName("Appleseed");
            customer3.setPostal_code("55555");
            customer3.setAddress("234 Apple Street");
            customer3.setPhone("(800) 555-5555");
            customer3.setDivision(divisionRepository.findAll().get(3));
            customer3.setCreate_date(new Date());
            customer3.setLast_update(new Date());

            Customer customer4 = new Customer();
            customer4.setFirstName("George");
            customer4.setLastName("Washington");
            customer4.setPostal_code("23456");
            customer4.setAddress("123 President Street");
            customer4.setPhone("(800) 555-2345");
            customer4.setDivision(divisionRepository.findAll().get(4));
            customer4.setCreate_date(new Date());
            customer4.setLast_update(new Date());

            Customer customer5 = new Customer();
            customer5.setFirstName("Abraham");
            customer5.setLastName("Lincoln");
            customer5.setPostal_code("87654");
            customer5.setAddress("16 President Street");
            customer5.setPhone("(800) 555-8765");
            customer5.setDivision(divisionRepository.findAll().get(5));
            customer5.setCreate_date(new Date());
            customer5.setLast_update(new Date());

            customerRepository.save(customer1);
            customerRepository.save(customer2);
            customerRepository.save(customer3);
            customerRepository.save(customer4);
            customerRepository.save(customer5);

            System.out.println("Sample customers have been added.");
        } else {
            System.out.println("Sample customers already exist.");
        }
    }
}