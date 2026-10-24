import {getDashboardStats} from "../services/applicationService.js"
import client from "../config/redis.js";

export async function getDashboard(req, res) {
    const id = Number(req.user.id);
    const key = `dashboard:${id}`;
    let stats = null;
    try {
        if (client.isReady) {
            const cached =  await client.get(key);
            if (cached !== null) {
                console.log("CACHE HIT");
                stats = JSON.parse(cached);
                return res.status(200).json(
                    stats
                );
            }
        }
        
    } catch (error) {
        console.error("Redis Get failed", error.message);
    }

    try {
        stats =  await getDashboardStats(id);
    } catch (error) {
         return res.status(500).json({
             message: "Internal server error"
         }
               
        );
    }

    try {
        if (client.isReady) {
            await client.set(key,
                JSON.stringify(stats),
                {
                    EX: 60
                }
            )
        }
    } catch (error) {
        console.error("Redis set failed", error.message);
    }

    return res.status(200).json(
                stats
    ); 
}