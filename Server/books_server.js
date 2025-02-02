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
            const books = await this.db.getAllBooks();
            this.sendResponse(request, 200, books);
        } catch (error) {
            this.sendResponse(request, 500, { message: error.message });
        }
    }

    async handleCreate(request) {
        try {
            const newBook = await this.db.addBook(request.data);
            this.sendResponse(request, 201, newBook);
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
