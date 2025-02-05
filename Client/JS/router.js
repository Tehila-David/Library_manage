class Router {
    constructor() {
        this.routes = {
            '/login': this.renderLogin,
            '/register': this.renderRegister,
            '/books': this.renderBooks,
            '/add-book': this.renderAddBook
        };
        this.routerView = document.getElementById('router-view');
        this.initEventListeners();
    }

    initEventListeners() {
        window.addEventListener('hashchange', () => this.handleRouting());
        window.addEventListener('load', () => this.handleRouting());
    }

 
    handleRouting() {
        const path = window.location.hash.slice(1) || '/login';
        const template = document.getElementById(`${path.slice(1)}-template`);

        if (template) {
            this.routerView.innerHTML = '';
            const templateContent = template.content.cloneNode(true);
            this.routerView.appendChild(templateContent);
            
            if (this.routes[path]) {
                this.routes[path].call(this);
            }
        } else {
            console.error(`תבנית לא נמצאה עבור הנתיב: ${path}`);
        }
    }


    renderLogin() {
        const loginForm = document.getElementById('login-form');
        const registerLink = document.getElementById('register-link');

        if (loginForm) {
            loginForm.addEventListener('submit', LibraryApp.handleLogin);
        }
        if (registerLink) {
            registerLink.addEventListener('click', (event) => {
                event.preventDefault();
                window.location.hash = '/register';
            });
        }
    }

   
    renderRegister() {
        const registerForm = document.getElementById('register-form');
        const loginLink = document.getElementById('login-link');

        if (registerForm) {
            registerForm.addEventListener('submit', LibraryApp.handleRegister);
        }
        if (loginLink) {
            loginLink.addEventListener('click', (event) => {
                event.preventDefault();
                window.location.hash = '/login';
            });
        }
    }

    renderBooks() {
        LibraryApp.renderBooks();
        const addBookBtn = document.getElementById('add-book-btn');

        if (addBookBtn) {
            addBookBtn.addEventListener('click', () => {
                window.location.hash = '/add-book';
            });
        }
    }

    renderAddBook() {
        const addBookForm = document.getElementById('add-book-form');
        if (addBookForm) {
            addBookForm.addEventListener('submit', LibraryApp.handleAddBook);
        }
    }
}

const router = new Router();