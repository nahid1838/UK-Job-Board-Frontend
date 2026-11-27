import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { authEmailEnabled, sendAuthEmail } from "./auth-email";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("UkJobBoardDB");

export const auth = betterAuth({
    user: {
        ...(authEmailEnabled && {
            changeEmail: {
                enabled: true,
                sendChangeEmailConfirmation: ({ user, url }) => sendAuthEmail(user.email, "Confirm your UK Job Board email change", `Approve the requested email change:\n\n${url}\n\nIf you didn’t request this, ignore this email.`),
            },
        }),
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
            role: {
                type: ["seeker", "employer", "admin"],
                required: false,
                input: false,
            },
            active: { type: "boolean", required: false, input: false },
        },
    },
    databaseHooks: {
        session: {
            create: {
                async before(session, context) {
                    // The internal adapter sees a newly created user in Better Auth's transaction.
                    const user = await context?.context.internalAdapter.findUserById(session.userId) as { active?: boolean } | null | undefined;
                    if (user?.active === false) return false;
                },
            },
        },
        user: {
            create: {
                async before(user) {
                    return {
                        data: {
                            ...user,
                            role: user.accountType === "employer" ? "employer" : "seeker",
                        },
                    };
                },
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        ...(authEmailEnabled && {
            requireEmailVerification: true,
            revokeSessionsOnPasswordReset: true,
            sendResetPassword: ({ user, url }) => sendAuthEmail(user.email, "Reset your UK Job Board password", `Use this link to reset your password:\n\n${url}\n\nIf you didn’t request a reset, ignore this email.`),
        }),
    },
    ...(authEmailEnabled && {
        emailVerification: {
            sendOnSignUp: true,
            sendVerificationEmail: ({ user, url }) => sendAuthEmail(user.email, "Verify your UK Job Board email", `Verify your email to sign in to UK Job Board:\n\n${url}\n\nIf you didn’t register, ignore this email.`),
        },
    }),
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
