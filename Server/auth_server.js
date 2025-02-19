
class AuthServer {
    constructor() {
        this.db = new UsersDB(); // יצירת מופע של UsersDB
    }

    // פונקציה שמתאמתת את סוג הבקשה ומבצעת את הפעולה המתאימה
    requestHandler(data, func = (x) => {}) {
        const parsedData = JSON.parse(data);
        const object = parsedData.object;
        const method = parsedData.data.method;
        
        // טיפול בבקשות לפי שיטה
        switch (method) {
            case 'GET':
                if (object === 'users') {
                    func(this.db.loadUsers()); // מחזיר את כל המשתמשים
                } else if (object.userName) {
                    func(this.db.getUser(object.userName)); 
                } else {
                    console.log('Error: Invalid object');
                    //func({ status: 404, response: 'Not Found' });
                }
                break;
    
            case 'POST':
                if (object.userName && object.password) {
                    func(this.db.addUser(object));
                  } else {
                    console.log("Error: Invalid object");
                  }
                break;
    
            case 'PUT':
                if (object.userName) {
                    func(this.db.updateUser(object.userName, object));
                  } else {
                    console.log("Error: Invalid object");
                  }
                break;
    
            case 'DELETE':
                if (object.userName) {
                    func(this.db.deleteUser(object.userName));
                  } else {
                    console.log("Error: Invalid object");
                  }
                break;
    
            default:
                console.log( 'Method not allowed' ); 
                break;
        }
    }
}
