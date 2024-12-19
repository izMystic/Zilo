import { Schema, model } from "mongoose";

const MemberSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  guildId: { type: String, required: true, unique: true },
  warnings: [
    {
      reason: { type: String, required: true },
      moderator: { type: String, required: true },
      date: { type: String, default: Date.now },
    },
  ],
});

export default model("Member", MemberSchema);
