
import "dotenv/config";
import amq from "amqplib";
import { getApplicationsToFollowUp } from "../services/applicationService.js";

export async function runFollowUpJob() {
    let connexion = null;
    let channel = null;

    try {
        // Connexion à RabbitMQ
        connexion = await amq.connect(process.env.RABBITMQ_URL);

        // Canal permettant de confirmer les publications
        channel = await connexion.createConfirmChannel();

        // Création de la file si elle n'existe pas
        await channel.assertQueue("applyflow_reminder", {
            durable: true
        });

        // Recherche des candidatures à relancer
        const applications = await getApplicationsToFollowUp();

        console.log(`${applications.length} candidature(s) à relancer`);

        // Publication des événements
        for (const application of applications) {
            const event = {
                type: "APPLICATION_FOLLOWUP_DUE",
                userId: application.user_id,
                applicationId: application.id,
                company: application.company
            };

            channel.sendToQueue(
                "applyflow_reminder",
                Buffer.from(JSON.stringify(event)),
                {
                    persistent: true
                }
            );
        }

        // Attendre les confirmations de RabbitMQ
        await channel.waitForConfirms();

        console.log("Job de relance terminé");

    } finally {
        try {
            if (channel) {
                await channel.close();
            }
        } finally {
            if (connexion) {
                await connexion.close();
            }
        }
    }
}
