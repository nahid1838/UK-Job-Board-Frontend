import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

// The auth API is served by this same Next.js app.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
