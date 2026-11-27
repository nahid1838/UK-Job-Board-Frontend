This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Homepage content

The homepage loads jobs, categories, and hiring companies from the Express API. An approved company owner can upload a PNG or JPEG logo (up to 2 MB) from the company application or profile page. The logo then appears on public job cards and company profiles.

Optional frontend environment variables:

- `SITE_CONTACT_EMAIL` is the public support email shown on the Contact page.
- `JOB_ALERTS_SIGNUP_URL` is the HTTPS signup page of your job-alerts provider. The footer links to Contact until this is configured.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

Create two Vercel projects, one from each Git repository. Select **Next.js** for this repository and **Express** for the backend. Use Node.js 24.x for both, with the default build and output settings. If both apps are in one repository, import it twice and set each project's Root Directory to the corresponding app folder.

1. Choose the two production hostnames first. Set the variables below in the frontend project's **Production** environment and follow the backend README for the API project. Use the same MongoDB Atlas database for both apps. Ensure Atlas permits connections from both Vercel projects.
2. Deploy the API and open its `/health` endpoint, then open `/api/categories` to verify a database-backed endpoint. Deploy the frontend with the API origin configured.
3. Register the frontend callback URLs in Google and GitHub. Use `https://YOUR-SITE.vercel.app/api/auth/callback/google` and `https://YOUR-SITE.vercel.app/api/auth/callback/github`. Use separate OAuth applications if keeping localhost and production callbacks separate.
4. Test the homepage and Jobs page, email and social sign-in, the dashboards, company approval, job publishing, and a test application with a small PDF. When signed in, visiting `/board-api/me` on the frontend should return your account ID and role.

| Frontend variable | Production value |
| --- | --- |
| `BETTER_AUTH_URL` | The HTTPS frontend origin, for example `https://YOUR-SITE.vercel.app` |
| `BETTER_AUTH_SECRET` | A securely generated secret of at least 32 characters |
| `MONGODB_URI` | The MongoDB Atlas connection string used by the backend |
| `BACKEND_ORIGIN` | The HTTPS API origin, for example `https://YOUR-API.vercel.app` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Production Google OAuth credentials |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Production GitHub OAuth credentials |
| `RESEND_API_KEY`, `EMAIL_FROM` | Set both to enable verification and password reset emails. Use a verified sender. |
| `SITE_CONTACT_EMAIL`, `JOB_ALERTS_SIGNUP_URL` | Optional site settings |

Keep the production values in Vercel and use [.env.example](.env.example) as the local template. Keep **Automatically expose System Environment Variables** enabled on both Vercel projects. Production browser requests use the same-origin `/board-api` rewrite so the Better Auth session cookie reaches the API. Point `BETTER_AUTH_URL` and the API's `FRONTEND_ORIGIN` at the same canonical frontend domain. Redeploy after changing environment variables.

Vercel deployments accept new CV uploads up to 3 MB. This leaves space for base64 encoding and application fields within the default function payload limit. Local development keeps the 5 MB limit. Existing CVs above Vercel's response limit need to be downloaded from the existing environment and replaced with smaller files before switching traffic, if you are reusing a database with those files.
