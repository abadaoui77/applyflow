import pool from '../config/db.js';
export async function getNotificationsByUserId(user_id) {
   const response =  await pool.query(
    `   
        SELECT * FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
    `,[user_id]
    );
    return response.rows;

}

export async function markNotificationAsRead(userId, notificationId) {
    const response = await pool.query(
        `
        UPDATE notifications
        SET is_read = true
        WHERE user_id = $1 AND id = $2
        RETURNING *
        `,
        [userId, notificationId]
    );
    return response.rows[0];
}