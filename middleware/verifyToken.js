import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
    const token = req.headers.authorization;
    if (token) {
        const tokenBearer = token.split(" ")[1];
        try {
            const decoded = jwt.verify(tokenBearer, process.env.JWT_KEY);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: "Invalid token" });
        }
    } else {
        res.status(401).json({ message: "no token provided" });
    }
}

export function verifyTokenAndAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "you are not allowed, Admin Only" });
        }
    });
}

export function verifyTokenAndUserOnly(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user._id === req.params.id) {
            next();
        } else {
            return res.status(403).json({ message: "you are not allowed, User Only" });
        }
    });
}

export function verifyTokenAuthorization(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user._id === req.params.id || req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "you are not allowed, User Only and Admin" });
        }
    });
}
