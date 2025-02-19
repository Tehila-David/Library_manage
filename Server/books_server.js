class BooksServer {
    constructor() {
        this.db = new BooksDB(); // Create an instance of BooksDB
    }

    // Function to handle requests and perform the appropriate action based on the method
    requestHandler(data, func = (x) => {}) {
        const parsedData = JSON.parse(data);
        const object = parsedData.object;
        const method = parsedData.data.method;
        
        // Handle requests based on the method type
        switch (method) {
            case 'GET':
                if (object === 'books') {
                    func(this.db.loadBooks()); // Return all books
                } else if (object.title) {
                    func(this.db.getBook(object.title)); // Get a specific book by ID
                } else {
                    console.log('Error: Invalid object');
                    //func({ status: 404, response: 'Not Found' });
                }
                break;
    
            case 'POST':
                if (object.title && object.author) {
                    func(this.db.addBook(object)); // Add a new book
                } else {
                    console.log("Error: Invalid object");
                }
                break;
    
            case 'PUT':
                if (object.title) {
                    func(this.db.updateBook(object.title, object)); // Update a book by ID
                } else {
                    console.log("Error: Invalid object");
                }
                break;
    
            case 'DELETE':
                if (object.title) {
                    func(this.db.deleteBook(object.title)); // Delete a book by ID
                } else {
                    console.log("Error: Invalid object");
                }
                break;
    
            default:
                console.log('Method not allowed');
                break;
        }
    }
}
