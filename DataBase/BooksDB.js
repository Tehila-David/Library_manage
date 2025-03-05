/**
 * BooksDB - Database class for managing books in local storage
 */
class BooksDB {
    /**
     * Load books from local storage
     * @returns {Array} Array of book objects
     */
    loadBooks() {
      return JSON.parse(localStorage.getItem("books")) || [];
    }
  
    /**
     * Save books to local storage
     * @param {Array} books - Array of book objects to save
     */
    saveBooks(books) {
      localStorage.setItem("books", JSON.stringify(books));
    }
  
    /**
     * Generate a unique book ID
     * @returns {string} New unique ID for a book
     */
    generateBookId() {
      let lastId = localStorage.getItem('lastBookId') || 10000;
      lastId = Number(lastId) + 1;
      localStorage.setItem('lastBookId', lastId);
      return JSON.stringify(lastId);
    }
  
    /**
     * Add a new book if the title does not already exist
     * @param {Object} newBook - Book object to add
     * @returns {Object|null} Added book or null if title already exists
     */
    addBook(newBook) {
      const books = this.loadBooks();
      const existingBook = books.find((book) => book.title === newBook.title);
      
      if (existingBook) {
        alert("A book with this title already exists.");
        return null;
      }
      
      newBook.id = this.generateBookId();
      books.push(newBook);
      this.saveBooks(books);
      return newBook;
    }
  
    /**
     * Get all books
     * @returns {Array} Array of all book objects
     */
    getBooksList() {
      return this.loadBooks();
    }
  
    /**
     * Find a book by ID
     * @param {string} bookId - ID of the book to find
     * @returns {Object|null} Book object or null if not found
     */
    getBook(bookId) {
      const books = this.loadBooks();
      return books.find((book) => book.id === bookId) || null;
    }
  
    /**
     * Update book by ID
     * @param {string} bookId - ID of the book to update
     * @param {Object} newData - New data to apply to the book
     * @returns {boolean} True if book was updated, false if not found
     */
    updateBook(bookId, newData) {
      const books = this.loadBooks();
      const bookIndex = books.findIndex((book) => book.id === bookId);
      
      if (bookIndex !== -1) {
        Object.assign(books[bookIndex], newData);
        this.saveBooks(books);
        return true;
      }
      
      return false;
    }
  
    /**
     * Delete book by ID
     * @param {string} bookId - ID of the book to delete
     * @returns {boolean} True if book was deleted, false if not found
     */
    deleteBook(bookId) {
      const books = this.loadBooks();
      console.log(books);
      const index = books.findIndex((book) => book.id === bookId);
      
      if (index !== -1) {
        books.splice(index, 1);
        this.saveBooks(books);
        return true;
      }
      
      return false;
    }
  }