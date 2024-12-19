import { Schema, model } from "mongoose";

const MemberSchema = new Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  warnings: [
    {
      reason: { type: String, required: true },
      moderator: { type: String, required: true },
      date: { type: String, default: Date.now },
    },
  ],
});

MemberSchema.index({ userId: 1, guildId: 1 }, { unique: true });

export default model("Member", MemberSchema);
