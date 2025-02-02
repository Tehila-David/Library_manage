export class BooksDB {
    constructor() {
        this.storageKey = 'library_books';
        this.initializeBooks();
    }
async getAllBooks() {
    return JSON.parse(localStorage.getItem(this.storageKey), '[]');
}

async getBookById(id) {
    const books = await this.getAllBooks();
    return books.find(book => book.id === id);
}

async addBook(bookData) {
    const books = await this.getAllBooks();
    const newBook = {
        id: Date.now(),
        ...bookData,
        createdAt: new Date().toISOString()
    };
    books.push(newBook);
    localStorage.setItem(this.storageKey, JSON.stringify(books));
    return newBook;
}

async updateBook(id, bookData) {
    const books = await this.getAllBooks();
    const index = books.findIndex(book => book.id === id);
    if (index === -1) throw new Error('Book not found');
    
    books[index] = {
        ...books[index],
        ...bookData,
        updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.storageKey, JSON.stringify(books));
    return books[index];
}

async deleteBook(id) {
    const books = await this.getAllBooks();
    const newBooks = books.filter(book => book.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(newBooks));
}
}

// File: DataBase/UsersDB.js
export class UsersDB {
constructor() {
    this.storageKey = 'library_users';
    this.initializeUsers();
}

async findUser(username, password) {
    const users = JSON.parse(localStorage.getItem(this.storageKey),'[]');
    return users.find(user => 
        user.username === username && 
        user.password === password
    );
}

async addUser(userData) {
    const users = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const newUser = {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    return newUser;
}
}