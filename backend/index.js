import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { MongoClient } from "mongodb";

config();

const app = express();
const client = new MongoClient(process.env.MONGO_URI)
app.use(cors());
app.use(express.json());

let db;

console.log("API KEY:", process.env.OPENAI_API_KEY?.slice(0, 5) + "...");

/* Establishes connection with the Database, served by MongoDB. This is used to store previous site generations. */
async function initDB() {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("✅ Connected to MongoDB: ", process.env.DB_NAME);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}
initDB();

/* Inserts results to the MDB. */
app.post("/api/save-requirements", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "DB not initialized" });
    const collection = db.collection("requirements");
    const result = await collection.insertOne(req.body);
    res.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("Mongo insert error:", err);
    res.status(500).json({ error: "Failed to save requirements" });
  }
});

/* For sidebar/recalling earlier generations */
app.get("/api/history", async (req, res) => {
  try {
    const collection = db.collection("requirements");
    const history = await collection.find().sort({ _id: -1 }).limit(10).toArray();
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

/* Extracts requirements from User Input. */
app.post("/api/requirements", async (req, res) => {
  const { description } = req.body;

  try {
    // Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Return ONLY valid JSON. Your response must be an object with exactly these keys: - "appName": a descriptive yet simple name for the application (user facing so must be formatted), - "entities": a list of only the important entities (e.g. Student, Course, Grade), - "roles": a list of roles (e.g. Teacher, Student, Admin), - "features": One or more features for each role identified, used to manipulate Entities as appropriate to the role (e.g. Teachers 'Add Courses', students 'Enrol' or 'View Timetable', admins 'Manage Reports', - "colorScheme": a pair of colours for this application ("primary" and "secondary"), - and "entityAttributes", a collection of attributes relevant to each entity. Input: "${description}"`,
          },
        ],
        temperature: 0,
      }),
    });

    const data = await response.json();

    const message = data?.choices?.[0]?.message?.content;

    if (!message) {
      return res.status(502).json({ error: "Unexpected AI response", raw: data });
    }

    // Parse returned JSON.
    let output;
    try {
      output = JSON.parse(message);
    } catch (err) {
      return res.status(500).json({ error: "Failed to parse AI output", raw: message });
    }

    res.json(output);
  } catch (err) {
    console.error("Error calling OpenAI:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000, () => console.log("Server running on 5000"));