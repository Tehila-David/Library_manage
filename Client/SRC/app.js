// File: Client/SRC/app.js
//import { initializeDB } from '../../DataBase/DB.js';
import { loginUser } from '../../Server/auth_server.js';
import { getAllBooks, addBook } from '../../Server/books_server.js';

class LibraryApp {
    constructor() {
        this.currentUser = null;
        this.initializeEventListeners();
    }

    async initializeEventListeners() {
        document.getElementById('login-form').addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('add-book-btn').addEventListener('click', this.handleAddBook.bind(this));
    }

    async handleLogin(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const user = await loginUser(username, password);
            if (user) {
                this.currentUser = user;
                this.showBooksPage();
            }
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }

    async handleAddBook() {
        // Implementation for adding a new book
    }

    showBooksPage() {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('books-page').style.display = 'block';
        this.loadBooks();
    }

    async loadBooks() {
        const books = await getAllBooks();
        const booksList = document.getElementById('books-list');
        booksList.innerHTML = books.map(book => `
            <div class="book-card">
                <h3>${book.title}</h3>
                <p>Author: ${book.author}</p>
                <p>Status: ${book.available ? 'Available' : 'Borrowed'}</p>
            </div>
        `).join('');
    }
}

new LibraryApp();