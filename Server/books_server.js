class BooksServer {
    constructor() {
        this.db = new BooksDB();
    }

    handleRequest(request) {
        switch (request.method) {
            case 'GET':
                if (request.url.endsWith('/books')) {
                    this.handleGetAll(request);
                } else {
                    this.handleGetOne(request);
                }
                break;
            case 'POST':
                this.handleCreate(request);
                break;
            case 'PUT':
                this.handleUpdate(request);
                break;
            case 'DELETE':
                this.handleDelete(request);
                break;
            default:
                this.sendResponse(request, 405, { message: 'Method not allowed' });
        }
    }

    async handleGetAll(request) {
        try {
            const books = this.db.getAll();
            this.sendResponse(request, 200, books);
        } catch (error) {
            this.sendResponse(request, 500, { message: error.message });
        }
    }

    async handleGetOne(request) {
        try {
            const bookId = request.url.split('/').pop();
            const book = this.db.getById(bookId);
            if (book) {
                this.sendResponse(request, 200, book);
            } else {
                this.sendResponse(request, 404, { message: 'Book not found' });
            }
        } catch (error) {
            this.sendResponse(request, 500, { message: error.message });
        }
    }

    async handleCreate(request) {
        try {
            this.db.add(request.data);
            this.sendResponse(request, 201, { message: 'Book added successfully' });
        } catch (error) {
            this.sendResponse(request, 500, { message: error.message });
        }
    }

    async handleUpdate(request) {
        try {
            const bookId = request.url.split('/').pop();
            this.db.update(bookId, request.data);
            this.sendResponse(request, 200, { message: 'Book updated successfully' });
        } catch (error) {
            this.sendResponse(request, 500, { message: error.message });
        }
    }

    async handleDelete(request) {
        try {
            const bookId = request.url.split('/').pop();
            this.db.delete(bookId);
            this.sendResponse(request, 200, { message: 'Book deleted successfully' });
        } catch (error) {
            this.sendResponse(request, 500, { message: error.message });
        }
    }

    sendResponse(request, status, data) {
        request.callback({
            status,
            data,
            timestamp: Date.now()
        });
    }
}
