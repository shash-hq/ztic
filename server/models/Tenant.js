import mongoose from 'mongoose';

const brandingSchema = new mongoose.Schema(
  {
    primaryColor: { type: String, default: '#800020' },
    logoUrl:      { type: String, default: '' },
    customDomain: { type: String, default: null },
    tagline:      { type: String, default: '' },
  },
  { _id: false }
);

const tenantSchema = new mongoose.Schema(
  {
    orgName: {
      type:     String,
      required: [true, 'Organisation name is required'],
      trim:     true,
    },
    // URL-safe unique identifier — auto-generated from orgName if not supplied
    slug: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
      index:     true,
    },
    plan: {
      type:    String,
      enum:    ['free', 'growth', 'enterprise'],
      default: 'free',
    },
    branding: {
      type:    brandingSchema,
      default: () => ({}),
    },
    contactEmail: {
      type:     String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim:     true,
    },
    contactPhone: {
      type:    String,
      default: null,
      trim:    true,
    },
    // University / institution name — relevant for IIT/NIT use-case
    institution: {
      type:    String,
      default: '',
      trim:    true,
    },
    // Soft-delete flag — never hard-delete tenants
    isActive: {
      type:    Boolean,
      default: true,
      index:   true,
    },
    // Owner is the first organizer who registered the tenant
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
    // All organizer-role users who belong to this tenant
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'User',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Tenant', tenantSchema);
