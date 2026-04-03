import slugify   from 'slugify';
import { v4 as uuid } from 'uuid';
import Tenant    from '../models/Tenant.js';
import User      from '../models/User.js';
import { createError } from '../middleware/errorHandler.js';
import { signAccessToken, issueRefreshToken, COOKIE_OPTIONS } from './authController.js';

// ── POST /api/v1/tenants/register ─────────────────────────────────────────────
export const registerTenant = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { orgName, contactEmail, contactPhone, institution, plan } = req.body;

    if (!orgName || !contactEmail) {
      return next(createError('orgName and contactEmail are required.', 400));
    }

    // Guard: one tenant per user
    const existingUser = await User.findById(userId);
    if (existingUser?.tenantId) {
      return next(
        createError(
          'You are already associated with an organisation. Contact platform support to transfer ownership.',
          409
        )
      );
    }

    const baseSlug  = slugify(orgName, { lower: true, strict: true });
    const suffix    = Math.random().toString(36).slice(2, 6);
    const slug      = `${baseSlug}-${suffix}`;

    const tenant = await Tenant.create({
      orgName,
      slug,
      contactEmail,
      contactPhone: contactPhone ?? null,
      institution:  institution  ?? '',
      plan:         plan         ?? 'free',
      owner:        userId,
      members:      [userId],
    });

    // Elevate user to organiser and bind to tenant, returning the updated document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: 'organizer', tenantId: tenant._id },
      { new: true } // We need the updated document to generate the new token!
    );

    // FIX: Generate a fresh token pair reflecting the new role and tenantId
    const family       = uuid();
    const accessToken  = signAccessToken(updatedUser);
    const refreshToken = await issueRefreshToken(updatedUser._id, family);

    // Overwrite the client's old session cookie with the new one
    res.cookie('ztic_refresh', refreshToken, COOKIE_OPTIONS);

    // Return the new accessToken and updated user object so the client's authStore can update instantly
    res.status(201).json({
      success: true,
      message: 'Organisation registered. Welcome to ZTic for Organisers.',
      data: {
        accessToken,
        user: {
          _id:              updatedUser._id,
          name:             updatedUser.name,
          email:            updatedUser.email,
          phone:            updatedUser.phone,
          role:             updatedUser.role,
          tenantId:         updatedUser.tenantId,
          preferredChannel: updatedUser.preferredChannel,
        },
        tenant
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(createError('Organisation slug already exists. Please try a slightly different name.', 409));
    }
    next(err);
  }
};

// ── GET /api/v1/tenants/me ────────────────────────────────────────────────────
export const getMyTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.tenant._id)
      .populate('owner',   'name email phone')
      .populate('members', 'name email phone role');

    if (!tenant) return next(createError('Tenant not found.', 404));

    res.json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/v1/tenants/me/branding ─────────────────────────────────────────
export const updateBranding = async (req, res, next) => {
  try {
    const { primaryColor, logoUrl, customDomain, tagline } = req.body;

    const isOwner = req.tenant.owner.toString() === req.user.sub;
    if (!isOwner && req.user.role !== 'admin') {
      return next(createError('Only the organisation owner can update branding.', 403));
    }

    const updated = await Tenant.findByIdAndUpdate(
      req.tenant._id,
      {
        $set: {
          'branding.primaryColor': primaryColor ?? req.tenant.branding?.primaryColor,
          'branding.logoUrl':      logoUrl      ?? req.tenant.branding?.logoUrl,
          'branding.customDomain': customDomain ?? req.tenant.branding?.customDomain,
          'branding.tagline':      tagline      ?? req.tenant.branding?.tagline,
        },
      },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/v1/tenants/me ──────────────────────────────────────────────────
export const updateTenant = async (req, res, next) => {
  try {
    const isOwner = req.tenant.owner.toString() === req.user.sub;
    if (!isOwner && req.user.role !== 'admin') {
      return next(createError('Only the organisation owner can update these details.', 403));
    }

    const allowed = ['orgName', 'contactEmail', 'contactPhone', 'institution'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const updated = await Tenant.findByIdAndUpdate(
      req.tenant._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/v1/tenants/me/members ───────────────────────────────────────────
export const addMember = async (req, res, next) => {
  try {
    const isOwner = req.tenant.owner.toString() === req.user.sub;
    if (!isOwner && req.user.role !== 'admin') {
      return next(createError('Only the organisation owner can add members.', 403));
    }

    const { contact } = req.body; 
    if (!contact) return next(createError('contact (email or phone) is required.', 400));

    const isEmail  = contact.includes('@');
    const query    = isEmail ? { email: contact } : { phone: contact };
    const newMember = await User.findOne(query);

    if (!newMember) {
      return next(
        createError(
          'No ZTic account found for that contact. ' +
          'The user must sign in at least once before being added.',
          404
        )
      );
    }

    if (req.tenant.members.map((m) => m.toString()).includes(newMember._id.toString())) {
      return next(createError('User is already a member of this organisation.', 409));
    }

    await Tenant.findByIdAndUpdate(req.tenant._id, {
      $addToSet: { members: newMember._id },
    });

    await User.findByIdAndUpdate(newMember._id, {
      role:     'organizer',
      tenantId: req.tenant._id,
    });

    res.json({ success: true, message: `${contact} added as co-organiser.` });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/v1/tenants/me/members/:userId ─────────────────────────────────
export const removeMember = async (req, res, next) => {
  try {
    const isOwner = req.tenant.owner.toString() === req.user.sub;
    if (!isOwner && req.user.role !== 'admin') {
      return next(createError('Only the organisation owner can remove members.', 403));
    }

    const { userId } = req.params;

    if (userId === req.tenant.owner.toString()) {
      return next(createError('Owner cannot remove themselves from the organisation.', 400));
    }

    await Tenant.findByIdAndUpdate(req.tenant._id, {
      $pull: { members: userId },
    });

    await User.findByIdAndUpdate(userId, {
      role:     'attendee',
      tenantId: null,
    });

    res.json({ success: true, message: 'Member removed from organisation.' });
  } catch (err) {
    next(err);
  }
};
