/**
 * Injects { tenantId } into a Mongoose filter object.
 * Guarantees every query in a tenant-scoped controller is
 * structurally bound to the calling user's tenant.
 *
 * Usage (inside any tenant-scoped controller):
 *   const filter = injectTenant({ isActive: true }, req);
 *   const events = await Event.find(filter);
 */
export const injectTenant = (filter = {}, req) => {
  if (!req.tenant?._id) {
    throw new Error(
      'injectTenant called before tenantMiddleware resolved req.tenant'
    );
  }
  return { ...filter, tenantId: req.tenant._id };
};

/**
 * Injects tenantId into a document body before create/update.
 * Usage:
 *   const doc = injectTenantField(req.body, req);
 *   await Event.create(doc);
 */
export const injectTenantField = (body = {}, req) => {
  if (!req.tenant?._id) {
    throw new Error(
      'injectTenantField called before tenantMiddleware resolved req.tenant'
    );
  }
  return { ...body, tenantId: req.tenant._id };
};
