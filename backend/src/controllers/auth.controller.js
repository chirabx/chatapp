import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }
        const user = await User.findOne({ email })

        if (user) return res.status(400).json({ message: "Email already exists" });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if (newUser) {
            // generate jwt token here
            generateToken(newUser._id, res)
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
                tagline: newUser.tagline || "",
                backgroundId: newUser.backgroundId || "",
                overlayOpacity: newUser.overlayOpacity ?? 30,
                chatBoxOpacity: newUser.chatBoxOpacity ?? 70,
                createdAt: newUser.createdAt,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" })
        }
    } catch (error) {
        console.log("Error in signup controller", error.message)
        res.status(500).json({ message: "Internal server error" })
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" })
        }
        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            tagline: user.tagline || "",
            backgroundId: user.backgroundId || "",
            overlayOpacity: user.overlayOpacity ?? 30,
            chatBoxOpacity: user.chatBoxOpacity ?? 70,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.log("Error in login controller", error.message)
        res.status(500).json({ message: "Internal server error" });
    }
};
export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        console.log("Error in logout controller", error.message)
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, fullName, tagline, backgroundId, overlayOpacity, chatBoxOpacity } = req.body;
        const userId = req.user._id;

        const update = {};

        if (typeof fullName === "string") {
            const name = fullName.trim();
            if (!name) {
                return res.status(400).json({ message: "姓名不能为空" });
            }
            update.fullName = name;
        }

        if (typeof tagline === "string") {
            update.tagline = tagline.trim();
        }

        // 允许 backgroundId 为空字符串来清除背景
        if (backgroundId !== undefined) {
            update.backgroundId = backgroundId ? backgroundId.trim() : "";
        }

        // 遮罩透明度（0-80）
        if (overlayOpacity !== undefined) {
            const opacity = Number(overlayOpacity);
            if (!isNaN(opacity) && opacity >= 0 && opacity <= 80) {
                update.overlayOpacity = opacity;
            }
        }

        // 聊天框透明度（40-100）
        if (chatBoxOpacity !== undefined) {
            const opacity = Number(chatBoxOpacity);
            if (!isNaN(opacity) && opacity >= 40 && opacity <= 100) {
                update.chatBoxOpacity = opacity;
            }
        }

        if (profilePic) {
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            update.profilePic = uploadResponse.secure_url;
        }

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ message: "未提供任何可更新的字段" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true });
        res.status(200).json({
            _id: updatedUser._id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            profilePic: updatedUser.profilePic,
            tagline: updatedUser.tagline || "",
            backgroundId: updatedUser.backgroundId || "",
            overlayOpacity: updatedUser.overlayOpacity ?? 30,
            chatBoxOpacity: updatedUser.chatBoxOpacity ?? 70,
            createdAt: updatedUser.createdAt,
        });
    } catch (error) {
        console.log("error in update profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "请提供当前密码和新密码" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "新密码长度至少为6位" });
        }

        // 获取用户信息（包含密码）
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "用户不存在" });
        }

        // 验证当前密码
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "当前密码错误" });
        }

        // 检查新密码是否与当前密码相同
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: "新密码不能与当前密码相同" });
        }

        // 加密新密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 更新密码
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "密码修改成功" });
    } catch (error) {
        console.log("error in change password:", error);
        res.status(500).json({ message: "修改密码失败" });
    }
};

export const checkAuth = (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            tagline: user.tagline || "",
            backgroundId: user.backgroundId || "",
            overlayOpacity: user.overlayOpacity ?? 30,
            chatBoxOpacity: user.chatBoxOpacity ?? 70,
            createdAt: user.createdAt,
        });
    }
    catch (error) {
        console.log("Error in checkAuth controller", error.message)
        res.status(500).json({ message: "Internal server error" });
    }
}