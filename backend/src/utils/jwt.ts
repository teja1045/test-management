import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthUser } from '../types';

export const signToken = (payload: AuthUser) => jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token: string): AuthUser => jwt.verify(token, env.jwtSecret) as AuthUser;
