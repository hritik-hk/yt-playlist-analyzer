const express = require("express");
const path = require("path");
require("dotenv").config();
const cors = require("cors");
const playlistRouter= require("./routes/playlist");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

//to serve static files in publics
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/playlist", playlistRouter.router);

app.listen(PORT, () => console.log(`server running at ${PORT}`));
