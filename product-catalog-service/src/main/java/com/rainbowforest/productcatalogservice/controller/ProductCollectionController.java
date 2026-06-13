package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.ProductCollection;
import com.rainbowforest.productcatalogservice.repository.ProductCollectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/collections")
@CrossOrigin(origins = "*")
public class ProductCollectionController {

    @Autowired
    private ProductCollectionRepository repository;

    @GetMapping
    public List<ProductCollection> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ProductCollection getOne(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @PostMapping
    public ProductCollection create(@RequestBody ProductCollection collection) {
        return repository.save(collection);
    }

    @PutMapping("/{id}")
    public ProductCollection update(@PathVariable Long id, @RequestBody ProductCollection collection) {
        collection.setId(id);
        return repository.save(collection);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
