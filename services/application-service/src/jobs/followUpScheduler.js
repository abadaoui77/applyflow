import "dotenv/config";
import { runFollowUpJob } from "./followUpJob.js";

const ONE_HOUR = 60 * 60 * 1000;

let running = false;

async function executeJob() {
  if (running) {
    console.log("Job déjà en cours, exécution ignorée");
    return;
  }

  running = true;

  try {
    await runFollowUpJob();
  } catch (error) {
    console.error("Erreur job de relance :", error.message);
  } finally {
    running = false;
  }
}

console.log("Planificateur de relances démarré");

await executeJob();

setInterval(executeJob, ONE_HOUR);