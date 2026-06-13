package com.rainbowforest.brandservice.service;

import com.rainbowforest.brandservice.entity.Brand;
import java.util.List;

public interface BrandService {
    List<Brand> getAllBrands();
    Brand getBrandById(Long id);
    Brand saveBrand(Brand brand);
    void deleteBrand(Long id);
    Brand updateBrand(Long id, Brand brand);
}
