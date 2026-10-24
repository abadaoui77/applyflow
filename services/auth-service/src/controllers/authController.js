
import {
    createUser,
    authenticateUser,
    generateToken
} from "../services/authService.js";

// Vérifier si une donnée est vide ou invalide
function isInvalidInput(input) {
    return typeof input !== "string" || !input.trim();
}

// Vérifier le format de l'email
function isInvalidEmail(email) {
    if (isInvalidInput(email)) {
        return true;
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const estValide = regex.test(email.trim());

    return !estValide;
}

// Vérifier le mot de passe (8 caractères minimum)
function isInvalidPassword(password) {
    if (isInvalidInput(password)) {
        return true;
    }

    const estValide = password.length >= 8;

    return !estValide;
}

// REGISTER
export async function register(req, res) {
    const email = req.body?.email;
    const password = req.body?.password;

    if (isInvalidEmail(email)) {
        return res.status(400).json({
            message: "Invalid email"
        });
    }

    if (isInvalidPassword(password)) {
        return res.status(400).json({
            message: "Password must contain at least 8 characters"
        });
    }

    try {
        const user = await createUser(
            email.trim().toLowerCase(),
            password
        );

        return res.status(201).json(user);

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        console.error("Register error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// LOGIN
export async function login(req, res) {
    const email = req.body?.email;
    const password = req.body?.password;

    if (isInvalidEmail(email)) {
        return res.status(400).json({
            message: "Invalid email"
        });
    }

    if (isInvalidInput(password)) {
        return res.status(400).json({
            message: "Password is required"
        });
    }

    try {
        const authUser = await authenticateUser(
            email.trim().toLowerCase(),
            password
        );

        if (!authUser) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = generateToken(authUser);

        return res.status(200).json({
            token: token
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
