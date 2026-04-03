import crypto    from 'crypto';
import bcrypt    from 'bcryptjs';
import jwt       from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import User         from '../models/User.js';
import OtpToken     from '../models/OtpToken.js';
import RefreshToken from '../models/RefreshToken.js';
import { routeOtp } from '../services/notificationRouter.js';
import { createError } from '../middleware/errorHandler.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const OTP_LENGTH          = 6;
const BCRYPT_ROUNDS       = 10;
const MAX_OTP_ATTEMPTS    = 3;
const ACCESS_TOKEN_TTL    = '15m';
const REFRESH_TOKEN_TTL   = '7d';
const REFRESH_TTL_MS      = 7 * 24 * 60 * 60 * 1000;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   REFRESH_TTL_MS,
  path:     '/api/v1/auth',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

const signAccessToken = (user) =>
  jwt.sign(
    { sub: user._id, role: user.role, tenantId: user.tenantId ?? null },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

const issueRefreshToken = async (userId, family) => {
  const raw  = uuid();          // random UUID — stored as hash, returned raw once
  const hash = await bcrypt.hash(raw, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  await RefreshToken.create({ userId, tokenHash: hash, family, expiresAt });
  return raw;
};

// ── POST /auth/otp/send ───────────────────────────────────────────────────────
export const sendOtp = async (req, res, next) => {
  try {
    const { contact, channel } = req.body;

    if (!contact || !channel) {
      return next(createError('contact and channel are required', 400));
    }
    if (!['email', 'sms', 'whatsapp'].includes(channel)) {
      return next(createError('channel must be email, sms, or whatsapp', 400));
    }

    // Delete any existing OTP for this contact to avoid accumulation
    await OtpToken.deleteMany({ contact });

    const otp     = generateOtp();
    const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);

    await OtpToken.create({ contact, otpHash, channel });

    // Deliver via the selected channel
    await routeOtp(channel, contact, otp);

    res.json({ success: true, message: `OTP sent via ${channel}.` });
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/otp/verify ─────────────────────────────────────────────────────
export const verifyOtp = async (req, res, next) => {
  try {
    const { contact, otp } = req.body;

    if (!contact || !otp) {
      return next(createError('contact and otp are required', 400));
    }

    const record = await OtpToken.findOne({ contact });

    if (!record) {
      return next(createError('OTP expired or not found. Please request a new one.', 404));
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await OtpToken.deleteOne({ _id: record._id });
      return next(createError('Too many failed attempts. Please request a new OTP.', 429));
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);

    if (!isMatch) {
      await OtpToken.findByIdAndUpdate(record._id, { $inc: { attempts: 1 } });
      const remaining = MAX_OTP_ATTEMPTS - (record.attempts + 1);
      return next(createError(`Invalid OTP. ${remaining} attempt(s) remaining.`, 401));
    }

    // OTP correct — delete it immediately (single use)
    await OtpToken.deleteOne({ _id: record._id });

    // Upsert user — first verify creates the account
    const isEmail = contact.includes('@');
    const query   = isEmail ? { email: contact } : { phone: contact };
    const update  = {
      $setOnInsert: {
        [isEmail ? 'email' : 'phone']: contact,
        preferredChannel: record.channel,
      },
      $set: { isVerified: true },
    };
    const user = await User.findOneAndUpdate(query, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    // Issue token pair
    const family       = uuid();
    const accessToken  = signAccessToken(user);
    const refreshToken = await issueRefreshToken(user._id, family);

    res.cookie('ztic_refresh', refreshToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      data: {
        accessToken,
        user: {
          _id:              user._id,
          name:             user.name,
          email:            user.email,
          phone:            user.phone,
          role:             user.role,
          tenantId:         user.tenantId,
          preferredChannel: user.preferredChannel,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/magic-link/send ────────────────────────────────────────────────
export const sendMagicLink = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(createError('email is required', 400));

    // Sign a short-lived token containing the email
    const token = jwt.sign({ email }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const link  = `${process.env.CLIENT_URL}/auth/magic?token=${token}`;

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from:    `ZTic <noreply@${process.env.RESEND_DOMAIN}>`,
      to:      [email],
      subject: 'Your ZTic magic sign-in link',
      html: `
        <div style="font-family:'Space Grotesk',sans-serif;background:#1A1C1A;padding:48px;">
          <div style="max-width:480px;margin:0 auto;background:#FAF9F6;border:2px solid #1A1C1A;box-shadow:4px 4px 0 0 #800020;padding:40px;">
            <p style="font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:#800020;margin-bottom:16px;">
              ZTic — Magic Link
            </p>
            <p style="font-size:13px;line-height:1.75;color:rgba(26,28,26,0.7);margin-bottom:32px;">
              Click the button below to sign in. This link expires in 15 minutes
              and can only be used once.
            </p>
            <a href="${link}"
               style="display:inline-block;background:#1A1C1A;color:#fff;padding:16px 40px;
                      font-weight:900;font-size:12px;letter-spacing:0.22em;
                      text-transform:uppercase;text-decoration:none;
                      border:2px solid #1A1C1A;box-shadow:4px 4px 0 0 #800020;">
              Sign In to ZTic →
            </a>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: 'Magic link sent. Check your inbox.' });
  } catch (err) {
    next(err);
  }
};

// ── GET /auth/magic-link/verify?token= ───────────────────────────────────────
export const verifyMagicLink = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return next(createError('token is required', 400));

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch {
      return next(createError('Magic link is invalid or has expired.', 401));
    }

    const { email } = payload;

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { isVerified: true }, $setOnInsert: { email, preferredChannel: 'email' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const family       = uuid();
    const accessToken  = signAccessToken(user);
    const refreshToken = await issueRefreshToken(user._id, family);

    res.cookie('ztic_refresh', refreshToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      data: {
        accessToken,
        user: {
          _id: user._id, name: user.name, email: user.email,
          role: user.role, tenantId: user.tenantId,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/token/refresh ──────────────────────────────────────────────────
export const refreshAccessToken = async (req, res, next) => {
  try {
    const raw = req.cookies?.ztic_refresh;
    if (!raw) return next(createError('No refresh token', 401));

    // Find all tokens in the DB and compare hashes
    // We search by expiresAt > now to keep the scan narrow
    const validTokens = await RefreshToken.find({
      expiresAt: { $gt: new Date() },
    });

    let matched = null;
    for (const record of validTokens) {
      const isMatch = await bcrypt.compare(raw, record.tokenHash);
      if (isMatch) { matched = record; break; }
    }

    if (!matched) {
      // Possible reuse attack — clear cookie and return 401
      res.clearCookie('ztic_refresh', { path: '/api/v1/auth' });
      return next(createError('Refresh token invalid or expired. Please log in again.', 401));
    }

    // Reuse detection: if another token from the same family exists and was
    // already consumed, invalidate the entire family
    const familyTokenCount = await RefreshToken.countDocuments({ family: matched.family });
    if (familyTokenCount > 1) {
      await RefreshToken.deleteMany({ family: matched.family });
      res.clearCookie('ztic_refresh', { path: '/api/v1/auth' });
      return next(createError('Token reuse detected. Session invalidated.', 401));
    }

    // Rotate: delete old token, issue new pair
    await RefreshToken.deleteOne({ _id: matched._id });

    const user = await User.findById(matched.userId);
    if (!user) return next(createError('User not found', 404));

    const accessToken      = signAccessToken(user);
    const newRefreshToken  = await issueRefreshToken(user._id, matched.family);

    res.cookie('ztic_refresh', newRefreshToken, COOKIE_OPTIONS);

    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/logout ─────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    const raw = req.cookies?.ztic_refresh;

    if (raw) {
      // Best-effort deletion — find and remove the matching token
      const validTokens = await RefreshToken.find({ expiresAt: { $gt: new Date() } });
      for (const record of validTokens) {
        const isMatch = await bcrypt.compare(raw, record.tokenHash);
        if (isMatch) {
          await RefreshToken.deleteOne({ _id: record._id });
          break;
        }
      }
    }

    res.clearCookie('ztic_refresh', { path: '/api/v1/auth' });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// ── GET /auth/me ──────────────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub).select('-__v');
    if (!user) return next(createError('User not found', 404));
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
