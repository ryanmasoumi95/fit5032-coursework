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