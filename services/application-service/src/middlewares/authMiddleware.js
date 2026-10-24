import "dotenv/config"
import jwt from "jsonwebtoken"

function authMiddleware(req, res, next){
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json(
            {
                message: "Unauthorised"
            }
        )
    }
    if (!authorization.startsWith("Bearer ")) {
        return res.status(401).json(
            {
                message: "Unauthorised"
            }
        )
    }

    const token = authorization.split(" ")[1];
    if (!token) {
         return res.status(401).json(
            {
                message: "Missing token"
            }
        )
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"]
        })
        const id = Number(decoded.sub);
        const email = decoded.email;
        if (!Number.isSafeInteger(id) || id <= 0 || typeof email !== "string" || !email.trim()) {
            return res.status(401).json(
            {
                message: "Invalid token payload"
            }
        )
        }
        req.user = {
            id: id,
            email: email.trim()
        }

    } catch (error) {
        return res.status(401).json(
            {
                message: "Unauthorised"
            }
        )
    }
    
 return next();
}

export default authMiddleware;
