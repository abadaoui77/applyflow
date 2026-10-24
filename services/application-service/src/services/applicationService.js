
import pool from "../config/db.js";


export async function getAllApplications(user_id) {
    const applications = await pool.query('SELECT *  from applications WHERE user_id = $1', [user_id]);
    return applications.rows;
}

export async function createApplication(applicationData, user_id){
   const { company, role , status,  offer_url,notes} = applicationData;
    const result = await pool.query(
  `
    INSERT INTO applications (company, role, status, offer_url, notes, user_id,applied_at)
    VALUES ($1, $2, $3, $4, $5, $6,
    CASE
        WHEN $3::varchar = 'APPLIED' THEN NOW()
        ELSE NULL

    END
    )

    

    RETURNING *
  `,
  [company, role, status, offer_url, notes, user_id]
);
    return result.rows[0];
}

export async function getApplicationById(user_id, id)  {
    const response = await pool.query(
            `SELECT * FROM applications WHERE user_id = $1 AND id =$2 
            `,
            [user_id,id]
        )

     return  response.rows[0];
};

export async function updateApplication(user_id , id, applicationData) {
    const {
        company,
        role,
        status,
        offer_url,
        notes
    } = applicationData;

    const result = await pool.query(
        `
        UPDATE applications
        SET
            company = $1,
            role = $2,
            status = $3,
            offer_url = $4,
            notes = $5,
            applied_at = 
            CASE
            WHEN $3::varchar = 'APPLIED' AND applied_at IS NULL THEN NOW()
            ELSE applied_at
            END
        WHERE user_id = $6 AND id = $7
        RETURNING *
        `,
        [company, role, status, offer_url, notes,user_id, id]
    );

    return result.rows[0];
}

export async function deleteApplication (user_id, id) {
    const res = await pool.query(`
        DELETE FROM applications WHERE user_id = $1 AND id = $2
        `
        ,[user_id, id]
    )

    const success = res.rowCount > 0;
    return success;
}


export async function getDashboardStats(userId) {
  const applcications =  await getAllApplications(userId);
  /**
   * Calculer le nombre total de candidatures.
     Calculer le nombre de candidatures ayant le statut APPLIED.
    Retourner un objet contenant total et applied.
   */

    const total = applcications.length;
    const applied = applcications.filter(app=> app.status === "APPLIED" ).length;
    const toApply = applcications.filter(app=> app.status === "TO_APPLY" ).length;
    const interviews = applcications.filter(app=> app.status === "HR_INTERVIEW" || app.status === "TECH_INTERVIEW" ).length;
    const rejected = applcications.filter(app=> app.status === "REJECTED" ).length;
    const offers = applcications.filter(app=> app.status === "OFFER" ).length;
    

    return {
        total,
        applied,
        toApply,
        interviews,
        rejected,
        offers
    }
}

export async function getApplicationsToFollowUp() {
    const response = await pool.query(
        `
        SELECT id, user_id, company, applied_at
        FROM applications
        WHERE status = 'APPLIED' AND
        applied_at <= NOW() - INTERVAL '9 days';
        `
    )
    return response.rows;
}



