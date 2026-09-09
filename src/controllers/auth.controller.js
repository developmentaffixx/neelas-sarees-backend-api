const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../lib/db');
const { serializeError } = require('../lib/errorHandler');
const { cuid } = require('../lib/cuid');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
  const refreshToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  domain: process.env.COOKIE_DOMAIN || undefined,
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = cuid();
    await pool.query(
      'INSERT INTO users (id, name, email, password, phone, role, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, hashedPassword, phone || null, 'CUSTOMER', false]
    );

    const { accessToken, refreshToken } = generateTokens(id, 'CUSTOMER');
    await pool.query('UPDATE users SET refreshToken = ? WHERE id = ?', [refreshToken, id]);

    res
      .cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 })
      .cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .status(201)
      .json({
        success: true,
        message: 'Registration successful',
        user: { id, name, email, role: 'CUSTOMER' },
        accessToken,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    await pool.query('UPDATE users SET refreshToken = ? WHERE id = ?', [refreshToken, user.id]);

    res
      .cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 })
      .cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({
        success: true,
        message: 'Login successful',
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        accessToken,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        await pool.query('UPDATE users SET refreshToken = NULL WHERE id = ?', [decoded.id]);
      } catch {}
    }
    res
      .clearCookie('accessToken', cookieOptions)
      .clearCookie('refreshToken', cookieOptions)
      .json({ success: true, message: 'Logged out successfully' });
  } catch {
    res.clearCookie('accessToken', cookieOptions).clearCookie('refreshToken', cookieOptions).json({ success: true });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (rows.length === 0 || rows[0].refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const user = rows[0];
    const { accessToken, refreshToken: newRefresh } = generateTokens(user.id, user.role);
    await pool.query('UPDATE users SET refreshToken = ? WHERE id = ?', [newRefresh, user.id]);

    res
      .cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 })
      .cookie('refreshToken', newRefresh, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({ success: true, accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// ─── Forgot Password ────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const [rows] = await pool.query('SELECT id, name FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    // Always respond with success to prevent email enumeration
    if (rows.length === 0) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const user = rows[0];
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour

    await pool.query(
      'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?',
      [tokenHash, expires, user.id]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${rawToken}`;

    await mailer.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Reset your Neela's Sarees password`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
          <h2 style="color:#92400e;margin-bottom:8px;">Password Reset</h2>
          <p style="color:#57534e;">Hi ${user.name},</p>
          <p style="color:#57534e;">We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#92400e;color:#fff;border-radius:100px;text-decoration:none;font-weight:600;">Reset Password</a>
          <p style="color:#a8a29e;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0;" />
          <p style="color:#a8a29e;font-size:12px;">Neela's Sarees &mdash; ${process.env.FRONTEND_URL}</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

// ─── Reset Password ──────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Token and new password are required' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?',
      [tokenHash, Date.now()]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired. Please request a new one.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query(
      'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL, refreshToken = NULL WHERE id = ?',
      [hashedPassword, rows[0].id]
    );

    res.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: serializeError(error) });
  }
};

// ─── Google OAuth ────────────────────────────────────────────────────────────
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'Google credential required' });

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) return res.status(400).json({ success: false, message: 'Could not get email from Google account' });

    // Find existing user by googleId or email
    let [rows] = await pool.query('SELECT * FROM users WHERE googleId = ? OR email = ?', [googleId, email]);
    let user;

    if (rows.length > 0) {
      user = rows[0];
      // Link googleId if signing in via email for the first time with Google
      if (!user.googleId) {
        await pool.query('UPDATE users SET googleId = ?, isVerified = true WHERE id = ?', [googleId, user.id]);
      }
    } else {
      // Create new user from Google profile
      const id = cuid();
      await pool.query(
        'INSERT INTO users (id, name, email, password, googleId, role, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, name, email, '', googleId, 'CUSTOMER', true]
      );
      user = { id, name, email, role: 'CUSTOMER' };
    }

    const { accessToken, refreshToken: newRefresh } = generateTokens(user.id, user.role);
    await pool.query('UPDATE users SET refreshToken = ? WHERE id = ?', [newRefresh, user.id]);

    res
      .cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 })
      .cookie('refreshToken', newRefresh, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({
        success: true,
        message: 'Google sign-in successful',
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        accessToken,
      });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Google sign-in failed. Please try again.', error: serializeError(error) });
  }
};

module.exports = { register, login, logout, refreshToken, forgotPassword, resetPassword, googleAuth };
