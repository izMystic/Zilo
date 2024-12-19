import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  userId: { type: String, requried: true, unique: true },
  username: { type: String, required: true },
  coins: { type: Number, default: 0 },
  bank: { type: Number, default: 0 },
  lastDaily: { type: Number, default: 0 },
});

export default model("User", UserSchema);
