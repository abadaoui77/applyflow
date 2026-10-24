import "dotenv/config"
import pool from "./config/db.js";

async function testDB() {
    try {
        const res = await pool.query("SELECT 1");
        console.log("PG connexions succeded",res.rowCount >0);
    } catch (error) {
        console.log("Connexion to pg has failed", error.message);
    }
}

await testDB();
await pool.end();