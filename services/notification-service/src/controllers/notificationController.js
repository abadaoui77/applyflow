import {getNotificationsByUserId} from "../services/notificationService.js"
import {markNotificationAsRead} from "../services/notificationService.js"

export async function getNotifications(req, res){
    const user_id = Number(req.user.id);
    try {
        const response = await getNotificationsByUserId(user_id);
        return res.status(200).json(
            response
        )
    } catch (error) {
         return res.status(500).json(
            {
                message: "Internal error server"
            }
        )
    }
}

export async function markNotificationAsReadController(req, res){
    const user_id = Number(req.user.id);
    const notification_id = Number(req.params.id);
    if (!Number.isSafeInteger(notification_id) || notification_id <= 0) {
        return res.status(400).json({
            message: "Invalid notification ID"
        });
    }
    try {
        const response = await markNotificationAsRead(user_id, notification_id);
        if (!response) {
            return res.status(404).json({
                message: "Notification not found"
         });
        }

        return res.status(200).json(
            response
        )
    } catch (error) {
         return res.status(500).json(
            {
                message: "Internal error server"
            }
        ) 
    }
}   