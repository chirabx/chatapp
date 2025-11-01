import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },
        tagline: {
            type: String,
            default: "",
            maxlength: 140,
        },
        backgroundId: {
            type: String,
            default: "",
        },
        overlayOpacity: {
            type: Number,
            default: 30, // 默认30%透明度
            min: 0,
            max: 80,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;