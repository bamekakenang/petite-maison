import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { TokenPayload, AuthTokens } from '../types';
import logger from '../config/logger';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'fallback_secret';
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'];
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

export const generateTokens = (payload: TokenPayload): AuthTokens => {
  const accessToken = jwt.sign(payload as jwt.JwtPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);

  const refreshToken = jwt.sign(payload as jwt.JwtPayload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    logger.warn('Access token verification failed:', error);
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    logger.warn('Refresh token verification failed:', error);
    return null;
  }
};

export const getTokenExpiration = (token: string): number | null => {
  try {
    const decoded = jwt.decode(token) as any;
    return decoded?.exp || null;
  } catch {
    return null;
  }
};
