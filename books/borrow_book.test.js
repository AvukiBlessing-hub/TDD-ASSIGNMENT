const borrow_book = require('./borrow_book');

test('borrows an available book', () => {
    const books = ["1984", "Moby Dick"];
    const message = borrow_book("1984", books);
    expect(message).toBe("You have borrowed '1984'.");
    expect(books).toEqual(["Moby Dick"]);
});

test('tries to borrow an unavailable book', () => {
    const books = ["Moby Dick"];
    const message = borrow_book("The Hobbit", books);
    expect(message).toBe("Sorry, 'The Hobbit' is not available.");
    expect(books).toEqual(["Moby Dick"]);
});

test('borrowing from empty list', () => {
    const books = [];
    const message = borrow_book("Moby Dick", books);
    expect(message).toBe("Sorry, 'Moby Dick' is not available.");
    expect(books).toEqual([]);
});
