import { getAllApplications } from '../services/applicationService.js';
import { createApplication as createApplicationService } from '../services/applicationService.js';
import { getApplicationById as getApplicationByIdService } from '../services/applicationService.js';
import { updateApplication as updateApplicationService } from '../services/applicationService.js';
import { deleteApplication as deleteApplicationService } from '../services/applicationService.js';
import client from '../config/redis.js';

async function invalidateDashboardCache(userId) {
    const key = `dashboard:${userId}`;

    try {
        if (client.isReady) {
            await client.del(key);
        } else {
            console.warn("Redis indisponible : cache non invalidé");
        }
    } catch (error) {
        console.error("Erreur invalidation Redis :", error.message);
    }
}
export  async function getApplications  (req, res) {
    try {
        const id = Number(req.user.id);
        const applications =  await getAllApplications(id); 
        return res.status(200).json(applications);

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
        message : "Internal server error"
    })
    }
}

export async function createApplication (req,res) {
    const appBody = req.body;
    const userId = Number(req.user.id);

    try {
        const app =  await createApplicationService(appBody,userId);
        await invalidateDashboardCache(userId);
        return res.status(201).json(app);

    } catch (error) {
        console.error("CREATE APPLICATION ERROR:", error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
    
};

export async function getApplicationById(req, res) {
    const id  =  Number(req.params.id);
    const user_id = Number(req.user.id);
    try {
        const app = await getApplicationByIdService(user_id,id);
        if (!app) {
            return res.status(404).json({
                message: "Application was not found"
             })
        }
        return res.json(app)
        
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
};

export async function updateApplication(req,res){
    const id = Number(req.params.id);
    const user_id = Number(req.user.id);
    const app =  req.body;
    try {
        const updatedApp =  await updateApplicationService(user_id,id, app);
        if (updatedApp) {
            await invalidateDashboardCache(user_id);
            return res.json(updatedApp);
        }
        return res.status(404).json({
            message: "No app was found"
        })
    } catch (error) {
            return res.status(500).json({
                message: "Internal server error"
            })
    }
    
};  



export async function deleteApplication(req, res) {
    const id = Number(req.params.id);
    const user_id = Number(req.user.id);

    try {

        const deleted = await deleteApplicationService(user_id,id);

        if (!deleted) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        await invalidateDashboardCache(user_id);

        return res.status(200).json({
            message: "Application was successfully deleted"
        });

        
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }

};