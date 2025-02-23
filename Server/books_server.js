class BooksServer {
    constructor() {
        this.db = new BooksDB(); // Create an instance of BooksDB
    }

    // Generate a unique book ID and store it in local storage
    generateBookId() {
        let lastId = localStorage.getItem('lastBookId') || 10000;
        lastId = Number(lastId) + 1;
        localStorage.setItem('lastBookId', lastId);
        return lastId;
    }

    // Handle requests based on book ID
    requestHandler(data, func = (x) => {}) {
        const parsedData = JSON.parse(data);
        const object = parsedData.object;
        const method = parsedData.data.method;
        
        switch (method) {
            case 'GET':
                if (object === 'books') {
                    func(this.db.loadBooks()); // Return all books
                } else if (object.id) {
                    func(this.db.getBook(object.id)); // Retrieve a book by ID
                } else {
                    console.log('Error: Invalid object');
                }
                break;
    
            case 'POST':
                if (object.title && object.author) {
                    // Check if a book with the same title already exists
                    const existingBook = this.db.loadBooks().find(book => book.title === object.title);
                    if (existingBook) {
                        alert("A book with this title already exists!");
                        return;
                    }
                    
                    object.id = this.generateBookId(); // Assign a unique ID
                    func(this.db.addBook(object)); // Add book to the database
                } else {
                    console.log("Error: Missing book details");
                }
                break;
    
            case 'PUT':
                if (object.id) {
                    func(this.db.updateBook(object.id, object)); // Update book by ID
                } else {
                    console.log("Error: ID is required for update");
                }
                break;
    
            case 'DELETE':
                if (object.id) {
                    func(this.db.deleteBook(object.id)); // Delete book by ID
                } else {
                    console.log("Error: ID is required for deletion");
                }
                break;
    
            default:
                console.log('Method not allowed');
                break;
        }
    }
}
