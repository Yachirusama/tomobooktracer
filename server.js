const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  if (req.method === "GET" && !req.originalUrl.includes(".")) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    res.status(404).send("File Not Found");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
