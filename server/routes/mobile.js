const express = require("express");
const router = express.Router();
const mobileController = require("../controllers/mobileController");
const { requireAuth } = require("../config/auth");
const path = require("path");

router.get("/news", mobileController.getNews);
router.post("/login", mobileController.login);
router.post("/signup", mobileController.signup);
module.exports = router;
