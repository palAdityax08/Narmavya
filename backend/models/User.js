// ─── User Model ───────────────────────────────────────────────────────────────
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Hashed password — null for OAuth-only users
    passwordHash: {
      type: String,
      default: null,
    },
    // Google OAuth UID from Firebase
    firebaseUid: {
      type: String,
      default: null,
      sparse: true, // allow multiple nulls
    },
    // Avatar from Google profile picture
    avatar: {
      type: String,
      default: '',
    },
    // RBAC: "user" | "admin"
    // To make yourself admin:
    //   db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Soft-delete / ban flag
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// ── Instance method: verify plain password against hash ────────────────────────
userSchema.methods.verifyPassword = async function (plainPassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// ── Static method: hash a password before saving ──────────────────────────────
userSchema.statics.hashPassword = async function (plain) {
  return bcrypt.hash(plain, 12);
};

// ── Never return passwordHash in JSON responses ────────────────────────────────
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.firebaseUid;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
