const borrow_book = require('./borrow_book');

let available_books = ["Moby Dick", "1984", "Pride and Prejudice"];


let message = borrow_book("1984", available_books);       // Borrowing  a book that is available
console.log(message);
console.log(available_books);


message = borrow_book("The Hobbit", available_books);         // Borrowing  a book that is not available
console.log(message);
console.log(available_books);

             
let empty_list = [];                                  // Borrowing  a book from an empty  list     
message = borrow_book("Moby Dick", empty_list);
console.log(message);
console.log(empty_list);
