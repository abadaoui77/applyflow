import "dotenv/config"
import pool from "../config/db.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

export async function createUser(email, password){
    /**
     * Recevoir l'email et le mot de passe.
    Générer un hash avec bcrypt.hash(password, 10).
    Insérer l'email et le hash dans PostgreSQL.
    Retourner uniquement les informations non sensibles du nouvel utilisateur.
     */

    const hash =  await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (email,  password_hash)
                        VALUES ($1, $2) RETURNING id, email;
                  `
   
    const res = await pool.query(query, [email, hash]);
    return res.rows[0];
    
}

export async function findUserByEmail(email) {
    const query = `SELECT id, email, password_hash FROM users WHERE email = $1`
    const response = await pool.query(query, [email]);
    if (response.rowCount === 0) {
        return null;
    }
    const user = response.rows[0];
    return user;
}


export async function authenticateUser(email, password) {
    const user = await findUserByEmail(email);
    if (!user) {
        return null;
    } 
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        return null;
    }

    return {
        id: user.id,
        email: user.email
    };
}

export function generateToken(user){
    if (!user) {
        return null;
    }
    const secretKey = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRATION || "1h";
    const payload = {
        sub : String(user.id),
        email : user.email
    }

    const token = jwt.sign(
        payload, 
        secretKey,
        {
            expiresIn : expiresIn,
            algorithm: "HS256"
        }
    )

    return token;


}