const mysql = require("mysql");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const RENEWAL_TOKEN_SECRET = process.env.RENEWAL_TOKEN_SECRET;

function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

function generateRenewalToken(user) {
  return jwt.sign(user, RENEWAL_TOKEN_SECRET);
}

module.exports.getNews = async (req, res) => {
  try {
    const query =
      "SELECT date_art, titre_art, description_art, image_art, auteur_art FROM article";
    db.query(query, (err, result) => {
      if (err) {
        console.error("SQL error while fetching news data: " + err);
        return res.status(500).json({ error: "Error fetching news data" });
      }
      res.json(result);
    });
  } catch (error) {
    console.error("Error occurred: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    db.query(
      "SELECT * FROM compte WHERE id_type=? AND email_co=? AND mot_de_passe=?",
      [5, email, password],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (result.length > 0) {
          const user = { email: email }; // Simplified user object
          const accessToken = generateAccessToken(user);
          const renewalToken = generateRenewalToken(user);
          res
            .status(200)
            .json({ accessToken: accessToken, renewalToken: renewalToken });
        } else {
          res.status(401).json({ message: "User not found" });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user with the same email already exists
    db.query(
      "SELECT * FROM compte WHERE email_co = ?",
      [email],
      (err, result) => {
        if (err) {
          console.error("Error checking existing user:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (result.length > 0) {
          return res.status(400).json({ error: "User already exists" });
        }

        // Generate new access and renewal tokens for the new user
        const user = { email: email };
        const accessToken = generateAccessToken(user);
        const renewalToken = generateRenewalToken(user);

        // Insert the new user into the database
        db.query(
          "INSERT INTO compte (nom_utilisateur, email_co, mot_de_passe, id_type) VALUES (?, ?, ?, ?)",
          [name, email, password, 5],
          (err, results) => {
            if (err) {
              console.error("Error creating user:", err);
              return res.status(500).json({ error: "Internal server error" });
            }
            res.status(201).json({
              success: true,
              message: "User created successfully",
              accessToken: accessToken,
              renewalToken: renewalToken,
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error occurred during signup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
