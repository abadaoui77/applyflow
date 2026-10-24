import "dotenv/config"
import amq from "amqplib"
import pool from "./config/db.js"
const  connexion = await amq.connect(process.env.RABBITMQ_URL);
const channel = await connexion.createChannel();
await channel.assertQueue("applyflow_reminder",{
    durable: true
});
await channel.consume("applyflow_reminder", async(message)=>{
    
    if (message === null) return;
    
    try {
        const messageToJSON = JSON.parse(message.content.toString());
        const {userId, applicationId, type, company } = messageToJSON;
        await pool.query(
            `
                INSERT INTO notifications (user_id, application_id, type, message)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (application_id, type) DO NOTHING;
            `,[userId, applicationId, type, `Pense à relancer ${company} ` ]
        )
        channel.ack(message);
    } catch (error) {
        console.error("Erreur traitement notification :", error.message);

        try {
            await channel.close();
        } catch (closeError) {
            console.error("Erreur fermeture canal :", closeError.message);
        }

        try {
            await connexion.close();
        } catch (closeError) {
            console.error("Erreur fermeture connexion :", closeError.message);
        }

        process.exit(1);
}
})
