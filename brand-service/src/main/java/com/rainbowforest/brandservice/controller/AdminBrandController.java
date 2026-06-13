package com.rainbowforest.brandservice.controller;

import com.rainbowforest.brandservice.entity.Brand;
import com.rainbowforest.brandservice.http.header.HeaderGenerator;
import com.rainbowforest.brandservice.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/admin/brands")
public class AdminBrandController {

    @Autowired
    private BrandService brandService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @PostMapping
    public ResponseEntity<Brand> addBrand(@RequestBody Brand brand, HttpServletRequest request) {
        if (brand != null) {
            try {
                Brand savedBrand = brandService.saveBrand(brand);
                return new ResponseEntity<Brand>(
                        savedBrand,
                        headerGenerator.getHeadersForSuccessPostMethod(request, savedBrand.getId()),
                        HttpStatus.CREATED);
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<Brand>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return new ResponseEntity<Brand>(HttpStatus.BAD_REQUEST);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Brand> updateBrand(@PathVariable Long id, @RequestBody Brand brand) {
        try {
            Brand updatedBrand = brandService.updateBrand(id, brand);
            if (updatedBrand == null) {
                return new ResponseEntity<Brand>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<Brand>(
                    updatedBrand,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<Brand>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        try {
            Brand brand = brandService.getBrandById(id);
            if (brand == null) {
                return new ResponseEntity<Void>(HttpStatus.NOT_FOUND);
            }
            brandService.deleteBrand(id);
            return new ResponseEntity<Void>(
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<Void>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
