import "dotenv/config";

import express from "express";
import routes from "./routes/authRoutes.js";
import cors from "cors"

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173"
}));

app.use(express.json());

app.get("/health", (req, res)=>{
    res.status(200).json({
    "service": "auth-service",
    "status": "ok"
})
})

app.use("/auth", routes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=>{
    console.log("Auth service is statring on ", PORT);
})
