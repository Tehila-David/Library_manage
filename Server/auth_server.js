// auth-server.js - שרת אותנטיקציה
class AuthServer {
    static login(credentials) {
        const users = DB.getUsers();
        const user = users.find(u => 
            u.email === credentials.email && 
            u.password === credentials.password
        );
        
        if (user) {
            return { success: true, userId: user.id, message: 'Login successful' };
        }
        return { success: false, message: 'Invalid credentials' };
    }

    static register(userData) {
        const users = DB.getUsers();
        if (users.some(u => u.email === userData.email)) {
            return { success: false, message: 'Email already exists' };
        }

        const newUser = {
            id: Date.now().toString(),
            email: userData.email,
            password: userData.password,
            name: userData.name
        };

        users.push(newUser);
        DB.saveUsers(users);
        return { success: true, userId: newUser.id, message: 'Registration successful' };
    }
}
