class UsersDB  {
 
  //  Load users from local storage 
  loadUsers() {
    console.log("Loading users", localStorage.getItem("users"));
    return JSON.parse(localStorage.getItem("users")) || [];
  }

  // Save users to local storage 
  saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  //Add a new user
  addUser(addUser) {
    const users = this.loadUsers();
    const existingUser = users.find((user) => user.userName === addUser.userName);
    if (existingUser) {
      return null;
    }
    const newUser = addUser;
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  //Get all users
  getUsersList() {
    console.log("Getting users");
    return this.loadUsers();
  }

  // Find a user by userName 
  getUser(userName) {
    const users = this.loadUsers();
    return users.find((user) => user.userName === userName);
  }

  //Update a user's information 
  updateUser(id, newData) {
    const users = this.loadUsers();
    //const user = users.find((user) => user.userName === userName);
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      Object.assign(users[userIndex], newData);
      this.saveUsers(users);
      return true;
    }
    return false;
  }

  // Delete a user 
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