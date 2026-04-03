import Tenant from '../models/Tenant.js';
import { createError } from './errorHandler.js';

/**
 * Resolves req.tenant from the tenantId claim inside the verified JWT.
 * Must be composed AFTER verifyAccessToken.
 *
 * Usage:
 *   router.use(verifyAccessToken, resolveTenant);
 *
 * Admins (platform-level) are exempt — they can operate across tenants
 * and req.tenant is left undefined for them unless explicitly resolved.
 */
export const resolveTenant = async (req, res, next) => {
  try {
    // Platform admin: bypass tenant resolution
    if (req.user?.role === 'admin') {
      return next();
    }

    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return next(
        createError(
          'No tenant associated with this account. ' +
          'Please complete organiser onboarding.',
          403
        )
      );
    }

    const tenant = await Tenant.findOne({ _id: tenantId, isActive: true });

    if (!tenant) {
      return next(createError('Tenant not found or inactive.', 404));
    }

    req.tenant = tenant;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Lightweight guard — verifies that the document being accessed
 * belongs to req.tenant. Call after fetching a document.
 *
 * Usage:
 *   assertTenantOwnership(doc, req, next);
 */
export const assertTenantOwnership = (doc, req, next) => {
  if (!doc) return next(createError('Resource not found.', 404));

  const docTenantId  = doc.tenantId?.toString();
  const reqTenantId  = req.tenant?._id?.toString();

  if (docTenantId !== reqTenantId) {
    return next(
      createError('You do not have permission to access this resource.', 403)
    );
  }
};
