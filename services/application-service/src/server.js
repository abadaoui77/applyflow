import "dotenv/config"
import cors from "cors"
import express from "express";
import applicationRoutes from "./routes/applicationRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"
import redisClient from "./config/redis.js"



const app = express();
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173"
}))
app.use(express.json());
app.use("/applications", applicationRoutes);
app.use("/dashboard", dashboardRoutes);

redisClient.on("error", (error)=>{
  console.error(error.message);
})

try {
  await redisClient.connect();
  console.log("Redis connected");
} catch (error) {
  console.error(error.message);
}


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});


