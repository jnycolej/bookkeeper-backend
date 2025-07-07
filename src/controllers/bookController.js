// CRUD logic for books
const Book = require('../models/Book');

exports.getAllBooks = async (req, res) => {
    try {
        //Only return books belonging to this user
        const books = await Book.find({owner: req.user._id}).sort({createdAt: -1});
        return res.json(books);
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: 'Failed to fetch books.'});
    }
};

exports.createBook = async (req, res) => {
    try {
        // req.body holds the book data from the client
        // req.user._id was set by authMiddleware
        const newBook = new Book({
            title: req.body.title,
            series: req.body.series,
            author: req.body.author,
            isbn10: req.body.isbn10,
            isbn13: req.body.isbn13,
            genres: req.body.genres,
            publicationYear: req.body.publicationYear,
            pageCount: req.body.pageCount,
            format: req.body.format,
            status: req.body.status,
            owner: req.user._id
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
        const book = await Book.findOne({ _id: bookId, owner: req.user._id});
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
            { _id: bookId, owner: req.user._id },
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
        const deleted = await Book.findOneAndDelete({ _id: bookId, owner: req.user._id});
        if (!deleted) {
            return res.status(404).json({ error: 'Book not found or not yours.'});
        }
        return res.json({ message: 'Book deleted.'});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete the book.'});
    }
};

exports.countBooksByStatus = async (req, res) => {
    try {
        const counts = await Book.aggregate([
            { $match: { owner: req.user._id}},
            { $group: { _id: '$status', count: { $sum: 1}}}
        ]);

        const result = counts.reduce((acc, { _id, count}) => {
            acc[_id] = count;
            return acc;
        }, { read: 0, want: 0, owned: 0, currentlyReading: 0});
        return res.json(result);
    } catch (err) {
        console.error('Error fetching book counts:', err);
        return res.status(500).json({ error: err.message});
    }
};

// Returns all distinct genres for this user's books
exports.getDistinctGenres = async (req, res) => {
    try {
        const genres = await Book.distinct('genres', { owner: req.user._id});
        return res.json(genres.sort());
    } catch (err) {
        console.error('Error fetching genres:', err);
        return res.status(500).json({error: err.message});
    }
}