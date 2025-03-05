/**
 * UsersDB - Database class for managing users in local storage
 */
class UsersDB {
  /**
   * Load users from local storage
   * @returns {Array} Array of user objects
   */
  loadUsers() {
    console.log("Loading users", localStorage.getItem("users"));
    return JSON.parse(localStorage.getItem("users")) || [];
  }

  /**
   * Save users to local storage
   * @param {Array} users - Array of user objects to save
   */
  saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  /**
   * Add a new user if username doesn't already exist
   * @param {Object} newUser - User object to add
   * @returns {Object|null} Added user or null if username already exists
   */
  addUser(newUser) {
    const users = this.loadUsers();
    const existingUser = users.find((user) => user.userName === newUser.userName);

    if (existingUser) {
      return null;
    }

    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  /**
   * Get all users
   * @returns {Array} Array of all user objects
   */
  getUsersList() {
    console.log("Getting users");
    return this.loadUsers();
  }

  /**
   * Find a user by username
   * @param {string} userName - Username of the user to find
   * @returns {Object|undefined} User object or undefined if not found
   */
  getUser(userName) {
    const users = this.loadUsers();
    return users.find((user) => user.userName === userName);
  }

  /**
   * Update a user's information by ID
   * @param {string} id - ID of the user to update
   * @param {Object} newData - New data to apply to the user
   * @returns {boolean} True if user was updated, false if not found
   */
  updateUser(id, newData) {
    const users = this.loadUsers();
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex !== -1) {
      Object.assign(users[userIndex], newData);
      this.saveUsers(users);
      return true;
    }

    return false;
  }

  /**
   * Delete a user by username
   * @param {string} userName - Username of the user to delete
   * @returns {boolean} True if user was deleted, false if not found
   */
  deleteUser(userName) {
    const users = this.loadUsers();
    const index = users.findIndex((user) => user.userName === userName);

    if (index !== -1) {
      users.splice(index, 1);
      this.saveUsers(users);
      return true;
    }

    return false;
  }
}