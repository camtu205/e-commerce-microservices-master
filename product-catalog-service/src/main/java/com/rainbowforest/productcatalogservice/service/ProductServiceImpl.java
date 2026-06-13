package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    private static final String UPLOAD_DIR = "./product-images/";

    @Override
    public List<Product> getAllProduct() {
        return productRepository.findAll();
    }

    @Override
    public List<Product> getAllActiveProduct() {
        return productRepository.findAllByActive(1);
    }

    @Override
    public List<Product> getAllProductByCategory(String category) {
        return productRepository.findAllByCategoryAndActive(category, 1); // Default to active for category view
    }

    @Override
    public List<Product> getAllActiveProductByCategory(String category) {
        return productRepository.findAllByCategoryAndActive(category, 1);
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    @Override
    public List<Product> getAllProductsByName(String name) {
        return productRepository.findAllByProductNameContainingAndActive(name, 1); // Default to active for search
    }

    @Override
    public List<Product> getAllActiveProductsByName(String name) {
        return productRepository.findAllByProductNameContainingAndActive(name, 1);
    }

    @Override
    public Product addProduct(Product product) {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        List<String> finalImages = new ArrayList<>();
        
        try {
            // Parse existing images if any
            List<String> inputImages = product.getImages();
            if (inputImages != null && !inputImages.isEmpty()) {
                for (String img : inputImages) {
                    if (img != null) {
                        if (img.startsWith("data:image")) {
                            // Only save if it's a new Base64 string
                            finalImages.add(saveImage(img));
                        } else {
                            // If it's already a filename, keep it
                            finalImages.add(img);
                        }
                    }
                }
            } else if (product.getImage() != null) {
                String img = product.getImage();
                if (img.startsWith("data:image")) {
                    finalImages.add(saveImage(img));
                } else {
                    finalImages.add(img);
                }
            }

            // Use the product's own setter to store as JSON string
            product.setImages(finalImages);
            
            // Set main image
            if (!finalImages.isEmpty()) {
                product.setImage(finalImages.get(0));
            }
        } catch (Exception e) {
            System.err.println("Error processing product images: " + e.getMessage());
            e.printStackTrace();
            // Rethrow so the transaction rolls back and controller returns 500 with context
            throw new RuntimeException("Lỗi xử lý hình ảnh: " + e.getMessage());
        }
        
        // Đảm bảo các variant được liên kết đúng và cập nhật tổng tồn kho
        if (product.getVariants() != null) {
            product.setVariants(new ArrayList<>(product.getVariants()));
        }
        
        return productRepository.saveAndFlush(product);
    }

    private String saveImage(String base64Image) throws IOException {
        // Create directory if it doesn't exist
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            if (!directory.mkdirs()) {
                throw new IOException("Không thể tạo thư mục lưu trữ ảnh: " + UPLOAD_DIR);
            }
        }

        // Extract image type and data
        String data;
        String extension = "png";

        if (base64Image.contains(",")) {
            String[] parts = base64Image.split(",");
            String header = parts[0];
            data = parts[1];
            
            if (header.contains("jpeg") || header.contains("jpg")) extension = "jpg";
            else if (header.contains("gif")) extension = "gif";
            else if (header.contains("webp")) extension = "webp";
        } else {
            // Assume it's raw base64 data if no header
            data = base64Image;
        }

        String fileName = UUID.randomUUID().toString() + "." + extension;
        Path filePath = Paths.get(UPLOAD_DIR, fileName);

        try {
            byte[] imageBytes = Base64.getDecoder().decode(data.trim());
            Files.write(filePath, imageBytes);
        } catch (IllegalArgumentException e) {
            throw new IOException("Dữ liệu ảnh Base64 không hợp lệ", e);
        }

        return fileName;
    }

    @Autowired
    private com.rainbowforest.productcatalogservice.repository.ProductVariantRepository variantRepository;

    @Override
    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }

    @Override
    public void incrementSalesCount(Long productId, int quantity) {
        productRepository.findById(productId).ifPresent(product -> {
            product.setSalesCount(product.getSalesCount() + quantity);
            
            // If variants exist, we might not know which one to reduce if this method is called
            // But we should probably keep decreasing total availability for legacy support
            int currentStock = product.getAvailability();
            product.setAvailability(Math.max(0, currentStock - quantity));
            
            productRepository.save(product);
        });
    }

    @Override
    public void reduceVariantStock(Long productId, String color, String size, int quantity) {
        variantRepository.findByProductIdAndColorAndSize(productId, color, size).ifPresent(variant -> {
            variant.setStock(Math.max(0, variant.getStock() - quantity));
            variantRepository.save(variant);
            
            // Cập nhật lại tổng tồn kho và lượt bán của sản phẩm mẹ
            productRepository.findById(productId).ifPresent(product -> {
                product.setSalesCount(product.getSalesCount() + quantity);
                // JPA lifecycle hook (PreUpdate) sẽ tự động đồng bộ lại trường availability
                productRepository.save(product);
            });
            
            System.out.println("Reduced stock for Variant: Product " + productId + " [" + color + "/" + size + "] by " + quantity);
        });
    }
}
