// books-server.js - שרת ניהול ספרים
class BooksServer {
    static getBooks(userId) {
        const books = DB.getBooks(userId);
        return { success: true, data: books };
    }

    static addBook(userId, bookData) {
        const books = DB.getBooks(userId);
        const newBook = {
            id: Date.now().toString(),
            ...bookData,
            createdAt: new Date().toISOString()
        };
        books.push(newBook);
        DB.saveBooks(userId, books);
        return { success: true, data: newBook };
    }

    static updateBook(userId, bookId, bookData) {
        const books = DB.getBooks(userId);
        const index = books.findIndex(b => b.id === bookId);
        if (index === -1) {
            return { success: false, message: 'Book not found' };
        }
        books[index] = { ...books[index], ...bookData };
        DB.saveBooks(userId, books);
        return { success: true, data: books[index] };
    }

    static deleteBook(userId, bookId) {
        const books = DB.getBooks(userId);
        const filteredBooks = books.filter(b => b.id !== bookId);
        DB.saveBooks(userId, filteredBooks);
        return { success: true };
    }
}
