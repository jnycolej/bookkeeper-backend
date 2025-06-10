// CRUD logic for books
const Book = require('../models/Book');

exports.getAllBooks = async (req, res) => {
    try {
        //Only return books belonging to this user
        const books = await Book.find({owner: req.userId}).sort({createdAt: -1});
        return res.json(books);
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: 'Failed to fetch books.'});
    }
};

exports.createBook = async (req, res) => {
    try {
        // req.body holds the book data from the client
        // req.userId was set by authMiddleware
        const newBook = new Book({
            title: req.body.title,
            author: req.body.author,
            genres: req.body.genres,
            publicationYear: req.body.publicationYear,
            pageCount: req.body.pageCount,
            status: req.body.status,
            owner: req.userId
        });
        const saved = await newBook.save();
        return res.status(201).json(saved);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create book.'});
    }
};

exports.getBookById = async (req, res) => {
    try {
        const bookId = req.params.id;
        //Find the book only if it belongs to this user
        const book = await Book.findOne({ _id: bookId, owner: req.userId});
        if(!book) {
            return res.status(404).json({ error: 'Book not found.'});
        }
        return res.json(book);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch the book.'});
    }
};

exports.updateBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        //When updating, ensure the book's owner is this user
        const updated = await Book.findOneAndUpdate(
            { _id: bookId, owner: req.userId },
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ error: 'Book not found or not yours.'});
        }
        return res.json(updated);
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: 'Failed to update the book.'});
    }
}

exports.deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        // Only delete if owner matches
        const deleted = await Book.findOneAndDelete({ _id: bookId, owner: req.userId});
        if (!deleted) {
            return res.status(404).json({ error: 'Book not found or not yours.'});
        }
        return res.json({ message: 'Book deleted.'});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete the book.'});
    }
};