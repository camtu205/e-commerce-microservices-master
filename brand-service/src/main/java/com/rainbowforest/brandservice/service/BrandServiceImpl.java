package com.rainbowforest.brandservice.service;

import com.rainbowforest.brandservice.entity.Brand;
import com.rainbowforest.brandservice.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BrandServiceImpl implements BrandService {

    @Autowired
    private BrandRepository brandRepository;

    private final String UPLOAD_DIR = "brand-images/";

    @Override
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    @Override
    public Brand getBrandById(Long id) {
        return brandRepository.findById(id).orElse(null);
    }

    private String saveImageToFile(String base64Image) {
        if (base64Image == null || !base64Image.startsWith("data:image")) {
            return base64Image; // Trả về nguyên bản nếu là URL hoặc null
        }

        try {
            // Tạo thư mục nếu chưa có
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) dir.mkdirs();

            String[] parts = base64Image.split(",");
            String imageString = parts[1];
            String extension = parts[0].split("/")[1].split(";")[0];
            
            byte[] imageBytes = Base64.getDecoder().decode(imageString);
            String fileName = UUID.randomUUID().toString() + "." + extension;
            
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.write(filePath, imageBytes);
            
            return fileName;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public Brand saveBrand(Brand brand) {
        if (brand.getImage() != null && brand.getImage().startsWith("data:image")) {
            brand.setImage(saveImageToFile(brand.getImage()));
        }
        return brandRepository.save(brand);
    }

    @Override
    public void deleteBrand(Long id) {
        brandRepository.deleteById(id);
    }

    @Override
    public Brand updateBrand(Long id, Brand brand) {
        Brand existingBrand = brandRepository.findById(id).orElse(null);
        if (existingBrand != null) {
            existingBrand.setName(brand.getName());
            existingBrand.setDescription(brand.getDescription());
            
            if (brand.getImage() != null && brand.getImage().startsWith("data:image")) {
                existingBrand.setImage(saveImageToFile(brand.getImage()));
            } else if (brand.getImage() != null) {
                existingBrand.setImage(brand.getImage());
            }
            
            return brandRepository.save(existingBrand);
        }
        return null;
    }
}
