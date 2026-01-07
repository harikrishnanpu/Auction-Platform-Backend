import mongoose, { Schema, Document } from 'mongoose';

export interface IUserModel extends Omit<Document, '_id'> {
    _id: string; // we use UUID string
    email: string;
    passwordHash: string;
    role: string;
    status: string;
}

const UserSchema: Schema = new Schema({
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, required: true }
}, {
    _id: false, // Don't auto-generate ObjectID since we manage ID
    timestamps: true
});

export const UserModel = mongoose.model<IUserModel>('User', UserSchema);
