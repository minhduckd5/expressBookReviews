const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the token exists in the session
    const token = req.session.authorization?.token;

    if (!token) {
        return res.status(401).json({ message: "No token provided, please login" });
    }

    // Verify the token using JWT
    jwt.verify(token, "secret_key", (err, decoded) => {  // Replace 'secret_key' with your actual secret
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        // If the token is valid, attach the decoded username to the request
        req.username = decoded.username;  // Add the username decoded from the token to the request object

        // Call next to continue to the next middleware or route handler
        next();
    });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
