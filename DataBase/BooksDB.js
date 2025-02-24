class BooksDB {
  
  // Load books from local storage
  loadBooks() {
      return JSON.parse(localStorage.getItem("books")) || [];
  }

  // Save books to local storage
  saveBooks(books) {
      localStorage.setItem("books", JSON.stringify(books));
  }

  // Generate a unique book ID
  generateBookId() {
      let lastId = localStorage.getItem('lastBookId') || 10000;
      lastId = Number(lastId) + 1;
      localStorage.setItem('lastBookId', lastId);
      return JSON.stringify(lastId);
  }

  // Add a new book if the title does not already exist
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

  // Get all books
  getBooksList() {
      return this.loadBooks();
  }

  // Find a book by ID
  getBook(bookId) {
      const books = this.loadBooks();
      return books.find((book) => book.id === bookId) || null;
  }

  // Update book by ID
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

  // Delete book by ID
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
