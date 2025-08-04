const express = require('express');
const router = express.Router();
const { registerSchema, loginSchema } = require('../validators/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Enregistrement d’un nouvel utilisateur
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: monmotdepasse123
 *               role:
 *                 type: string
 *                 enum: [CLIENT, COIFFEUR, MODERATEUR, ADMIN]
 *                 example: CLIENT
 *     responses:
 *       200:
 *         description: Utilisateur inscrit avec succès
 *       400:
 *         description: Erreur de validation ou utilisateur déjà existant
 */


// POST /auth/register
//Inscription
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    try{
        const user = await prisma.user.create({
            data: { email, password: hashed, role },
        });
        res.json({ message: "Utilisateur créé", user });
    } catch (error) {
        res.status(400).json({ error: "Email déja utilisé ou autre erreur"});
    }
});




/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion d’un utilisateur
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: monmotdepasse123
 *     responses:
 *       200:
 *         description: Connexion réussie, JWT retourné
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Identifiants invalides
 */


//Connexion
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d'});
    res.json({ token });
});

module.exports = router;