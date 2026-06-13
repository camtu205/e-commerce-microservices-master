import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class TestWrite {
    public static void main(String[] args) {
        try {
            File dir = new File("./product-images/");
            if (!dir.exists()) dir.mkdirs();
            Files.write(Paths.get("./product-images/test.txt"), "test".getBytes());
            System.out.println("Write successful");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
