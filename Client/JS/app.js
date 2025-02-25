class LibraryApp {
    constructor() {
        this.currentUser = null;
        this.books=[];
        this.initRouter(); // Initialize the routing system when the object is created
    }

    // Function to initialize the routing system. It listens for changes in the URL hash and calls the appropriate functions for each route.
    initRouter() {
        const routes = {
            '/login': this.renderLoginPage.bind(this),
            '/register': this.renderRegisterPage.bind(this),
            '/books': this.renderBooksPage.bind(this),
            '/add-book': this.renderAddBookPage.bind(this),
            '/edit-book/:id':(params) => this.renderEditBookPage(params)

        };

        // Adding event listeners for hash changes and page load
        window.addEventListener('hashchange', () => this.handleRouting(routes));
        window.addEventListener('load', () => this.handleRouting(routes));
    }

    // Function to handle routing based on the current URL hash and render the appropriate page
    handleRouting(routes) {
        const path = window.location.hash.slice(1) || '/login';
        console.log(path);
        
        // בדיקה עבור נתיבים קבועים
        if (routes[path]) {
            document.getElementById('router-view').innerHTML = '';
            routes[path]();
            return;
        }
        
        // בדיקה עבור נתיבים דינמיים
        const pathParts = path.split('/');
        
        for (const route in routes) {
            const routeParts = route.split('/');
            
            // אם מספר החלקים בנתיב שונה, זה לא התאמה
            if (routeParts.length !== pathParts.length) continue;
            
            let match = true;
            const params = {};
            
            for (let i = 0; i < routeParts.length; i++) {
                // אם זה חלק דינמי (מתחיל עם :)
                if (routeParts[i].startsWith(':')) {
                    const paramName = routeParts[i].substring(1);
                    params[paramName] = pathParts[i];
                } 
                // אם זה חלק סטטי וערכים לא תואמים
                else if (routeParts[i] !== pathParts[i]) {
                    match = false;
                    break;
                }
            }
            
            if (match) {
                document.getElementById('router-view').innerHTML = '';
                routes[route](params);
                return;
            }
        }
        
        // לא נמצא נתיב מתאים
        console.error(`Route not found: ${path}`);
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

            document.getElementById('search-books').addEventListener('input', () => {
                this.filterBooks();
            });

            document.querySelectorAll(".filter-select").forEach(select => {
                select.addEventListener("change", () => {
                    this.filterBooks(); // filter by combo box
                });
            });

            document.getElementById('filter-btn').addEventListener("click", () => {
                this.filterBooks();
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
            document.addEventListener('click', (e) => {
                if (e.target.matches('.edit-btn')) {
                    e.preventDefault();
                    const bookId = e.target.getAttribute('data-book-id');
                    console.log("hii edit");
                    window.location.hash = `/edit-book/${bookId}`;
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
            this.hideLoading();
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
        this.showLoading();
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
            this.hideLoading();
            if (user) {
                alert("Registration successful!");
                this.currentUser = user;
                window.location.hash = '/books'; // Navigate to books page after successful registration
            } else {
                alert("The user already exists.");
            }
        };
        this.showLoading();
        request.send(newUser);
    }

    filterBooks() {
        const searchTerm = document.querySelector("#search-books")?.value.trim().toLowerCase() || "";
        const shelfFilter = document.querySelectorAll(".filter-select")[0].value; // shelf
        const statusFilter = document.querySelectorAll(".filter-select")[1].value; // status
        console.log(shelfFilter);
        console.log(statusFilter);
    
        const filteredBooks = this.books.filter(book => {
            console.log(book.shelf);
            const matchesSearch = searchTerm === "" || book.title.toLowerCase().includes(searchTerm) || book.author.toLowerCase().includes(searchTerm);
            const matchesShelf = shelfFilter === "" || book.shelf === shelfFilter;
            const matchesStatus = statusFilter === "" || book.status === statusFilter;
    
            return matchesSearch && matchesShelf && matchesStatus;
        });
    
        this.displayBooks(filteredBooks);
    }

    async loadBooks() {
        const request = new FXMLHttpRequest();
        request.open("GET", "/books", "BooksServer");
        request.onerror = (error) => {
            document.getElementById('books-list').innerHTML = `<tr><td colspan="8">Error: ${error.error}</td></tr>`;
        };
        request.onload = (books) => {
            this.hideLoading();
            if (!books || books.length === 0) {
                this.displayBooks([]);
                return;
            }
            this.books = books; // save the books in the global varible
            this.displayBooks(this.books);
        };
        this.showLoading();
        request.send();
    }

    

    async getBook(bookId) {
        const request = new FXMLHttpRequest();
        request.open("GET", `/books/${bookId}`, "BooksServer"); // With ID for specific book
        request.onerror = (error) => {
            this.hideLoading();
            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                alert(`Error loading book: ${error.error}`);
            }, 30);
        };
        request.onload = (book) => {
            this.hideLoading();
            // Handle single book data
        };
        this.showLoading();
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
            this.hideLoading();
            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                alert(error.error || "There was an error adding the book.");
            }, 30);
        };
        request.onload = (book) => {
            this.hideLoading();
            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                alert(`The book ${book.title} has been successfully added!`);
                window.location.hash = '/books';
            },30);
        };
        this.showLoading();
        request.send(bookData);
    }

    async updateBook(bookId, bookData) {
        const request = new FXMLHttpRequest();
        request.open("PUT", `/books/${bookId}`, "BooksServer"); // With ID for updating
        request.onerror = (error) => {
            this.hideLoading();
            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                alert(error.error || "There was an error updating the book.");
            }, 30);
        };
        request.onload = (book) => {
            this.hideLoading();
            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                alert("The book has been successfully updated!");
                window.location.hash = '/books';
            }, 30);
        };
        this.showLoading();
        request.send(bookData);
    }

    async deleteBook(bookId) {
        console.log(bookId);
        const request = new FXMLHttpRequest();
        request.open("DELETE", `/books/${bookId}`, "BooksServer"); // With ID for deleting
        request.onerror = (error) => {
            this.hideLoading();
            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                alert(error.error || "There was an error deleting the book.");
            }, 30);
        };
        request.onload = () => {
            this.hideLoading();
            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                alert("The book has been successfully deleted!");
                this.loadBooks(); // Refresh the book list
            }, 30);
        };
        this.showLoading();
        request.send();
    }
    renderEditBookPage(params) {
        const bookId = params.id;
        console.log(`עריכת ספר עם מזהה: ${bookId}`);
        const template = document.getElementById('edit-book-template');
        if (template) {
            document.getElementById('router-view').innerHTML = template.innerHTML;
            
            // מציאת מזהה הספר מהכתובת
            const url = window.location.hash;
            const bookId = url.split('/').pop();
            
            // טעינת פרטי הספר הקיים ומילוי הטופס
            this.loadBookForEdit(bookId);
            
            // הוספת מאזיני אירועים
            document.getElementById('edit-book-form')?.addEventListener('submit', (e) => this.handleEditBook(e));
            document.querySelector('.btn-cancel')?.addEventListener('click', () => {
                window.location.hash = '/books'; // חזרה לדף הספרים
            });
        }
    }
    
    // פונקציה להוספה
    async loadBookForEdit(bookId) {
        const request = new FXMLHttpRequest();
        request.open("GET", `/books/${bookId}`, "BooksServer");
        request.onerror = (error) => {
            this.hideLoading();
            setTimeout(() => {
                alert(`שגיאה בטעינת פרטי הספר: ${error.error}`);
                window.location.hash = '/books';
            }, 30);
        };
        request.onload = (book) => {
            this.hideLoading();
            if (book) {
                // מילוי הטופס בפרטי הספר
                document.getElementById('edit-book-id').value = book.id;
                document.getElementById('edit-book-title').value = book.title;
                document.getElementById('edit-book-author').value = book.author;
                document.getElementById('edit-book-category').value = book.category;
                document.getElementById('edit-book-shelf').value = book.shelf;
                document.getElementById('edit-book-year').value = book.year;
                document.getElementById('edit-book-image').value = book.image;
                document.getElementById('edit-book-status').value = book.status;
            } else {
                alert("הספר לא נמצא.");
                window.location.hash = '/books';
            }
        };
        this.showLoading();
        request.send();
    }
    
    // פונקציה להוספה
    async handleEditBook(event) {
        event.preventDefault();
        
        const bookId = document.getElementById('edit-book-id').value;
        const bookData = {
            title: document.getElementById('edit-book-title').value,
            author: document.getElementById('edit-book-author').value,
            shelf: document.getElementById('edit-book-shelf').value,
            year: document.getElementById('edit-book-year').value,
            category: document.getElementById('edit-book-category').value,
            image: document.getElementById('edit-book-image').value,
            status: document.getElementById('edit-book-status').value
        };
    
        await this.updateBook(bookId, bookData);
    }
    

    displayBooks(books) {    //just for display the books
        const booksList = document.getElementById('books-list');
    
        if (books.length === 0) {
            booksList.innerHTML = `<tr><td colspan="8" style="text-align: center;">אין ספרים להצגה</td></tr>`;
            return;
        }
    
        booksList.innerHTML = books.map(book => `
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
                    <button class="edit-btn" data-book-id="${book.id}"><i class="fa-regular fa-pen-to-square"></i></button>
                    <button class="delete-btn" data-book-id="${book.id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }


    showLoading() {
        document.getElementById("loading").style.display = "block";
    }
    
    hideLoading() {
        document.getElementById("loading").style.display = "none";
    }
    

}

// Create an instance of LibraryApp
new LibraryApp();

