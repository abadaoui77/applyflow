
import test from "node:test";
import assert from "node:assert/strict";

const AUTH_URL = "http://localhost:3001";
const APP_URL = "http://localhost:3000";
const NOTIFICATION_URL = "http://localhost:3002";

// Emails uniques pour pouvoir relancer les tests
const uniqueId = `${Date.now()}-${process.pid}`;

const user1 = {
    email: `test-${uniqueId}@example.com`,
    password: "TestPassword123!"
};

const user2 = {
    email: `test2-${uniqueId}@example.com`,
    password: "TestPassword123!"
};

// Fonction pour envoyer une requête HTTP
async function apiRequest(url, method = "GET", token = null, body = null) {
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (body !== null) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
        method,
        headers,
        body: body === null ? undefined : JSON.stringify(body)
    });

    const data = await response.json();

    return {
        status: response.status,
        data
    };
}

test("Tests d'intégration ApplyFlow", async (t) => {
    let token1;
    let token2;
    let applicationId;

    try {
        // TEST 1 : JWT obligatoire
        await t.test("Refuser une requête sans JWT", async () => {
            const res = await apiRequest(`${APP_URL}/applications`);

            assert.equal(res.status, 401);
        });

        // TEST 2 : Inscription
        await t.test("Inscription des utilisateurs", async () => {
            const res1 = await apiRequest(
                `${AUTH_URL}/auth/register`,
                "POST",
                null,
                user1
            );

            const res2 = await apiRequest(
                `${AUTH_URL}/auth/register`,
                "POST",
                null,
                user2
            );

            assert.equal(res1.status, 201);
            assert.equal(res2.status, 201);
            assert.ok(res1.data.id);
            assert.ok(res2.data.id);
        });

        // TEST 3 : Connexion
        await t.test("Connexion et récupération JWT", async () => {
            const res1 = await apiRequest(
                `${AUTH_URL}/auth/login`,
                "POST",
                null,
                user1
            );

            const res2 = await apiRequest(
                `${AUTH_URL}/auth/login`,
                "POST",
                null,
                user2
            );

            assert.equal(res1.status, 200);
            assert.equal(res2.status, 200);

            token1 = res1.data.token;
            token2 = res2.data.token;

            assert.ok(token1);
            assert.ok(token2);
        });

        // TEST 4 : Création
        await t.test("Créer une candidature", async () => {
            const res = await apiRequest(
                `${APP_URL}/applications`,
                "POST",
                token1,
                {
                    company: "TEST_APPLYFLOW",
                    role: "Backend Developer",
                    status: "TO_APPLY",
                    offer_url: "https://example.com",
                    notes: "Test automatisé"
                }
            );

            assert.equal(res.status, 201);
            assert.equal(res.data.company, "TEST_APPLYFLOW");
            assert.equal(res.data.status, "TO_APPLY");

            applicationId = res.data.id;
            assert.ok(applicationId);
        });

        // TEST 5 : Lecture
        await t.test("Consulter ses candidatures", async () => {
            const res = await apiRequest(
                `${APP_URL}/applications`,
                "GET",
                token1
            );

            assert.equal(res.status, 200);
            assert.ok(Array.isArray(res.data));

            const found = res.data.some(
                app => app.id === applicationId
            );

            assert.equal(found, true);
        });

        // TEST 6 : Sécurité entre utilisateurs
        await t.test("Bloquer l'accès d'un autre utilisateur", async () => {
            const res = await apiRequest(
                `${APP_URL}/applications/${applicationId}`,
                "GET",
                token2
            );

            assert.equal(res.status, 404);
        });

        // TEST 7 : Dashboard avant modification
        await t.test("Dashboard après création", async () => {
            const res = await apiRequest(
                `${APP_URL}/dashboard`,
                "GET",
                token1
            );

            assert.equal(res.status, 200);
            assert.equal(res.data.total, 1);
            assert.equal(res.data.toApply, 1);
        });

        // TEST 8 : Modification
        await t.test("Modifier le statut d'une candidature", async () => {
            const res = await apiRequest(
                `${APP_URL}/applications/${applicationId}`,
                "PUT",
                token1,
                {
                    company: "TEST_APPLYFLOW",
                    role: "Backend Developer",
                    status: "APPLIED",
                    offer_url: "https://example.com",
                    notes: "Statut modifié"
                }
            );

            assert.equal(res.status, 200);
            assert.equal(res.data.status, "APPLIED");
        });

        // TEST 9 : Invalidation Redis
        await t.test("Dashboard actualisé après modification", async () => {
            const res = await apiRequest(
                `${APP_URL}/dashboard`,
                "GET",
                token1
            );

            assert.equal(res.status, 200);
            assert.equal(res.data.total, 1);
            assert.equal(res.data.applied, 1);
            assert.equal(res.data.toApply, 0);
        });

        // TEST 10 : Notifications
        await t.test("Consulter ses notifications avec JWT", async () => {
            const res = await apiRequest(
                `${NOTIFICATION_URL}/notifications`,
                "GET",
                token1
            );

            assert.equal(res.status, 200);
            assert.ok(Array.isArray(res.data));
        });

        // TEST 11 : Notifications protégées
        await t.test("Refuser les notifications sans JWT", async () => {
            const res = await apiRequest(
                `${NOTIFICATION_URL}/notifications`
            );

            assert.equal(res.status, 401);
        });

        // TEST 12 : Suppression
        await t.test("Supprimer une candidature", async () => {
            const res = await apiRequest(
                `${APP_URL}/applications/${applicationId}`,
                "DELETE",
                token1
            );

            assert.equal(res.status, 200);
        });

        // TEST 13 : Vérifier suppression
        await t.test("La candidature supprimée retourne 404", async () => {
            const res = await apiRequest(
                `${APP_URL}/applications/${applicationId}`,
                "GET",
                token1
            );

            assert.equal(res.status, 404);
        });

        // TEST 14 : Dashboard final
        await t.test("Dashboard après suppression", async () => {
            const res = await apiRequest(
                `${APP_URL}/dashboard`,
                "GET",
                token1
            );

            assert.equal(res.status, 200);
            assert.equal(res.data.total, 0);
        });

    } finally {
        // Nettoyage si un test échoue avant la suppression
        if (applicationId && token1) {
            try {
                await apiRequest(
                    `${APP_URL}/applications/${applicationId}`,
                    "DELETE",
                    token1
                );
            } catch (error) {
                console.error("Nettoyage échoué :", error.message);
            }
        }
    }
});
