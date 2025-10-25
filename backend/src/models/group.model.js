import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },
        description: {
            type: String,
            default: "",
            maxlength: 200
        },
        avatar: {
            type: String,
            default: ""
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        members: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            role: {
                type: String,
                enum: ["admin", "member"],
                default: "member"
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }],
        settings: {
            isPrivate: {
                type: Boolean,
                default: false
            },
            allowMemberInvite: {
                type: Boolean,
                default: true
            },
            maxMembers: {
                type: Number,
                default: 100
            }
        }
    },
    { timestamps: true }
);

// 添加索引
groupSchema.index({ "members.user": 1 });
groupSchema.index({ createdBy: 1 });
groupSchema.index({ name: "text", description: "text" });

const Group = mongoose.model("Group", groupSchema);

export default Group;
