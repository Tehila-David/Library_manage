class LibraryApp {
    constructor() {
        this.currentUser = null;
        this.initRouter(); // Initialize the routing system when the object is created
    }

    // ============= ROUTING FUNCTIONS =============

    // Function to initialize the routing system. It listens for changes in the URL hash and calls the appropriate functions for each route.
    initRouter() {
        const routes = {
            '/login': this.renderLoginPage.bind(this),
            '/register': this.renderRegisterPage.bind(this),
            '/books': this.renderBooksPage.bind(this),
            '/add-book': this.renderAddBookPage.bind(this),
            '/edit-book/:id': (params) => this.renderEditBookPage(params),
            '/my-actions': this.renderMyActionsPage.bind(this)
        };

        // Adding event listeners for hash changes and page load
        window.addEventListener('hashchange', () => this.handleRouting(routes));
        window.addEventListener('load', () => this.handleRouting(routes));
    }

    // Function to handle routing based on the current URL hash and render the appropriate page
    handleRouting(routes) {
        const path = window.location.hash.slice(1) || '/login';
        console.log(path);

        // Check for static routes
        if (routes[path]) {
            document.getElementById('router-view').innerHTML = '';
            routes[path]();
            return;
        }

        // Check for dynamic routes
        const pathParts = path.split('/');

        for (const route in routes) {
            const routeParts = route.split('/');

            // If the number of parts in the path is different, it's not a match
            if (routeParts.length !== pathParts.length) continue;

            let match = true;
            const params = {};

            for (let i = 0; i < routeParts.length; i++) {
                // If it's a dynamic part (starts with :)
                if (routeParts[i].startsWith(':')) {
                    const paramName = routeParts[i].substring(1);
                    params[paramName] = pathParts[i];
                }
                // If it's a static part and values don't match
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

        // No matching route found
        console.error(`Route not found: ${path}`);
    }

    // ============= PAGE RENDERING FUNCTIONS =============

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

        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log("this.currentUser: " + this.currentUser.userName);

        if (template) {
            document.getElementById('router-view').innerHTML = template.innerHTML;

            // Add footer
            const footerTemplate = document.getElementById('footer-template');
            if (footerTemplate) {
                document.getElementById('footer-placeholder').innerHTML = footerTemplate.innerHTML;
            }

            this.loadBooks();  // Load the books when rendering the books page
            document.getElementById('search-books').addEventListener("input", () => {
                this.filterBooksBySearch();
            });

            // Only clicking the filter button will trigger the filtering action
            document.getElementById('filter-btn').addEventListener("click", () => {
                this.filterBooks();
            });

            if (this.currentUser && this.currentUser.userName) {
                document.getElementById('username-display').textContent = this.currentUser.userName;
            }

            document.getElementById('add-book-btn')?.addEventListener('click', () => {
                window.location.hash = '/add-book'; // Navigate to the add-book page
            });

            document.addEventListener('click', (e) => {
                if (e.target.matches('.delete-btn')) {
                    e.preventDefault();
                    const bookId = e.target.getAttribute('data-book-id');

                    // Add confirmation before deletion
                    if (confirm('האם אתה בטוח שברצונך למחוק ספר זה?')) {
                        this.deleteBook(bookId);
                    }
                }
            });

            document.addEventListener('click', (e) => {
                if (e.target.matches('.edit-btn')) {
                    e.preventDefault();
                    const bookId = e.target.getAttribute('data-book-id');
                    window.location.hash = `/edit-book/${bookId}`;
                }
            });

            this.setupTopBarListeners();
        }
    }

    // Function to render the add-book page
    renderAddBookPage() {
        const template = document.getElementById('add-book-template');
        if (template) {
            document.getElementById('router-view').innerHTML = template.innerHTML;
            document.getElementById('add-book-form')?.addEventListener('submit', (e) => {
                this.handleAddBook(e);
                window.location.hash = '/books';
            });
            document.querySelector('.btn-cancel')?.addEventListener('click', () => {
                window.location.hash = '/books'; // Return to books page
            });
        }
    }

    // Function to render the edit book page
    renderEditBookPage(params) {
        const bookId = params.id;
        console.log(`עריכת ספר עם מזהה: ${bookId}`);
        const template = document.getElementById('edit-book-template');
        if (template) {
            document.getElementById('router-view').innerHTML = template.innerHTML;

            // Load existing book details and fill the form
            this.loadBookForEdit(bookId);

            // Add event listeners
            document.getElementById('edit-book-form')?.addEventListener('submit', (e) => {
                this.handleEditBook(e);
                window.location.hash = '/books'; // Return to books page
            });

            document.querySelector('.btn-cancel')?.addEventListener('click', () => {
                window.location.hash = '/books'; // Return to books page
            });
        }
    }

    // Function to render my actions page
    renderMyActionsPage() {
        const template = document.getElementById('my-actions-template');
        if (template) {
            document.getElementById('router-view').innerHTML = template.innerHTML;

            // Use template content directly
            const booksTemplateContent = document.getElementById('books-template').content;
            const topBarNode = booksTemplateContent.querySelector('.top-bar').cloneNode(true);

            // Replace placeholder element with top bar
            const topBarPlaceholder = document.getElementById('topbar-placeholder');
            if (topBarPlaceholder) {
                topBarPlaceholder.parentNode.replaceChild(topBarNode, topBarPlaceholder);

                // Find links in the added bar and update active state
                const links = document.querySelectorAll('.nav-link');
                links.forEach(link => {
                    link.classList.remove('active');
                });
                document.getElementById('my-actions-link')?.classList.add('active');

                // Update username if available
                if (this.currentUser && this.currentUser.userName) {
                    document.getElementById('username-display').textContent = this.currentUser.userName;
                }
            }

            // Add footer
            const footerTemplate = document.getElementById('footer-template');
            if (footerTemplate) {
                document.getElementById('footer-placeholder').innerHTML = footerTemplate.innerHTML;
            }

            // Setup top bar event listeners
            this.setupTopBarListeners();

            // Setup action filters
            this.setupActionFilters();
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

            // Load action history
            this.displayActions(this.currentUser.actionsHistory);
        }
    }

    // Function to setup top bar event listeners
    setupTopBarListeners() {
        // Books link
        document.getElementById('books-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '/books';
        });

        // My actions link
        document.getElementById('my-actions-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '/my-actions';
        });

        // Logout button
        document.querySelector('.btn-logout')?.addEventListener('click', () => {
            // Record logout action
            // if (this.currentUser) {
            //     this.recordAction('logout', `התנתקות מהמערכת`, null,
            //         `משתמש ${this.currentUser.userName} התנתק מהמערכת`);
            // }

            this.currentUser = null;
            window.location.hash = '/login';
        });
    }

    // ============= AUTHENTICATION FUNCTIONS =============

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
                    localStorage.setItem('currentUser', JSON.stringify(user));
                } else {
                    this.showAlert("סיסמה שגויה",'danger');
                }
            } else {
                this.showAlert("שם המשתמש אינו קיים במערכת",'danger');
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
        const newUser = { userName: username, password: password, email: email, id: id, actionsHistory: [] };
        const request = new FXMLHttpRequest();
        request.open("POST", "");
        request.onload = (user) => {
            this.hideLoading();
            if (user) {
                this.showAlert("נרשמת בהצלחה!",'success');
                window.location.hash = '/books'; // Navigate to books page after successful registration
                localStorage.setItem('currentUser', JSON.stringify(user));
            } else {
                this.showAlert("קיים משתמש עם שם זהה, אנא בחר שם משתמש אחר",'warning');
            }
        };
        this.showLoading();
        request.send(newUser);
    }

    // ============= BOOK MANAGEMENT FUNCTIONS =============

    // Function to load books
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
            this.books = books; // save the books in the global variable
            this.displayBooks(this.books);
        };
        this.showLoading();
        request.send();
    }

    // Function to get a specific book
    async getBook(bookId) {
        const request = new FXMLHttpRequest();
        request.open("GET", `/books/${bookId}`, "BooksServer"); // With ID for specific book
        request.onerror = (error) => {
            this.hideLoading();
            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                this.showAlert(`כישלון בטעינת הספר: ${error.error}`,'danger');
            }, 30);
        };
        request.onload = (book) => {
            this.hideLoading();
        };
        this.showLoading();
        request.send();
    }

    // Function to get book by ID (promise-based)
    async getBookById(bookId) {
        return new Promise((resolve, reject) => {
            const request = new FXMLHttpRequest();
            request.open("GET", `/books/${bookId}`, "BooksServer");
            request.onerror = (error) => {
                reject(error);
            };
            request.onload = (book) => {
                resolve(book);
            };
            request.send();
        });
    }

    // Function to handle adding a book
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
                this.showAlert(error.error || "אופס. קרתה תקלה כלשהי בזמן הוספת הספר, נסה שוב",'danger');
            }, 30);
        };
        request.onload = (book) => {
            this.hideLoading();
            // Create new action

            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                this.showAlert(`הספר "${book.title}" נוסף בהצלחה למערכת!`,'success');
                window.location.hash = '/books?refresh=' + new Date().getTime();
            }, 30);
            const actionId = this.getNextActionId(); // Function that returns a running ID
            const newAction = {
                id: actionId,
                type: 'POST',
                bookId: book.id,
                title: `הוספת ספר: "${bookData.title}"`,
                timestamp: new Date(),
                author: bookData.author
            };

            // Add the action to the user's action array
            this.AddAction(newAction);
        };
        this.showLoading();
        request.send(bookData);
    }

    // Function to update a book
    async updateBook(bookId, bookData) {
        const request = new FXMLHttpRequest();
        request.open("PUT", `/books/${bookId}`, "BooksServer"); // With ID for updating
        request.onerror = (error) => {
            this.hideLoading();
            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                this.showAlert(error.error || "אופס. קרתה תקלה כלשהי בזמן עדכון הספר. נסה שוב",'danger');
            }, 30);
        };
        request.onload = (book) => {
            this.hideLoading();

            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                this.showAlert(`פרטי הספר "${bookData.title}" עודכנו בהצלחה!`,'success');
                window.location.hash = '/books';
            }, 30);

            // Create new action for book update
            const actionId = this.getNextActionId(); // Function that returns a running ID
            const newAction = {
                id: actionId,
                type: 'PUT',
                bookId: book.id,
                title: `עדכון ספר: "${bookData.title}"`,
                timestamp: new Date(),
                author: book.author
            };

            // Add the action to the user's action array
            this.AddAction(newAction);

           
        };
        this.showLoading();
        console.log("Sending book data:", JSON.stringify(bookData));
        request.send(bookData);
    }

    // Function to delete a book
    async deleteBook(bookId) {
        console.log(bookId);

        // Get book details before deletion so we can save them in the action
        let bookDetails = null;
        try {
            // Attempt to get book details before deletion
            bookDetails = await this.getBookById(bookId);
        } catch (error) {
            console.error("Error fetching book details before deletion:", error);
        }

        const request = new FXMLHttpRequest();
        request.open("DELETE", `/books/${bookId}`, "BooksServer"); // With ID for deleting
        request.onerror = (error) => {
            this.hideLoading();
            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                this.showAlert(error.error || "אופס. קרתה תקלה כלשהי בזמן מחיקת הספר. נסה שוב",'danger');
            }, 30);
        };
        request.onload = () => {
            this.hideLoading();

            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                this.showAlert(`הספר  "${bookDetails.title}" נמחק בהצלחה!`,'success');
                this.loadBooks(); // Refresh the book list
            }, 30);

            // Create new action for book deletion
            if (bookDetails) {
                const actionId = this.getNextActionId(); // Function that returns a running ID
                const newAction = {
                    id: actionId,
                    type: 'DELETE',
                    bookId: bookId,
                    title: `מחיקת ספר: "${bookDetails.title}"`,
                    timestamp: new Date(),
                    author: bookDetails.author
                };

                // Add the action to the user's action array
                this.AddAction(newAction);
            }

            
        };
        this.showLoading();
        request.send();
    }

    // Function to load book data for editing
    async loadBookForEdit(bookId) {
        const request = new FXMLHttpRequest();
        request.open("GET", `/edit-book/${bookId}`, "BooksServer");
        request.onerror = (error) => {
            this.hideLoading();
            setTimeout(() => {
                this.showAlert(`שגיאה בטעינת פרטי הספר: ${error.error}`,'danger');
                window.location.hash = '/books';
            }, 10000);
        };
        request.onload = (book) => {
            this.hideLoading();
            if (book) {
                // Fill the form with book details
                document.getElementById('edit-book-id').value = book.id;
                document.getElementById('edit-book-title').value = book.title;
                document.getElementById('edit-book-author').value = book.author;
                document.getElementById('edit-book-category').value = book.category;
                document.getElementById('edit-book-shelf').value = book.shelf;
                document.getElementById('edit-book-year').value = book.year;
                document.getElementById('edit-book-image').value = book.image;
                document.getElementById('edit-book-status').value = book.status;
            } else {
                this.showAlert("הספר לא נמצא.",'warning');
                window.location.hash = '/books';
            }
        };
        this.showLoading();
        request.send();
    }

    // Function to handle edit book form submission
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

    // Function to display books in the DOM
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

    // Function to display empty books state
    displayEmptyBooksState() {
        const booksList = document.getElementById('books-list');
        booksList.innerHTML = `
    <tr>
        <td colspan="9" class="empty-state">
            <div class="empty-state-icon"><i class="fas fa-books"></i></div>
            <div class="empty-state-title">אין ספרים להצגה</div>
            <div class="empty-state-desc">לחץ על 'הוסף ספר חדש' כדי להתחיל לנהל את מלאי הספרייה</div>
        </td>
    </tr>`;
    }

    // ============= FILTERING FUNCTIONS BOOKS =============

    // Function to filter books by search term only
    filterBooksBySearch() {
        const searchTerm = document.querySelector("#search-books")?.value.trim().toLowerCase() || "";

        const filteredBooks = this.books.filter(book => {
            const matchesSearch = searchTerm === "" ||
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm);

            return matchesSearch;
        });

        this.displayBooks(filteredBooks);
    }

    // Function to filter books by all criteria
    filterBooks() {
        const searchTerm = document.querySelector("#search-books")?.value.trim().toLowerCase() || "";
        // Fix: Missing # before element IDs and need to use querySelector instead of querySelectorAll
        const shelfFilter = document.querySelector("#shelf-filter")?.value || ""; // Shelf location
        const statusFilter = document.querySelector("#status-filter")?.value || ""; // Status

        console.log("shelfFilter: " + shelfFilter);
        console.log("statusFilter: " + statusFilter);

        const filteredBooks = this.books.filter(book => {
            const matchesSearch = searchTerm === "" ||
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm);
            const matchesShelf = shelfFilter === "" || book.shelf === shelfFilter;
            const matchesStatus = statusFilter === "" || book.status === statusFilter;

            return matchesSearch && matchesShelf && matchesStatus;
        });

        this.displayBooks(filteredBooks);
    }

    // ============= ACTION MANAGEMENT FUNCTIONS =============

    // Function to add an action to the user's history
    // פתרון מעודכן לפונקציית AddAction
    AddAction(action) {
        // וודא שה-currentUser הוא אובייקט תקין לפני התחלת פעולה
        if (!this.currentUser || typeof this.currentUser !== 'object') {
            console.error("currentUser is not a valid object:", this.currentUser);
            // אפשר לנסות לטעון מחדש מ-localStorage
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

            // אם עדיין לא תקין, לא נוכל להמשיך
            if (!this.currentUser || typeof this.currentUser !== 'object') {
                console.error("Failed to retrieve valid user from localStorage");
                return null;
            }
        }

        // וודא שיש מערך actionsHistory
        if (!this.currentUser.actionsHistory) {
            this.currentUser.actionsHistory = [];
        }

        console.log("Adding action:", action.title);
        console.log("Current user:", this.currentUser.userName);

        // הוסף את הפעולה למערך של המשתמש
        this.currentUser.actionsHistory.push(action);

        // שמור את המשתמש המעודכן ב-localStorage
        try {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } catch (e) {
            console.error("Error saving to localStorage:", e);
        }

        // שמור את המשתמש המעודכן בשרת באמצעות PUT
        const request = new FXMLHttpRequest();
        request.open("PUT", `/users/${this.currentUser.id}`, 'AuthServer');

        request.onerror = (error) => {
            this.hideLoading();
            console.error("Error adding action to user history:", error);
            return null;
        };

        request.onload = (updatedUser) => {
            this.hideLoading();
            console.log("Action added successfully to user history");
            // חשוב לשמור את כל האובייקט המעודכן ולא רק חלק ממנו
            if (updatedUser && typeof updatedUser === 'object') {
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }
        };

        this.showLoading();
        console.log("Sending user object:", JSON.stringify(this.currentUser));
        request.send(this.currentUser);
    };
    // Function to get the next available action ID
    getNextActionId() {
        if (!this.currentUser || !this.currentUser.actionsHistory) {
            return 1;
        }

        // Find the highest existing ID and add 1
        const maxId = Math.max(0, ...this.currentUser.actionsHistory.map(action => action.id || 0));
        return maxId + 1;
    }

    // Function to set up action filters
    setupActionFilters() {
        const typeFilter = document.getElementById('action-type-filter');
        const dateFromFilter = document.getElementById('date-from-filter');
        const dateToFilter = document.getElementById('date-to-filter');
        const filterBtn = document.getElementById('filter-actions-btn');

        // Check that all elements exist
        if (!typeFilter || !dateFromFilter || !dateToFilter || !filterBtn) {
            console.error("Missing filter elements in the DOM");
            return;
        }

        // Set default dates (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        // Format dates for input type="date"
        dateToFilter.valueAsDate = today;
        dateFromFilter.valueAsDate = thirtyDaysAgo;

        // Add event listener to filter button
        filterBtn.addEventListener('click', () => {
            this.filterActions();
        });

        console.log("Action filters setup completed");
    }

    // Function to filter actions
    filterActions() {
        // Get filter values
        const typeFilter = document.getElementById('action-type-filter').value;
        const dateFromFilter = document.getElementById('date-from-filter').valueAsDate;
        const dateToFilter = document.getElementById('date-to-filter').valueAsDate;

        console.log("Filtering actions:");
        console.log("Type:", typeFilter);
        console.log("From:", dateFromFilter);
        console.log("To:", dateToFilter);

        // If dateToFilter is at midnight, update it to end of day
        if (dateToFilter) {
            dateToFilter.setHours(23, 59, 59, 999);
        }

        // Get all actions from current user
        const allActions = this.currentUser.actionsHistory || [];
        console.log("Total actions before filtering:", allActions.length);

        // Filter actions by criteria
        const filteredActions = allActions.filter(action => {
            const actionDate = new Date(action.timestamp);

            // Filter by action type - match to select values
            if (typeFilter) {
                // Convert from select values to action type values in the data
                let actionType;
                if (typeFilter === 'add') actionType = 'POST';
                else if (typeFilter === 'edit') actionType = 'PUT';
                else if (typeFilter === 'delete') actionType = 'DELETE';

                if (actionType && action.type !== actionType) {
                    return false;
                }
            }

            // Filter by start date
            if (dateFromFilter && actionDate < dateFromFilter) {
                return false;
            }

            // Filter by end date
            if (dateToFilter && actionDate > dateToFilter) {
                return false;
            }

            return true;
        });

        console.log("Filtered actions:", filteredActions.length);

        // Display filtered actions
        this.displayActions(filteredActions);
    }

    // Function to display actions sorted by date (latest first)
    displayActions(actions) {
        const actionsList = document.getElementById('actions-list');

        // Internal function to format date and time
        const formatDate = (timestamp) => {
            const date = new Date(timestamp);

            // Date format: DD/MM/YYYY
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const dateStr = `${day}/${month}/${year}`;

            // Time format: HH:MM
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const timeStr = `${hours}:${minutes}`;

            return {
                date: dateStr,
                time: timeStr
            };
        };

        // Clear the list
        actionsList.innerHTML = '';

        // Check if history is empty
        if (!actions || actions.length === 0) {
            actionsList.innerHTML = `
<div class="no-actions-message">
    <i class="fas fa-history" style="font-size: 24px; margin-bottom: 10px;"></i>
    <p>אין פעולות קודמות להצגה</p>
</div>`;

            // Reset statistics if no actions
            document.getElementById('added-count').textContent = '0';
            document.getElementById('edited-count').textContent = '0';
            document.getElementById('deleted-count').textContent = '0';

            return;
        }

        // Sort actions by timestamp (latest first)
        const sortedActions = [...actions].sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA; // Descending order (newest first)
        });

        // Get action card template
        const actionCardTemplate = document.getElementById('action-card-template').content;

        // Create fragment for better performance
        const fragment = document.createDocumentFragment();

        // Initialize counters for statistics
        let addedCount = 0;
        let editedCount = 0;
        let deletedCount = 0;

        // Add each action to the list
        sortedActions.forEach((action, index) => {
            // Update statistics by action type
            if (action.type === 'POST') {
                addedCount++;
            } else if (action.type === 'PUT') {
                editedCount++;
            } else if (action.type === 'DELETE') {
                deletedCount++;
            }

            // Clone the template
            const actionCard = actionCardTemplate.cloneNode(true);

            // Set action type attribute for styling
            const actionCardElement = actionCard.querySelector('.action-card');
            actionCardElement.setAttribute('data-type', action.type);
            actionCardElement.setAttribute('data-id', action.id);

            // Set action icon
            const iconElement = actionCard.querySelector('.action-icon i');
            if (action.type === 'POST') {
                iconElement.className = 'fas fa-plus';
            } else if (action.type === 'PUT') {
                iconElement.className = 'fas fa-edit';
            } else if (action.type === 'DELETE') {
                iconElement.className = 'fas fa-trash';
            }

            // Set action title
            actionCard.querySelector('.action-title').textContent = action.title;

            // Format date and time
            const formattedDate = formatDate(action.timestamp);
            actionCard.querySelector('.action-date').innerHTML =
                `<i class="far fa-calendar"></i> ${formattedDate.date}`;
            actionCard.querySelector('.action-time').innerHTML =
                `<i class="far fa-clock"></i> ${formattedDate.time}`;

            // Add author name
            const authorElement = actionCard.querySelector('.action-author');
            if (authorElement && action.author) {
                authorElement.innerHTML = `<i class="fas fa-user-edit"></i> ${action.author}`;
            } else if (authorElement) {
                authorElement.style.display = 'none'; // Hide if no author
            }

            // Add delay for animation effect
            actionCardElement.style.animationDelay = `${index * 0.1}s`;
            actionCardElement.classList.add('fade-in');

            // Add the action card to the fragment
            fragment.appendChild(actionCard);
        });

        // Add the fragment to the DOM
        actionsList.appendChild(fragment);

        // Adjust display for RTL (right to left)
        actionsList.style.direction = 'rtl';

        // Update statistics in the UI
        document.getElementById('added-count').textContent = addedCount;
        document.getElementById('edited-count').textContent = editedCount;
        document.getElementById('deleted-count').textContent = deletedCount;

        // Add animation to statistics when updating
        const statCounters = document.querySelectorAll('.stat-content span');
        statCounters.forEach(counter => {
            counter.classList.add('count-updated');
            // Remove animation after it finishes
            setTimeout(() => {
                counter.classList.remove('count-updated');
            }, 1000);
        });
    }

    // ============= UI UTILITY FUNCTIONS =============

    // Function to show loading indicator
    showLoading() {
        document.getElementById("loading").style.display = "block";
    }

    // Function to hide loading indicator
    hideLoading() {
        document.getElementById("loading").style.display = "none";
    }

// Function to show alerts to the user
    showAlert(message, type = 'info') {
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} fade-in`;

        // Choose appropriate icon for alert type
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        if (type === 'danger') icon = 'times-circle';

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.className = 'alert-close';
        closeButton.onclick = () => alertElement.remove();

        // Set inner HTML
        alertElement.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        alertElement.appendChild(closeButton);

        // Add to DOM
        document.body.appendChild(alertElement);

        // Remove after timeout if not closed manually
        const timeout = setTimeout(() => {
            alertElement.style.opacity = '0';
            setTimeout(() => alertElement.remove(), 300);
        }, 6000);

        // Prevent removal if closed manually
        closeButton.addEventListener('click', () => clearTimeout(timeout));
    }

}

// Create an instance of LibraryApp
new LibraryApp();