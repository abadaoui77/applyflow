import express from "express";
import { getApplications, createApplication, getApplicationById, updateApplication, deleteApplication} from "../controllers/applicationController.js" ;
import authMiddleware from "../middlewares/authMiddleware.js"
import validateApplication from "../middlewares/validateApplication.js";
import validateApplicationId from "../middlewares/validateApplicationId.js";


const router = express.Router();
router.param("id", validateApplicationId);
router.use(authMiddleware);
router.get("/",getApplications);
router.get("/:id",getApplicationById);
router.post("/", validateApplication, createApplication);
router.put("/:id", validateApplication, updateApplication);
router.delete("/:id",deleteApplication);

export default router;
