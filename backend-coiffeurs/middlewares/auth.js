const jwt = require('jsonwebtoken');

function authMiddleware(roles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
      console.log("Utilisateur connecté :", payload);

      if (roles.length && !roles.includes(payload.role)) {
        return res.status(403).json({ error: 'Accès interdit' });
      }

      next();
    } catch {
      return res.status(401).json({ error: 'Token invalide' });
    }
  };
}


module.exports = authMiddleware;
