class BooksServer {
    constructor() {
        this.db = new BooksDB();
    }

    generateBookId() {
        let lastId = localStorage.getItem('lastBookId') || 10000;
        lastId = Number(lastId) + 1;
        localStorage.setItem('lastBookId', lastId);
        return lastId;
    }

    requestHandler(data, callback) {
        try {
            const parsedData = JSON.parse(data);
            const { method, id } = parsedData.data;
            const object = parsedData.object;

            switch (method) {
                case 'GET':
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
                    break;

                case 'POST':
                    if (id) {
                        callback({
                            status: 400,
                            statusText: 'Bad Request',
                            data: null,
                            error: 'POST request should not include an ID'
                        });
                        return;
                    }

                    if (!object || !object.title || !object.author) {
                        callback({
                            status: 400,
                            statusText: 'Bad Request',
                            data: null,
                            error: 'Missing required fields'
                        });
                        return;
                    }

                    const existingBook = this.db.loadBooks().find(book => book.title === object.title);
                    if (existingBook) {
                        callback({
                            status: 409,
                            statusText: 'Conflict',
                            data: null,
                            error: 'Book with this title already exists'
                        });
                        return;
                    }

                    object.id = this.generateBookId();
                    const newBook = this.db.addBook(object);
                    callback({
                        status: 201,
                        statusText: 'Created',
                        data: newBook
                    });
                    break;

                case 'PUT':
                    if (!id) {
                        callback({
                            status: 400,
                            statusText: 'Bad Request',
                            data: null,
                            error: 'PUT request requires an ID'
                        });
                        return;
                    }

                    if (!object || !object.title || !object.author) {
                        callback({
                            status: 400,
                            statusText: 'Bad Request',
                            data: null,
                            error: 'Missing required fields'
                        });
                        return;
                    }

                    const updatedBook = this.db.updateBook(id, object);
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
                    break;

                case 'DELETE':
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
}