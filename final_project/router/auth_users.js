const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//USername must not be empty and unique
  return !users.some(user => user.username === username);  // Returns true if username is unique
};

//authenticate user (check username and password)
const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  return users.find(user => user.username === username && user.password === password) !== undefined;
};

// Only registered users can log in
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate a JWT token
  const token = jwt.sign({ username }, "secret_key", { expiresIn: '1h' }); // Replace "secret_key" with an environment variable in production
  
  //Optional
  // Add token to session
  req.session.authorization = { token, username };

  // respond with JWT token
  return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;  // Get the review from the query parameters
  const username = req.session?.authorization?.username; // Get the username from the session

  if (!username) {
    return res.status(401).json({ message: "Unauthorized"});
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Check if the book exists
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize the reviews object if not already present
  if (!book.reviews) {
    book.reviews = {};
  }

  // Modify or add the review
  book.reviews[username] = review;

  // Return the updated reviews
  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: book.reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;  // Get the ISBN from the URL parameters
  const username = req.session?.authorization?.username;  // Get the username from the session

  if (!username) {
    return res.status(401).json({ message: "Unauthorized: Please log in to delete your review" });
  }

  // Find the book by ISBN
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the book has reviews
  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "Review not found for this book" });
  }

  // Delete the review for the logged-in user
  delete book.reviews[username];

  // Return the updated reviews
  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
