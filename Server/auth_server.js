/**
 * AuthServer - Handles all authentication-related requests
 * Manages user operations (create, read, update, delete)
 */
class AuthServer {
    /**
     * Initialize the auth server with user database
     */
    constructor() {
        this.db = new UsersDB();
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
                    this.handleGetRequest(id, object, callback);
                    break;

                case 'POST':
                    this.handlePostRequest(object, callback);
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
     * Handle GET requests for user data
     * @param {string} id - User ID (if retrieving a specific user)
     * @param {string} object - Request object ('users' for all users)
     * @param {Function} callback - Response callback
     */
    handleGetRequest(id, object, callback) {
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
    }

    /**
     * Handle POST requests to create new users
     * @param {Object} userData - User data to create
     * @param {Function} callback - Response callback
     */
    handlePostRequest(userData, callback) {
        if (!userData.userName || !userData.password) {
            callback({
                status: 400,
                statusText: 'Bad Request',
                data: null,
                error: 'Missing required fields'
            });
            return;
        }

        const result = this.db.addUser(userData);
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
    }

    /**
     * Handle PUT requests to update existing users
     * @param {string} id - User ID to update
     * @param {Object} userData - Updated user data
     * @param {Function} callback - Response callback
     */
    handlePutRequest(id, userData, callback) {
        if (!id) {
            callback({
                status: 400,
                statusText: 'Bad Request',
                data: null,
                error: 'PUT request requires an ID'
            });
            return;
        }

        const updatedUser = this.db.updateUser(id, userData);
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
    }

    /**
     * Handle DELETE requests to remove users
     * @param {string} id - User ID to delete
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
    }
}