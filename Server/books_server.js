// Enhanced BooksServer with proper response formatting
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
            const object = parsedData.object;
            const method = parsedData.data.method;

            switch (method) {
                case 'GET':
                    if (object === 'books') {
                        const books = this.db.loadBooks();
                        callback({
                            status: 200,
                            statusText: 'OK',
                            data: books
                        });
                    } else if (object.id) {
                        const book = this.db.getBook(object.id);
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
                        callback({
                            status: 400,
                            statusText: 'Bad Request',
                            data: null,
                            error: 'Invalid object'
                        });
                    }
                    break;

                case 'POST':
                    if (object.title && object.author) {
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
                        const result = this.db.addBook(object);
                        callback({
                            status: 201,
                            statusText: 'Created',
                            data: result
                        });
                    } else {
                        callback({
                            status: 400,
                            statusText: 'Bad Request',
                            data: null,
                            error: 'Missing required fields'
                        });
                    }
                    break;

                // Similar pattern for PUT and DELETE...
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