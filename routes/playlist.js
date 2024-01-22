const express= require("express");
const {getPlaylistData}= require("../controller/playlist");

const router = express.Router();

router.post("/info",getPlaylistData);

exports.router=router;