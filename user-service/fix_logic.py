import os

def fix_backend():
    path = r'D:\e-commerce-microservices-master\user-service\src\main\java\com\rainbowforest\userservice\service\UserServiceImpl.java'
    if not os.path.exists(path):
        print(f"Not found: {path}")
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Add import
    if "import com.rainbowforest.userservice.entity.UserDetails;" not in "".join(lines):
        for i, line in enumerate(lines):
            if line.startswith("import com.rainbowforest.userservice.entity.UserRole;"):
                lines.insert(i + 1, "import com.rainbowforest.userservice.entity.UserDetails;\n")
                break
                
    content = "".join(lines)
    # Fix the bilingual logic (already tried with powershell but let's make it clean)
    content = content.replace("details.setUser(existingUser);", "") # clean up previous attempt if any
    content = content.replace("existingUser.setUserDetails(details);", "existingUser.setUserDetails(details);\n                    details.setUser(existingUser);")
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed Backend")

def fix_frontend():
    path = r'D:\e-commerce-microservices-master\admin-dashboard\src\App.tsx'
    if not os.path.exists(path):
        print(f"Not found: {path}")
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix localStorage key
    old_str = "localStorage.setItem('currentUser', JSON.stringify(updatedUser));"
    new_str = "localStorage.setItem('user', JSON.stringify(updatedUser));"
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed Frontend")
    else:
        print("Frontend already fixed or string not found")

if __name__ == "__main__":
    fix_backend()
    fix_frontend()
