import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video",
    }],  
    password: {
        type: String,
        required: [true, "Password is required"],
        // REMOVED select: false - this was causing the issue!
    },
    refreshToken: {
        type: String
    }
},
{
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
       _id: this._id,
       email: this.email,
       username: this.username,
       fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d"
    });
};

// FIXED: Use REFRESH_TOKEN_SECRET and removed unnecessary async
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
       _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, // FIXED: Use correct secret
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d"
    });
};

export const User = mongoose.model("User", userSchema);