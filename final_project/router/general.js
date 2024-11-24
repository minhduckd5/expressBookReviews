const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


// Register a new user
public_users.post("/register", function (req, res) {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  if (users.some(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Add the new user to the users array
  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully" });
});

//TASK10:
// // Use Axios to fetch the list of books from the /books endpoint
// public_users.get('/', async function (req, res) {
//   try {
//     // Use Axios to fetch the books data from the /books route
//     const response = await axios.get('http://localhost:5000/books');  // Make sure this URL matches your server setup

//     // Send back the data received from the /books endpoint as a response
//     return res.status(200).json(response.data);
//   } catch (error) {
//     // If something goes wrong, handle the error and return a failure message
//     console.error(error);
//     return res.status(500).json({ message: "Error fetching books from the server" });
//   }
// });

// // Endpoint to get the list of books
// public_users.get('/books', function (req, res) {
//   // Return the books data from the local booksdb.js
//   res.status(200).json(books);
// });

public_users.get('/', function (req, res) {
  // Use JSON.stringify to format the output nicely with indentation
  const formattedBooks = JSON.stringify(books, null, 2);  // 2 spaces for indentation
  res.status(200).send(formattedBooks);  // Send the formatted books list
});

// Get book details based on ISBN (book ID in this case)
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params; // Retrieve ISBN from request parameters

  const book = books[isbn]; // Look for the book using the ISBN (key)

  if (!book) {
    // If the book doesn't exist, return a 404 response
    return res.status(404).json({ message: "Book not found" });
  }

  // If the book is found, return the book details
  return res.status(200).json(book);
});

// //TASK 11:
// // Promise function to get the book details based on ISBN// Function to get the book details based on ISBN using Promise callbacks
// public_users.get('/isbn/:isbn', function (req, res) {
//   const { isbn } = req.params;  // Get ISBN from URL parameters

//   // Fetch the book details from the local /isbn/:isbn endpoint
//   axios.get(`http://localhost:5000/isbn/${isbn}`)
//     .then((response) => {
//       // Send the book details as the response
//       res.status(200).json(response.data);
//     })
//     .catch((error) => {
//       // Handle error if the request fails
//       console.error(error);
//       res.status(500).json({ message: "Error fetching book details from the server" });
//     });
// });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params; // Retrieve author from request parameters
  let result = [];

  // Iterate through all the books and check for the author
  for (let key in books) {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      result.push(books[key]);
    }
  }

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found for the specified author" });
  }

  // Return the books that match the author
  return res.status(200).json(result);
});

//Task 12
// Function to get book details by author using Promise callbacks
// public_users.get('/author/:author', function (req, res) {
//   const { author } = req.params;  // Get the author name from URL parameters

//   // Make the GET request to fetch books by the author using Axios
//   axios.get(`http://localhost:5000/author/${author}`)
//     .then((response) => {
//       // Send back the list of books by the author
//       res.status(200).json(response.data);
//     })
//     .catch((error) => {
//       // If the request fails, handle the error
//       console.error(error);
//       res.status(500).json({ message: "Error fetching books by author from the server" });
//     });
// });

// Get books based on title
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params; // Retrieve author from request parameters
  let result = [];

  // Iterate through all the books and check for the author
  for (let key in books) {
    if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
      result.push(books[key]);
    }
  }

  if (result.length === 0) {
    return res.status(404).json({ message: "No books found for the specified Title" });
  }

  // Return the books that match the author
  return res.status(200).json(result);
});

//Task 13
// Async function to get the book details based on Title using async/await
public_users.get('/title/:title', async function (req, res) {
  const { title } = req.params;  // Get the title from the URL parameters

  try {
    // Fetch the book details from the /title/:title endpoint using Axios
    const response = await axios.get(`http://localhost:5000/title/${title}`);  // Adjust URL if needed

    // Send back the book details as the response
    return res.status(200).json(response.data);
  } catch (error) {
    // If request fails, return a failure message
    console.error(error);
    return res.status(500).json({ message: "Error fetching book details from the server" });
  }
});


// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params; // Retrieve ISBN from request parameters
  const book = books[isbn]; // Find the book by ISBN

  if (!book) {
    // If the book doesn't exist, return a 404 response
    return res.status(404).json({ message: "Book not found" });
  }
  // Optional
  // if (!book.reviews || Object.keys(book.reviews).length === 0) {
  //   // If the book has no reviews, return a 404 response
  //   return res.status(404).json({ message: "No reviews available for this book" });
  // }

  // Return the reviews for the book
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
