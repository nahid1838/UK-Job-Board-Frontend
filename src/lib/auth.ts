import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("UkJobBoardDB");

export const auth = betterAuth({
    user: {
        additionalFields: {
            // This records a signup preference. Permissions are assigned separately.
            accountType: {
                type: ["seeker", "employer"],
                required: false,
                defaultValue: "seeker",
                transform: {
                    input: (value) => value === "employer" ? "employer" : "seeker",
                },
            },
        },
    },
    emailAndPassword: {
        enabled: true
    },
    database: mongodbAdapter(db, {
        client,
    }),

    socialProviders:{
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string
        }
    }
});
