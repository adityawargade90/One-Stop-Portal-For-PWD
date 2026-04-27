const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    // =======================
    // PROFILE FIELDS
    // =======================
    disabilityType: {
      type: String,
      default: ""
    },

    disabilityPercentage: {
      type: Number,
      default: 0
    },

    educationLevel: {
      type: String,
      default: ""
    },

    employmentStatus: {
      type: String,
      default: ""
    },

    state: {
      type: String,
      default: ""
    },

    district: {
      type: String,
      default: ""
    },

    // ✅ Track profile completion (VERY USEFUL)
    profileCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// =======================
// OPTIONAL: AUTO UPDATE PROFILE STATUS
// =======================
userSchema.pre("save", function (next) {
  if (
    this.disabilityType &&
    this.educationLevel &&
    this.state
  ) {
    this.profileCompleted = true;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
