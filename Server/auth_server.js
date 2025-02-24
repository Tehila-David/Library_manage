class AuthServer {
    constructor() {
        this.db = new UsersDB();
    }

    requestHandler(data, callback) {
        try {
            const parsedData = JSON.parse(data);
            const { method, id } = parsedData.data;
            const object = parsedData.object;

            switch (method) {
                case 'GET':
                    if (object === 'users') {
                        // Get all users
                        const users = this.db.loadUsers();
                        callback({
                            status: 200,
                            statusText: 'OK',
                            data: users
                        });
                    } else if (id) {
                        // Get specific user
                        const user = this.db.getUser(id);
                        if (user) {
                            callback({
                                status: 200,
                                statusText: 'OK',
                                data: user
                            });
                        } else {
                            callback({
                                status: 404,
                                statusText: 'Not Found',
                                data: null,
                                error: 'User not found'
                            });
                        }
                    } else {
                        callback({
                            status: 400,
                            statusText: 'Bad Request',
                            data: null,
                            error: 'Invalid request'
                        });
                    }
                    break;

                case 'POST':
                    if (!object.userName || !object.password) {
                        callback({
                            status: 400,
                            statusText: 'Bad Request',
                            data: null,
                            error: 'Missing required fields'
                        });
                        return;
                    }

                    const result = this.db.addUser(object);
                    if (result) {
                        callback({
                            status: 201,
                            statusText: 'Created',
                            data: result
                        });
                    } else {
                        callback({
                            status: 409,
                            statusText: 'Conflict',
                            data: null,
                            error: 'User already exists'
                        });
                    }
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

                    const updatedUser = this.db.updateUser(id, object);
                    if (updatedUser) {
                        callback({
                            status: 200,
                            statusText: 'OK',
                            data: updatedUser
                        });
                    } else {
                        callback({
                            status: 404,
                            statusText: 'Not Found',
                            data: null,
                            error: 'User not found'
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

                    const deleted = this.db.deleteUser(id);
                    if (deleted) {
                        callback({
                            status: 200,
                            statusText: 'OK',
                            data: { message: 'User deleted successfully' }
                        });
                    } else {
                        callback({
                            status: 404,
                            statusText: 'Not Found',
                            data: null,
                            error: 'User not found'
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