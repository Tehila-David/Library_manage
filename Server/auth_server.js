// Enhanced AuthServer with proper response formatting
class AuthServer {
    constructor() {
        this.db = new UsersDB();
    }

    requestHandler(data, callback) {
        try {
            const parsedData = JSON.parse(data);
            const object = parsedData.object;
            const method = parsedData.data.method;

            switch (method) {
                case 'GET':
                    if (object === 'users') {
                        const users = this.db.loadUsers();
                        callback({
                            status: 200,
                            statusText: 'OK',
                            data: users
                        });
                    } else if (object.userName) {
                        const user = this.db.getUser(object.userName);
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
                            error: 'Invalid object'
                        });
                    }
                    break;

                case 'POST':
                    if (object.userName && object.password) {
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