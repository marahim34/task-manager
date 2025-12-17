const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, 'Password must be at least 8 characters']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters']
    },
    role: {
        type: String,
        enum: ['regular', 'admin'],
        default: 'regular'
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

// Remove password from JSON output
userSchema.methods.toJSON = function(){
    const obj = this.toObject();
    delete obj.password;
    return obj;
}

module.exports = mongoose.model('User', userSchema);