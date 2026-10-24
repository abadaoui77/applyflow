import express from "express"
import authMiddleware from "../middlewares/authMiddleware.js";
import { getNotifications } from "../controllers/notificationController.js";
import { markNotificationAsReadController } from "../controllers/notificationController.js";
const router =  express.Router();
router.use(authMiddleware);
router.get("/", getNotifications);
router.patch("/:id/read", markNotificationAsReadController);
export default router;
