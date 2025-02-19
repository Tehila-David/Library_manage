class BooksDB {
  
    //  Load books from local storage 
    loadBooks() {
      console.log("Loading books", localStorage.getItem("books"));
      return JSON.parse(localStorage.getItem("books")) || [];
    }
  
    //  Save books to local storage 
    saveBooks(books) {
      localStorage.setItem("books", JSON.stringify(books));
    }
  
    //  Add a new book 
    addBook(addBook) {
      const books = this.loadBooks();
      const existingBook = books.find((book) => book.title === addBook.title);
      if (existingBook) {
        return null; // If book already exists, return null
      }
      const newBook = addBook;
      books.push(newBook);
      this.saveBooks(books);
      return newBook;
    }
  
    // Get all books 
    getBooksList() {
      console.log("Getting books");
      return this.loadBooks();
    }
  
    //  Find a book by bookId 
    getBook(bookTitle) {
      const books = this.loadBooks();
      return books.find((book) => book.title === bookTitle);
    }
  
    //  Update a book's information 
    updateBook(bookTitle, newData) {
      const books = this.loadBooks();
      const book = books.find((book) => book.title === bookTitle);
      if (book) {
        Object.assign(book, newData);
        this.saveBooks(books);
        return true; // Successfully updated
      }
      return false; // Book not found
    }
  
    //  Delete a book 
    deleteBook(bookTitle) {
      const books = this.loadBooks();
      const index = books.findIndex((book) => book.title === bookTitle);
      if (index !== -1) {
        books.splice(index, 1);
        this.saveBooks(books);
        return true; // Successfully deleted
      }
      return false; // Book not found
    }
  }
  