const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;
const apiKey = "cynaurb9zvhy";
const secret =
  "fuc4kyue9c9cwth2rs4nhrqx6ftryv9sn4q8mf4bhyu6squ2w9xzttd4x7qmjnzb";

app.use(express.json());
app.use(cors({ origin: "*" }));

app.post("/generate-token", (req, res) => {
  const { userId, role } = req.body;
  const callId = "livestream_772e30a7-d0e8-4c11-a85f-f25ef256b3c0";
  console.log("Received request:", { userId, role, callId });
  if (!userId || !role) {
    return res.status(400).json({ error: "userId and role are required" });
  }
  try {
    const token = jwt.sign(
      {
        user_id: userId,
        role: role,
        call_cids: [`livestream:${callId}`],
        iss: "@stream-io/dashboard",
        iat: Math.round(Date.now() / 1000),
        exp: Math.round(Date.now() / 1000) + 60 * 60, // 1-hour expiration
      },
      secret,
      { algorithm: "HS256" }
    );
    console.log("Generated token:", token);
    res.json({ token });
  } catch (error) {
    console.error("Error generating token:", error.message, error.stack);
    res
      .status(500)
      .json({ error: "Failed to generate token", details: error.message });
  }
});

app.get("/test-client", (req, res) => {
  try {
    const token = jwt.sign(
      {
        user_id: "test-user",
        role: "viewer",
        iss: "@stream-io/dashboard",
        iat: Math.round(Date.now() / 1000),
        exp: Math.round(Date.now() / 1000) + 60 * 60,
      },
      secret,
      { algorithm: "HS256" }
    );
    res.json({ status: "Token generation OK", testToken: token });
  } catch (error) {
    res.status(500).json({ error: "Test failed", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
