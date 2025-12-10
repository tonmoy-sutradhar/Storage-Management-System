import express from "express";

let port = 8000;

let app = express();
app.get("/", (req, res) => {
  res.send("Hello from Storage Management System");
});

app.listen(port, () => {
  console.log("Hello from server");
});
