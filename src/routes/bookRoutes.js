const express = require('express');
const router = express.Router();
const Book = require('../models/Book'); // Import the Mongoose model

//Route to count books by status
router.get('/count', async(req, res) => {
  try {
    //Counts each book by the reading status
    const countByStatus = await Book.aggregate([
      { 
        $group: { 
          _id: "$status", 
          count: { $sum: 1 }}}
    ]);

    //Initializes to keep track of the counts
    const counts = {
      read: 0,
      unread: 0,
      currently_reading: 0
    };

    //Makes sure that each of the books counted are unique and not repeated
    countByStatus.forEach(({ _id, count}) => {
      if (_id) {
        counts[_id] = count;
      }
    });

    res.json(counts); //returns the finished counts
  } catch (error) {
      console.error("Error fetching book counts:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get all unique genres
router.get('/genres', async (req, res) => {
  try {
    const genres = await Book.distinct('genres');
    res.status(200).json(genres.sort());
  } catch (error) {
    console.error('Error fetching genres:', error.message);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});



// Get a book by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book details' });
  }
});

// Add a new book
router.post('/', async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json({ message: 'Book added successfully' });
  } catch (error) {
    console.error('Error saving book:', error);
    res.status(500).json({ error: 'Error saving book' });
  }
});

// Update a book by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBook = req.body;

    const result = await Book.findByIdAndUpdate(id, updatedBook, { new: true });

    if (!result) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({ message: 'Book updated successfully' });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

//Remove a book by id


module.exports = router;
