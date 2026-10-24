import "dotenv/config";

import express from "express";
import routes from "./routes/notificationRoutes.js";
import cors from "cors"

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173"
}));

app.use(express.json());

app.get("/health", (req, res)=>{
    res.status(200).json({
    "service": "notifications-service",
    "status": "ok"
})
})

app.use("/notifications", routes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, ()=>{
    console.log("Notification service is statring on ", PORT);
})
