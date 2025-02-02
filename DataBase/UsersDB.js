class UsersDB extends DB {
    constructor() {
        super("users");
    }

    findUser(username) {
        return this.data.find(user => user.username === username);
    }
}