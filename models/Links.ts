import mongoose, { model, Schema, models } from "mongoose";

export interface ILink {
    url: string;
    title: string;
    description?: string;
    thumbnail?: string;
    createdAt?: Date;
    _id?: mongoose.Types.ObjectId;
}

const linkSchema = new Schema<ILink>(
    {
        url: {
            type: String,
            required: true,
            unique: true,
        },
       
        thumbnail: {
            type: String,
        },
    },
    { timestamps: true }
);

const Link = models?.Link || model<ILink>("Link", linkSchema);
export default Link;


