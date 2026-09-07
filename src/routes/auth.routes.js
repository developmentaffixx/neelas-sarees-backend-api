const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, logout, refreshToken, forgotPassword, resetPassword, googleAuth } = require('../controllers/auth.controller');

const authLimiter      = rateLimit({ windowMs: 15 * 60 * 1000, max: 5,  message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' }, standardHeaders: true, legacyHeaders: false });
const registerLimiter  = rateLimit({ windowMs: 60 * 60 * 1000, max: 3,  message: { success: false, message: 'Too many registrations. Please try again later.' },       standardHeaders: true, legacyHeaders: false });
const forgotLimiter    = rateLimit({ windowMs: 60 * 60 * 1000, max: 3,  message: { success: false, message: 'Too many reset requests. Please try again later.' },        standardHeaders: true, legacyHeaders: false });
const googleLimiter    = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: 'Too many Google sign-in attempts. Please try again later.' }, standardHeaders: true, legacyHeaders: false });

const router = Router();
router.post('/register',        registerLimiter, register);
router.post('/login',           authLimiter,     login);
router.post('/logout',          logout);
router.post('/refresh',         refreshToken);
router.post('/forgot-password', forgotLimiter,   forgotPassword);
router.post('/reset-password',  resetPassword);
router.post('/google',          googleLimiter,   googleAuth);

module.exports = router;

