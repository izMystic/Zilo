import { Schema, model, Document } from "mongoose";

interface UserDocument extends Document {
  userId: number;
  username: string;
  coins: number;
  bank: number;
  lastDaily: number;
}

const UserSchema = new Schema<UserDocument>({
  userId: { type: Number, requried: true, unique: true },
  username: { type: String, required: true },
  coins: { type: Number, default: 0 },
  bank: { type: Number, default: 0 },
  lastDaily: { type: Number, default: 0 },
});

export default model<UserDocument>("User", UserSchema);
