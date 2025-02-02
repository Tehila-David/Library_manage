class AuthServer {
    constructor() {
        this.db = new UsersDB();
    }

    handleRequest(request) {
        switch (request.method) {
            case 'POST':
                if (request.url.endsWith('/login')) {
                    this.handleLogin(request);
                } else if (request.url.endsWith('/register')) {
                    this.handleRegister(request);
                } else {
                    this.sendResponse(request, 404, { message: 'Endpoint not found' });
                }
                break;
            default:
                this.sendResponse(request, 405, { message: 'Method not allowed' });
        }
    }

    async handleLogin(request) {
        try {
            const { username, password } = request.data;
            const user = this.db.findUser(username);
            if (user && user.password === password) {
                this.sendResponse(request, 200, { message: 'Login successful', user });
            } else {
                this.sendResponse(request, 401, { message: 'Invalid credentials' });
            }
        } catch (error) {
            this.sendResponse(request, 500, { message: error.message });
        }
    }

    async handleRegister(request) {
        try {
            const { username, password } = request.data;
            if (this.db.findUser(username)) {
                this.sendResponse(request, 400, { message: 'User already exists' });
                return;
            }
            this.db.add({ username, password });
            this.sendResponse(request, 201, { message: 'User registered successfully' });
        } catch (error) {
            this.sendResponse(request, 500, { message: error.message });
        }
    }

    sendResponse(request, status, data) {
        request.callback({
            status,
            data,
            timestamp: Date.now()
        });
    }
}
