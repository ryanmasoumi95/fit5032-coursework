const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

const db = admin.firestore();

exports.countBooks = onRequest((request, response) => {
  cors(request, response, async () => {
    try {
      const booksSnapshot = await db.collection("books").get();

      const count = booksSnapshot.size;

      response.status(200).json({
        count: count
      });
    } catch (error) {
      console.error("Error getting book count:", error);

      response.status(500).json({
        error: "Unable to get book count"
      });
    }
  });
});

exports.addCapitalizedBook = onRequest((request, response) => {
  cors(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).json({
        error: "Method not allowed"
      });
      return;
    }

    try {
      const { isbn, name } = request.body;

      if (isbn === undefined || !name) {
        response.status(400).json({
          error: "ISBN and book name are required"
        });
        return;
      }

      const numericIsbn = Number(isbn);

      if (Number.isNaN(numericIsbn)) {
        response.status(400).json({
          error: "ISBN must be a number"
        });
        return;
      }

      const capitalizedName = String(name).toUpperCase();

      const bookDocument = await db.collection("books").add({
        isbn: numericIsbn,
        name: capitalizedName
      });

      response.status(200).json({
        message: "Book added and capitalized successfully",
        id: bookDocument.id,
        isbn: numericIsbn,
        name: capitalizedName
      });
    } catch (error) {
      console.error("Error adding capitalized book:", error);

      response.status(500).json({
        error: "Unable to add book"
      });
    }
  });
});