# 📚 Library Management System | Client-Server Web Application

A sophisticated single-page application (SPA) that simulates a complete library management system with client-server architecture, built using vanilla JavaScript, HTML, and CSS.

## 📋 Overview

**Library Management System** is a comprehensive web application developed as part of a Web Development course assignment. It demonstrates advanced front-end concepts by simulating a complete client-server architecture entirely in the browser. The system allows librarians to manage books, track activity, and maintain a database of library resources without requiring an external server.

## 💻 Technologies

- HTML5
- CSS3 (Responsive design, CSS Variables, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- Custom client-server simulation architecture
- Local Storage for data persistence
- Font Awesome for icons

## ✨ Key Features

- **Single Page Application (SPA)** - Seamless navigation without page reloads
- **Complete Authentication System** - Login and registration functionality
- **Book Management** - Add, edit, delete, and search operations
- **Advanced Filtering** - Filter books by multiple criteria
- **Action History** - Track all changes to the library database
- **User Activity Statistics** - Visual representation of library management actions
- **Responsive Design** - Mobile-friendly interface
- **Custom AJAX Simulation** - Client-server architecture within the browser
- **RTL Support** - Full Hebrew language support

## 🔧 Technical Implementation

### Client-Server Architecture
The application simulates a complete client-server architecture within the browser:

- **FXMLHttpRequest** - Custom implementation mimicking XMLHttpRequest
- **Network Simulation** - Artificial delays and message drops
- **Separate Servers** - AuthServer and BooksServer for different functionality
- **Database Classes** - UsersDB and BooksDB for data management

### Single Page Application
The app uses a custom router to handle navigation:
- Hash-based routing
- Dynamic template loading
- Page transitions without reloads

## 📁 Project Structure

```
/
├── Client/
│   ├── CSS/
│   │   └── styles.css           # Main stylesheet
│   └── JS/
│       ├── app.js               # Main application logic
│       ├── fajax.js             # AJAX simulation
│       └── network.js           # Network simulation
│
├── Database/
│   ├── BooksDB.js               # Book database management
│   └── UsersDB.js               # User database management
│
├── Server/
│   ├── auth_server.js           # Authentication server
│   └── books_server.js          # Books management server
│
└── index.html                   # Main HTML file with templates
```

## 📸 Screenshots

![Login Screen](screenshots/login.png)
*User authentication screen*

![Books Management](screenshots/books.png)
*Main book management interface*

![Add Book Form](screenshots/add-book.png)
*Form for adding new books*

![Action History](screenshots/history.png)
*User action history and statistics*



## 🔍 Application Flow

1. **Authentication** - Users start at the login page and can either login or register.
2. **Books Management** - After login, users can view, add, edit, or delete books.
3. **Search & Filter** - Users can search by title/author and filter by location/status.
4. **Action History** - Track all library management actions with detailed statistics.

