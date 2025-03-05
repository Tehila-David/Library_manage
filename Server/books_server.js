/**
 * BooksServer - Handles all book-related requests
 * Manages book operations (create, read, update, delete)
 */
class BooksServer {
    /**
     * Initialize the books server with books database
     */
    constructor() {
        this.db = new BooksDB();
    }

    /**
     * Generate a unique ID for new books
     * @returns {number} A new unique book ID
     */
    generateBookId() {
        let lastId = localStorage.getItem('lastBookId') || 10000;
        lastId = Number(lastId) + 1;
        localStorage.setItem('lastBookId', lastId);
        return lastId;
    }

    /**
     * Process incoming requests and route to appropriate handlers
     * @param {string} data - JSON string containing request data
     * @param {Function} callback - Function to call with the response
     */
    requestHandler(data, callback) {
        try {
            const parsedData = JSON.parse(data);
            const { method, id } = parsedData.data;
            const object = parsedData.object;

            switch (method) {
                case 'GET':
                    this.handleGetRequest(id, callback);
                    break;

                case 'POST':
                    this.handlePostRequest(id, object, callback);
                    break;

                case 'PUT':
                    this.handlePutRequest(id, object, callback);
                    break;

                case 'DELETE':
                    this.handleDeleteRequest(id, callback);
                    break;

                default:
                    callback({
                        status: 405,
                        statusText: 'Method Not Allowed',
                        data: null,
                        error: `Method ${method} not allowed`
                    });
                    break;
            }
        } catch (error) {
            callback({
                status: 500,
                statusText: 'Internal Server Error',
                data: null,
                error: error.message
            });
        }
    }

    /**
     * Handle GET requests for book data
     * @param {string} id - Book ID (if retrieving a specific book)
     * @param {Function} callback - Response callback
     */
    handleGetRequest(id, callback) {
        if (id) {
            // Get specific book by ID
            const book = this.db.getBook(id);
            if (book) {
                callback({
                    status: 200,
                    statusText: 'OK',
                    data: book
                });
            } else {
                callback({
                    status: 404,
                    statusText: 'Not Found',
                    data: null,
                    error: 'Book not found'
                });
            }
        } else {
            // Get all books
            const books = this.db.loadBooks();
            callback({
                status: 200,
                statusText: 'OK',
                data: books
            });
        }
    }

    /**
     * Handle POST requests to create new books
     * @param {string} id - Should be null for POST requests
     * @param {Object} bookData - Book data to create
     * @param {Function} callback - Response callback
     */
    handlePostRequest(id, bookData, callback) {
        if (id) {
            callback({
                status: 400,
                statusText: 'Bad Request',
                data: null,
                error: 'POST request should not include an ID'
            });
            return;
        }

        if (!bookData || !bookData.title || !bookData.author) {
            callback({
                status: 400,
                statusText: 'Bad Request',
                data: null,
                error: 'Missing required fields'
            });
            return;
        }

        const existingBook = this.db.loadBooks().find(book => book.title === bookData.title);
        if (existingBook) {
            callback({
                status: 409,
                statusText: 'Conflict',
                data: null,
                error: 'Book with this title already exists'
            });
            return;
        }

        bookData.id = this.generateBookId();
        const newBook = this.db.addBook(bookData);
        callback({
            status: 201,
            statusText: 'Created',
            data: newBook
        });
    }

    /**
     * Handle PUT requests to update existing books
     * @param {string} id - Book ID to update
     * @param {Object} bookData - Updated book data
     * @param {Function} callback - Response callback
     */
    handlePutRequest(id, bookData, callback) {
        if (!id) {
            callback({
                status: 400,
                statusText: 'Bad Request',
                data: null,
                error: 'PUT request requires an ID'
            });
            return;
        }

        if (!bookData || !bookData.title || !bookData.author) {
            callback({
                status: 400,
                statusText: 'Bad Request',
                data: null,
                error: 'Missing required fields'
            });
            return;
        }

        const updatedBook = this.db.updateBook(id, bookData);
        if (updatedBook) {
            callback({
                status: 200,
                statusText: 'OK',
                data: updatedBook
            });
        } else {
            callback({
                status: 404,
                statusText: 'Not Found',
                data: null,
                error: 'Book not found'
            });
        }
    }

    /**
     * Handle DELETE requests to remove books
     * @param {string} id - Book ID to delete
     * @param {Function} callback - Response callback
     */
    handleDeleteRequest(id, callback) {
        if (!id) {
            callback({
                status: 400,
                statusText: 'Bad Request',
                data: null,
                error: 'DELETE request requires an ID'
            });
            return;
        }

        const deleted = this.db.deleteBook(id);
        if (deleted) {
            callback({
                status: 200,
                statusText: 'OK',
                data: { message: 'Book deleted successfully' }
            });
        } else {
            callback({
                status: 404,
                statusText: 'Not Found',
                data: null,
                error: 'Book not found'
            });
        }
    }
}