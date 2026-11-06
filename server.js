// HW5 - Building a Simple Query String Web Server
// Name: James Sumo-Kabbah
// Description: Search books using Express and MySQL.
// Results are displayed in JSON or HTML format.


// Import Express and MySQL connection pool
const express = require("express");
const pool = require("./mysql");

// Create Express application
const app = express();
const PORT = 3000;


// Function to safely display text in HTML
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


// Create GET route to search books
app.get("/", async (req, res) => {
    try {

        // Get category and author from URL
        const { category, author } = req.query;

        // SQL query to select books
        let sql = "SELECT * FROM books";
        let values = [];

        // Search books by category
        if (category) {
            sql += " WHERE category = ?";
            values.push(category);
        }

        // Search books by author
        else if (author) {
            sql += " WHERE author = ?";
            values.push(author);
        }

        // Execute SQL query and get results
        const [results] = await pool.execute(sql, values);


        // Get the formatting option from URL
        const { formatting } = req.query;

        // Display results as HTML if text is selected
        if (formatting === "text") {

            // Create HTML heading
            let html = "<h1>Book Search Results</h1>";

            // Display message if no books are found
            if (results.length === 0) {
                html += "<p>No books found.</p>";
            }

            // Display each book in HTML format
            else {
                results.forEach((book) => {
                    html += `
                        <hr>
                        <h3>${escapeHtml(book.title)}</h3>
                        <p>Book ID: ${book.bookid}</p>
                        <p>Author: ${escapeHtml(book.author)}</p>
                        <p>Category: ${escapeHtml(book.category)}</p>
                        <p>Price: $${Number(book.price).toFixed(2)}</p>
                    `;
                });
            }

            // Send HTML results to browser
            res.type("html").send(html);

        } else {

            // Return JSON by default or when JSON is selected
            res.json(results);
        }

    } catch (error) {

        // Handle database connection or query errors
        console.error("Database error:", error);

        // Return error message to browser
        res.status(500).json({
            error: "Database query failed"
        });
    }
});


// Start Express server on port 3000
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});