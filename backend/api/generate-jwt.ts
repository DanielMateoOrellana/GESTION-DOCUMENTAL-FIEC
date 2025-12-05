// scripts/generate-jwt.js
require('dotenv').config();           // Para leer el .env
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'cámbiame-en-.env';

// Aquí simulas el payload que usa tu AuthService
const payload = {
  sub: 1, // id del usuario
  email: 'admin@fiec.espol.edu.ec',
  role: 'ADMINISTRADOR', // tiene que coincidir con tu enum UserRole
};

const expiresIn = process.env.JWT_EXPIRES_IN
  ? Number(process.env.JWT_EXPIRES_IN)
  : 3600; // segundos

const token = jwt.sign(payload, secret, { expiresIn });

console.log('JWT generado:\n');
console.log(token);
console.log('\nPayload usado:', payload);
console.log('\nExpira en (segundos):', expiresIn);
