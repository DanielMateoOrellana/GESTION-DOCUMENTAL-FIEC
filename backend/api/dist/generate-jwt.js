"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'cámbiame-en-.env';
const payload = {
    sub: 1,
    email: 'admin@fiec.espol.edu.ec',
    role: 'ADMINISTRADOR',
};
const expiresIn = process.env.JWT_EXPIRES_IN
    ? Number(process.env.JWT_EXPIRES_IN)
    : 3600;
const token = jwt.sign(payload, secret, { expiresIn });
console.log('JWT generado:\n');
console.log(token);
console.log('\nPayload usado:', payload);
console.log('\nExpira en (segundos):', expiresIn);
//# sourceMappingURL=generate-jwt.js.map