class LibraryApp {
    constructor() {
        this.currentUser = null;
        this.initRouter(); // Initialize the routing system when the object is created
        this.initEventListeners();
    }

    // Function to initialize the routing system. It listens for changes in the URL hash and calls the appropriate functions for each route.
    initRouter() {
        const routes = {
            '/login': this.renderLoginPage.bind(this),
            '/register': this.renderRegisterPage.bind(this),
            '/books': this.renderBooksPage.bind(this),
            '/add-book': this.renderAddBookPage.bind(this)
        };

        // Adding event listeners for hash changes and page load
        window.addEventListener('hashchange', () => this.handleRouting(routes));
        window.addEventListener('load', () => this.handleRouting(routes));
    }

    // Function to handle routing based on the current URL hash and render the appropriate page
    handleRouting(routes) {
        const path = window.location.hash.slice(1) || '/login'; // Get the current hash from the URL, default to '/login'
        const renderFunction = routes[path]; // Choose the render function based on the route

        if (renderFunction) {
            document.getElementById('router-view').innerHTML = '';  // Clear the current content
            renderFunction();  // Call the render function for the current route
        } else {
            console.error(`Route not found: ${path}`);  // Log an error if the route is not found
        }
    }

    // Function to render the login page
    renderLoginPage() {
        const template = document.getElementById('login-template');
        if (template) {
            document.getElementById('router-view').innerHTML = template.innerHTML;
            document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
            document.getElementById('register-link')?.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = '/register'; // Navigate to the register page
            });
        }
    }

    // Function to render the register page
    renderRegisterPage() {
        const template = document.getElementById('register-template');
        if (template) {
            document.getElementById('router-view').innerHTML = template.innerHTML;
            document.getElementById('register-form')?.addEventListener('submit', (e) => this.handleRegister(e));
            document.getElementById('login-link')?.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = '/login'; // Navigate to the login page
            });
        }
    }

    // Function to render the books page
    renderBooksPage() {
        const template = document.getElementById('books-template');
        if (template) {
            document.getElementById('router-view').innerHTML = template.innerHTML;
            this.loadBooks();  // Load the books when rendering the books page
            document.getElementById('search-books').addEventListener('input', (e) => {
                this.loadBooks(e.target.value);
            });
            document.getElementById('add-book-btn')?.addEventListener('click', () => {
                window.location.hash = '/add-book'; // Navigate to the add-book page
            });
            document.addEventListener('click', (e) => {
                if (e.target.matches('.delete-btn')) {
                    e.preventDefault();
                    const bookId = e.target.getAttribute('data-book-id');
                    this.deleteBook(bookId);
                }
            });
            
        }
    }

    // Function to render the add-book page
    renderAddBookPage() {
        const template = document.getElementById('add-book-template');
        if (template) {
            document.getElementById('router-view').innerHTML = template.innerHTML;
            document.getElementById('add-book-form')?.addEventListener('submit', (e) => this.handleAddBook(e));
        }
    }

    // Function to handle login logic
    async handleLogin(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const request = new FXMLHttpRequest();
        request.open("GET", "");
        request.onload = (users) => {
            var user = users.find((user) => user.userName === username);
            if (user) {
                if (user.password === password) {
                    window.location.hash = '/books'; // Navigate to books page on successful login
                } else {
                    alert("The password is incorrect.");
                }
            } else {
                alert("The user does not exist.");
            }
        };
        request.send("users");
    }

    // Function to handle registration logic
    async handleRegister(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const id = document.getElementById('id').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;

        const newUser = { userName: username, password: password, email: email, id: id };
        const request = new FXMLHttpRequest();
        request.open("POST", "");
        request.onload = (user) => {
            if (user) {
                alert("Registration successful!");
                this.currentUser = user;
                window.location.hash = '/books'; // Navigate to books page after successful registration
            } else {
                alert("The user already exists.");
            }
        };
        request.send(newUser);
    }

    async loadBooks(searchTerm = '') {
        const request = new FXMLHttpRequest();
        request.open("GET", "/books", "BooksServer");
        request.onerror = (error) => {
            document.getElementById('books-list').innerHTML = `<tr><td colspan="8">Error: ${error.error}</td></tr>`;
        };
        request.onload = (books) => {
            const booksList = document.getElementById('books-list');
            if (!books || books.length === 0) {
                booksList.innerHTML = `<tr><td colspan="8" style="text-align: center;">אין ספרים להצגה</td></tr>`;
                return;
            }
            
            const filteredBooks = books.filter(book => book.title.includes(searchTerm));
            
            booksList.innerHTML = filteredBooks.map(book => `
                <tr>
                    <td><img src="${book.image}" alt="${book.title} Image" /></td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.year}</td>
                    <td>${book.id}</td>
                    <td>${book.category}</td>
                    <td>${book.shelf}</td>
                    <td>${book.status}</td>
                    <td>
                        <button class="edit-btn" onclick="editBook('${book.id}')"> ערוך</button>
                        <button class="delete-btn" data-book-id="${book.id}"> מחק</button>
                    </td>
                </tr>
            `).join('');
        };
        request.send();
    }

    async getBook(bookId) {
        const request = new FXMLHttpRequest();
        request.open("GET", `/books/${bookId}`, "BooksServer"); // With ID for specific book
        request.onerror = (error) => {
            alert(`Error loading book: ${error.error}`);
        };
        request.onload = (book) => {
            // Handle single book data
        };
        request.send();
    }

    async handleAddBook(event) {
        event.preventDefault();
        
        const bookData = {
            title: document.getElementById('book-title').value,
            author: document.getElementById('book-author').value,
            shelf: document.getElementById('book-shelf').value,
            year: document.getElementById('book-year').value,
            category: document.getElementById('book-category').value,
            image: document.getElementById('book-image').value,
            status: document.getElementById('book-status').value
        };

        const request = new FXMLHttpRequest();
        request.open("POST", "/books", "BooksServer"); // No ID for creating new book
        request.onerror = (error) => {
            alert(error.error || "There was an error adding the book.");
        };
        request.onload = (book) => {
            alert(`The book ${book.title} has been successfully added!`);
            window.location.hash = '/books';
        };
        request.send(bookData);
    }

    async updateBook(bookId, bookData) {
        const request = new FXMLHttpRequest();
        request.open("PUT", `/books/${bookId}`, "BooksServer"); // With ID for updating
        request.onerror = (error) => {
            alert(error.error || "There was an error updating the book.");
        };
        request.onload = (book) => {
            alert("The book has been successfully updated!");
            window.location.hash = '/books';
        };
        request.send(bookData);
    }

    async deleteBook(bookId) {
        console.log(bookId);
        const request = new FXMLHttpRequest();
        request.open("DELETE", `/books/${bookId}`, "BooksServer"); // With ID for deleting
        request.onerror = (error) => {
            alert(error.error || "There was an error deleting the book.");
        };
        request.onload = () => {
            alert("The book has been successfully deleted!");
            this.loadBooks(); // Refresh the book list
        };
        request.send();
    }
    

}

// Create an instance of LibraryApp
new LibraryApp();

