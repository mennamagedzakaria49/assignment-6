const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();

app.use(express.json());

app.post("/collection/books", async (req, res) => {
    try {
        const db = client.db("library");

        await db.createCollection("books", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["title"],
                    properties: {
                        title: {
                            bsonType: "string",
                            minLength: 1
                        }
                    }
                }
            }
        });

        res.json({ ok: 1 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/collection/authors", async (req, res) => {
    try {
        const db = client.db("library");

        const result = await db.collection("authors").insertOne({
            name: req.body.name,
            nationality: req.body.nationality
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/collection/logs/capped", async (req, res) => {
    try {
        const db = client.db("library");

        await db.createCollection("logs", {
            capped: true,
            size: 1024 * 1024
        });

        res.json({ ok: 1 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/collection/books/index", async (req, res) => {
    try {
        const db = client.db("library");

        const result = await db.collection("books").createIndex({
            title: 1
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/books", async (req, res) => {
    try {
        const db = client.db("library");

        const result = await db.collection("books").insertOne(req.body);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post("/books/batch", async (req, res) => {
    try {
        const db = client.db("library");

        const result = await db.collection("books").insertMany(req.body);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/logs", async (req, res) => {
    try {
        const db = client.db("library");

        const result = await db.collection("logs").insertOne(req.body);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch("/books/:title", async (req, res) => {
    try {
        const db = client.db("library");

        const result = await db.collection("books").updateOne(
            { title: req.params.title },
            { $set: { year: 2022 } }
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message }); }
});

app.get("/books/title", async (req, res) => {
    try {
        const db = client.db("library");

        const book = await db.collection("books").findOne({
            title: req.query.title
        });

        res.json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/books/year", async (req, res) => {
    try {
        const db = client.db("library");

        const from = Number(req.query.from);
        const to = Number(req.query.to);

        const books = await db.collection("books")
            .find({
                year: {
                    $gte: from,
                    $lte: to
                }
            })
            .toArray();

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/books/genre", async (req, res) => {
    try {
        const db = client.db("library");

        const books = await db.collection("books")
            .find({
                genres: req.query.genre
            })
            .toArray();

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/books/skip-limit", async (req, res) => {
    try {
        const db = client.db("library");

        const books = await db.collection("books")
            .find({})
            .sort({ year: -1 })
            .skip(2)
            .limit(3)
            .toArray();

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/books/year-integer", async (req, res) => {
    try {
        const db = client.db("library");

        const books = await db.collection("books")
            .find({
                year: { $type: "int" }
            })
            .toArray();

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/books/exclude-genres", async (req, res) => {
    try {
        const db = client.db("library");

        const books = await db.collection("books")
            .find({
                genres: {
                    $nin: ["Horror", "Science Fiction"]
                }
            })
            .toArray();

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete("/books/before-year", async (req, res) => {
    try {
        const db = client.db("library");

        const year = Number(req.query.year);

        const result = await db.collection("books").deleteMany({
            year: { $lt: year }
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/books/aggregate1", async (req, res) => {
    try {
        const db = client.db("library");

        const books = await db.collection("books")
            .aggregate([
                { $match: { year: { $gt: 2000 } } },
                { $sort: { year: -1 } }
            ])
            .toArray();

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/books/aggregate2", async (req, res) => {
    try {
        const db = client.db("library");

        const books = await db.collection("books")
            .aggregate([
                { $match: { year: { $gt: 2000 } } },
                { $project: { _id: 0, title: 1, author: 1, year: 1 } }
            ])
            .toArray();

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/books/aggregate3", async (req, res) => {
    try {
        const db = client.db("library");

        const books = await db.collection("books")
            .aggregate([
                { $unwind: "$genres" },
                { $project: { _id: 0, title: 1, genres: 1 } }
            ])
            .toArray();

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/books/aggregate4", async (req, res) => {
    try {
        const db = client.db("library");

        const books = await db.collection("books")
            .aggregate([
                {
                    $lookup: {
                        from: "logs",
                        let: {
                            bookId: { $toString: "$_id" }
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$book_id", "$$bookId"]
                                    }
                                }
                            }
                        ],
                        as: "logs"
                    }
                },
                {
                    $unwind: "$logs"
                },
                {
                    $project: {
                        _id: 0,
                        action: "$logs.action",
                        book_details: [
                            {
                                title: "$title",
                                author: "$author",
                                year: "$year"
                            }
                        ]
                    }
                }
            ])
            .toArray();

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const PORT = 3000;

const client = new MongoClient("mongodb://127.0.0.1:27017");

async function startServer() {
    try {
        await client.connect();

        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}

startServer();