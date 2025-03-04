class LibraryApp {
    constructor() {
        this.currentUser = null;
        this.initRouter(); // Initialize the routing system when the object is created
    }

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

        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log("this.currentUser: " + this.currentUser.userName);

        if (template) {

            document.getElementById('router-view').innerHTML = template.innerHTML;
            this.loadBooks();  // Load the books when rendering the books page
            document.getElementById('search-books').addEventListener("input", () => {
                this.filterBooksBySearch();
            });
            // הסרנו את האזנות האירועים האלה כדי שהסינון יתבצע רק עם כפתור הסינון
            // document.getElementById('search-books').addEventListener('input', () => {
            //     this.filterBooks();
            // });

            // document.querySelectorAll(".filter-select").forEach(select => {
            //     select.addEventListener("change", () => {
            //         this.filterBooks(); // filter by combo box
            //     });
            // });

            // רק לחיצה על כפתור הסינון תפעיל את פעולת הסינון
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

                    // הוספת אישור לפני מחיקה
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
                window.location.hash = '/books'; // חזרה לדף הספרים
            });
        }
    }


    renderEditBookPage(params) {

        const bookId = params.id;
        console.log(`עריכת ספר עם מזהה: ${bookId}`);
        const template = document.getElementById('edit-book-template');
        if (template) {
            document.getElementById('router-view').innerHTML = template.innerHTML;

            // טעינת פרטי הספר הקיים ומילוי הטופס
            this.loadBookForEdit(bookId);

            // הוספת מאזיני אירועים
            document.getElementById('edit-book-form')?.addEventListener('submit', (e) => {
                this.handleEditBook(e);
                window.location.hash = '/books'; // חזרה לדף הספרים
            });

            document.querySelector('.btn-cancel')?.addEventListener('click', () => {
                window.location.hash = '/books'; // חזרה לדף הספרים
            });
        }
    }


    // פונקציה להצגת עמוד הפעולות שלי
    renderMyActionsPage() {
        const template = document.getElementById('my-actions-template');
        if (template) {
            document.getElementById('router-view').innerHTML = template.innerHTML;

            // שימוש בתוכן התבנית ישירות
            const booksTemplateContent = document.getElementById('books-template').content;
            const topBarNode = booksTemplateContent.querySelector('.top-bar').cloneNode(true);

            // החלפת אלמנט הפלייסהולדר בסרגל העליון
            const topBarPlaceholder = document.getElementById('topbar-placeholder');
            if (topBarPlaceholder) {
                topBarPlaceholder.parentNode.replaceChild(topBarNode, topBarPlaceholder);

                // מציאת הלינקים בסרגל שהוספנו ועדכון הפעיל
                const links = document.querySelectorAll('.nav-link');
                links.forEach(link => {
                    link.classList.remove('active');
                });
                document.getElementById('my-actions-link')?.classList.add('active');

                // עדכון שם המשתמש אם זמין
                if (this.currentUser && this.currentUser.userName) {
                    document.getElementById('username-display').textContent = this.currentUser.userName;
                }
            }

            // הוספת פוטר
            const footerTemplate = document.getElementById('footer-template');
            if (footerTemplate) {
                document.getElementById('footer-placeholder').innerHTML = footerTemplate.innerHTML;
            }

            // הגדרת האזנה לאירועים בסרגל העליון
            this.setupTopBarListeners();

            // הגדרת פילטרים של פעולות
            this.setupActionFilters();
            this.currentUser = JSON.parse(localStorage.getItem('currentUser')); 
            // טעינת היסטוריית פעולות
            this.displayActions(this.currentUser.actionsHistory);
        }
    }

    setupTopBarListeners() {
        // לינק לספרים
        document.getElementById('books-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '/books';
        });

        // לינק לפעולות שלי
        document.getElementById('my-actions-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '/my-actions';
        });

        // כפתור התנתקות
        document.querySelector('.btn-logout')?.addEventListener('click', () => {
            // רישום פעולת התנתקות
            // if (this.currentUser) {
            //     this.recordAction('logout', `התנתקות מהמערכת`, null,
            //         `משתמש ${this.currentUser.userName} התנתק מהמערכת`);
            // }

            this.currentUser = null;
            window.location.hash = '/login';
        });
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
                    localStorage.setItem('currentUser', JSON.stringify(user));
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
        const newUser = { userName: username, password: password, email: email, id: id, actionsHistory: [] };
        const request = new FXMLHttpRequest();
        request.open("POST", "");
        request.onload = (user) => {
            this.hideLoading();
            if (user) {
                alert("Registration successful!");
                window.location.hash = '/books'; // Navigate to books page after successful registration
                localStorage.setItem('currentUser', JSON.stringify(user));
            } else {
                alert("The user already exists.");
            }
        };
        this.showLoading();
        request.send(newUser);
    }

    AddAction(action) {
        console.log("action" + action.title);
        console.log("this.currentUser:" + this.currentUser.userName);

        // הוסף את הפעולה למערך של המשתמש
        this.currentUser.actionsHistory.push(action);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));


        // שמור את המשתמש המעודכן בשרת באמצעות PUT
        const request = new FXMLHttpRequest();
        request.open("PUT", `/users/${this.currentUser.userName}`);

        // request.onerror = (error) => {
        //     this.hideLoading();
        //     console.error("Error adding action to user history:", error);
        //     return null;
        // };

        request.onload = (updatedUser) => {
            this.hideLoading();
            console.log("Action added successfully to user history");
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        };
        this.showLoading();
        request.send(this.currentUser);

    };

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


    filterBooks() {
        const searchTerm = document.querySelector("#search-books")?.value.trim().toLowerCase() || "";
        // תיקון: חסר # לפני מזהי האלמנטים וצריך להשתמש ב-querySelector במקום querySelectorAll
        const shelfFilter = document.querySelector("#shelf-filter")?.value || ""; // מיקום במדף
        const statusFilter = document.querySelector("#status-filter")?.value || ""; // סטטוס

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
            // יצירת פעולה חדשה

            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                alert(`The book ${book.title} has been successfully added!`);
                window.location.hash = '/books';
            }, 30);
            const actionId = this.getNextActionId(); // פונקציה שמחזירה ID רץ
            const newAction = {
                id: actionId,
                type: 'ADD',
                bookId: book.id,
                title: `הוספת ספר: "${book.title}"`,
                timestamp: new Date(),
                author: book.author
            };

            // הוספת הפעולה למערך הפעולות של המשתמש
            this.AddAction(newAction);
        };
        this.showLoading();
        request.send(bookData);


    }

    // פונקציית עזר לקבלת מספר ID רץ עבור פעולות חדשות
    getNextActionId() {
        if (!this.currentUser || !this.currentUser.actionsHistory) {
            return 1;
        }

        // חיפוש ה-ID הגבוה ביותר הקיים והוספת 1
        const maxId = Math.max(0, ...this.currentUser.actionsHistory.map(action => action.id || 0));
        return maxId + 1;
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
            
            // יצירת פעולה חדשה לעדכון ספר
            const actionId = this.getNextActionId(); // פונקציה שמחזירה ID רץ
            const newAction = {
                id: actionId,
                type: 'PUT',
                bookId: book.id,
                title: `עדכון ספר: "${book.title}"`,
                timestamp: new Date(),
                author: book.author
            };
            
            // הוספת הפעולה למערך הפעולות של המשתמש
            this.AddAction(newAction);
            
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
        
        // נשיג את פרטי הספר לפני המחיקה כדי שנוכל לשמור אותם בפעולה
        let bookDetails = null;
        try {
            // ניסיון לקבל את פרטי הספר לפני המחיקה
            bookDetails = await this.getBookById(bookId);
        } catch (error) {
            console.error("Error fetching book details before deletion:", error);
        }
        
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
            
            // יצירת פעולה חדשה למחיקת ספר
            if (bookDetails) {
                const actionId = this.getNextActionId(); // פונקציה שמחזירה ID רץ
                const newAction = {
                    id: actionId,
                    type: 'DELETE',
                    bookId: bookId,
                    title: `מחיקת ספר: "${bookDetails.title}"`,
                    timestamp: new Date(),
                    author: bookDetails.author
                };
                
                // הוספת הפעולה למערך הפעולות של המשתמש
                this.AddAction(newAction);
            }
            
            setTimeout(() => {  //the timeout is in order to the code will can be hide the loading before alert
                alert("The book has been successfully deleted!");
                this.loadBooks(); // Refresh the book list
            }, 30);
        };
        this.showLoading();
        request.send();
    }
    
    // הוספת פונקציה להשגת פרטי ספר לפי ID
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



    async loadBookForEdit(bookId) {
        const request = new FXMLHttpRequest();
        request.open("GET", `/edit-book/${bookId}`, "BooksServer");
        request.onerror = (error) => {
            this.hideLoading();
            setTimeout(() => {
                alert(`שגיאה בטעינת פרטי הספר: ${error.error}`);
                window.location.hash = '/books';
            }, 10000);
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


    // פונקציה להצגת מצב ריק כשאין ספרים
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

    // פונקציה להצגת הודעות למשתמש
    showAlert(message, type = 'info') {
        // יצירת אלמנט ההודעה
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} fade-in`;

        // בחירת אייקון מתאים לסוג ההודעה
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        if (type === 'danger') icon = 'times-circle';

        alertElement.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
`;

        // הוספה לדום
        document.body.appendChild(alertElement);

        // מיקום ההודעה
        alertElement.style.position = 'fixed';
        alertElement.style.top = '20px';
        alertElement.style.left = '50%';
        alertElement.style.transform = 'translateX(-50%)';
        alertElement.style.zIndex = '9999';
        alertElement.style.minWidth = '300px';

        // הסרה אחרי זמן קצוב
        setTimeout(() => {
            alertElement.style.opacity = '0';
            setTimeout(() => {
                alertElement.remove();
            }, 300);
        }, 3000);
    }



    // פונקציה להגדרת פילטרים של פעולות
    setupActionFilters() {
        const typeFilter = document.getElementById('action-type-filter');
        const dateFromFilter = document.getElementById('date-from-filter');
        const dateToFilter = document.getElementById('date-to-filter');
        const filterBtn = document.getElementById('filter-actions-btn');

        // הגדרת ברירות מחדל לתאריכים (30 ימים אחרונים)
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        dateToFilter.valueAsDate = today;
        dateFromFilter.valueAsDate = thirtyDaysAgo;

        // הוספת האזנה לאירועים לכפתור סינון
        filterBtn?.addEventListener('click', () => {
            this.filterActions();
        });
    }

    // פונקציה לטעינת היסטוריית פעולות
    loadActionsHistory() {
        // if (this.actionsHistory.length === 0) {
        //     // אם אין פעולות שנרשמו, השתמש בנתוני דוגמה
        //     this.initializeSampleActions();
        // }

        // הצגת פעולות
        this.displayActions(this.actionsHistory);

        // עדכון סטטיסטיקה
        //this.updateActionStats();
    }

    // פונקציה לאתחול דוגמאות פעולות
    initializeSampleActions() {
        // למטרות הדגמה בלבד
        this.actionsHistory = [
            {
                id: 1,
                type: 'add',
                title: 'הוספת ספר: "מלחמה ושלום"',
                bookId: 'ISBN123456',
                timestamp: new Date('2025-02-15T10:30:00'),
                details: 'מספר מדף: A1, קטגוריה: היסטוריה'
            },
            {
                id: 2,
                type: 'edit',
                title: 'עריכת ספר: "שר הטבעות"',
                bookId: 'ISBN789012',
                timestamp: new Date('2025-02-20T14:45:00'),
                details: 'שינוי סטטוס: זמין → מושאל'
            },
            {
                id: 3,
                type: 'delete',
                title: 'מחיקת ספר: "המוות האדום"',
                bookId: 'ISBN345678',
                timestamp: new Date('2025-02-25T09:15:00'),
                details: 'סיבה: עותק פגום'
            },
            {
                id: 4,
                type: 'add',
                title: 'הוספת ספר: "הנסיך הקטן"',
                bookId: 'ISBN901234',
                timestamp: new Date('2025-03-01T11:20:00'),
                details: 'מספר מדף: B2, קטגוריה: סיפורת'
            }
        ];
    }

    // פונקציה להצגת פעולות
    d// פונקציה להצגת פעולות
displayActions(actions) {
    const actionsList = document.getElementById('actions-list');
    
    // פונקציה פנימית לעיצוב התאריך והשעה
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        
        // פורמט תאריך: DD/MM/YYYY
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const dateStr = `${day}/${month}/${year}`;
        
        // פורמט שעה: HH:MM
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;
        
        return {
            date: dateStr,
            time: timeStr
        };
    };
    
    // ניקוי הרשימה
    actionsList.innerHTML = '';
    
    // בדיקה אם ההיסטוריה ריקה
    if (!actions || actions.length === 0) {
        actionsList.innerHTML = `
        <div class="no-actions-message">
            <i class="fas fa-history" style="font-size: 24px; margin-bottom: 10px;"></i>
            <p>אין פעולות קודמות להצגה</p>
        </div>`;
        return;
    }
    
    // קבלת תבנית כרטיס פעולה
    const actionCardTemplate = document.getElementById('action-card-template').content;
    
    // יצירת פרגמנט לשיפור ביצועים
    const fragment = document.createDocumentFragment();
    
    // הוספת כל פעולה לרשימה
    actions.forEach((action, index) => {
        // שכפול התבנית
        const actionCard = actionCardTemplate.cloneNode(true);
        
        // הגדרת מאפיין סוג פעולה לעיצוב
        const actionCardElement = actionCard.querySelector('.action-card');
        actionCardElement.setAttribute('data-type', action.type);
        actionCardElement.setAttribute('data-id', action.id);
        
        // הגדרת אייקון הפעולה
        const iconElement = actionCard.querySelector('.action-icon i');
        if (action.type === 'POST') {
            iconElement.className = 'fas fa-plus';
        } else if (action.type === 'PUT') {
            iconElement.className = 'fas fa-edit';
        } else if (action.type === 'DELETE') {
            iconElement.className = 'fas fa-trash';
        }
        
        // הגדרת כותרת הפעולה
        actionCard.querySelector('.action-title').textContent = action.title;
        
        // עיצוב התאריך והשעה
        const formattedDate = formatDate(action.timestamp);
        actionCard.querySelector('.action-date').innerHTML =
            `<i class="far fa-calendar"></i> ${formattedDate.date}`;
        actionCard.querySelector('.action-time').innerHTML =
            `<i class="far fa-clock"></i> ${formattedDate.time}`;
        
    
        // הוספת שם המחבר
        const authorElement = actionCard.querySelector('.action-author');
        if (authorElement && action.author) {
            authorElement.innerHTML = `<i class="fas fa-user-edit"></i> ${action.author}`;
        } else if (authorElement) {
            authorElement.style.display = 'none'; // הסתר אם אין מחבר
        }
        
        // הוספת השהייה ליצירת אפקט הנפשה מדורג
        actionCardElement.style.animationDelay = `${index * 0.1}s`;
        actionCardElement.classList.add('fade-in');
        
        // הוספת כרטיס הפעולה לפרגמנט
        fragment.appendChild(actionCard);
    });
    
    // הוספת הפרגמנט לדום
    actionsList.appendChild(fragment);
    
    // נתאים את התצוגה לכיוון העברית (מימין לשמאל)
    actionsList.style.direction = 'rtl';
}


}

// Create an instance of LibraryApp
new LibraryApp();
