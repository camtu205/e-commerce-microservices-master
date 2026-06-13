package com.rainbowforest.brandservice.controller;

import com.rainbowforest.brandservice.entity.Brand;
import com.rainbowforest.brandservice.http.header.HeaderGenerator;
import com.rainbowforest.brandservice.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/brands")
public class BrandController {

    @Autowired
    private BrandService brandService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        List<Brand> brands = brandService.getAllBrands();
        if (brands.isEmpty()) {
            return new ResponseEntity<List<Brand>>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<List<Brand>>(
                brands,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Brand> getBrandById(@PathVariable Long id) {
        Brand brand = brandService.getBrandById(id);
        if (brand == null) {
            return new ResponseEntity<Brand>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<Brand>(
                brand,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping("/images/{fileName}")
    public ResponseEntity<Resource> getBrandImage(@PathVariable String fileName) {
        try {
            Path path = Paths.get("brand-images/" + fileName);
            Resource resource = new UrlResource(path.toUri());
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG) // Có thể tinh chỉnh thêm dựa trên extension
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
