// class BooksDB extends DB {
//     constructor() {
//         super("books");
//     }
// }

class Book {
    constructor(data) {
        this.id = data.id || null;
        this.title = data.title;
        this.author = data.author;
        this.year = data.year;
        this.status = data.status || 'available';
        this.image = data.image || '/images/default-book.jpg';
        this.description = data.description || '';
    }
}

class BooksDB extends DB {
    constructor() {
        super('libraryBooks');
    }

    searchBooks(query) {
        const books = this.load();
        return books.filter(book => 
            book.title.includes(query) || 
            book.author.includes(query)
        );
    }

    addBook(bookData) {
        const newBook = new Book(bookData);
        return this.add(newBook);
    }
}

// הוספת נתונים התחלתיים
function initializeBooks() {
    const booksDB = new BooksDB();
    const existingBooks = booksDB.load();
    
    if (existingBooks.length === 0) {
        const initialBooks = [
            {
                title: 'מלחמה ושלום',
                author: 'לב טולסטוי',
                year: 1869,
                status: 'available',
                image: '/images/war-and-peace.jpg'
            },
            {
                title: 'האלכימאי',
                author: 'פאולו קואלו',
                year: 1988,
                status: 'available',
                image: '/images/alchemist.jpg'
            }
        ];

        initialBooks.forEach(book => booksDB.addBook(book));
    }
}

// קריאה לפונקציה בעת טעינת האפליקציה
initializeBooks();