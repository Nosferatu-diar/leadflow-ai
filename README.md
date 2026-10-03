This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

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

## PostgreSQL setup for lead persistence

This project uses Prisma 6 with PostgreSQL. Prisma 6 supports this integration
with only `prisma` and `@prisma/client`, without a separate driver adapter.

1. Create or choose a PostgreSQL **development** database, locally or with a host.
2. Copy `.env.example` to `.env` in the project root (beside `package.json`).
3. Set `DATABASE_URL` to the real PostgreSQL connection URL supplied by your
   database setup or host. It includes the username, password, host, port and
   database name. Follow your host's SSL requirements and URL-encode special
   characters in credentials. Never commit `.env` or use `NEXT_PUBLIC_DATABASE_URL`.
4. With the database running and reachable, create and apply the first migration:

   ```bash
   npx prisma migrate dev --name create_leads
   npx prisma generate
   ```

   `migrate dev` is for development databases. It needs a shadow database to check
   migrations; your database account must have permission to create one, or you
   must configure a separate shadow database. If Prisma requests a reset, stop
   and investigate instead of accepting it. No database reset is needed for this task.

5. Start or restart `npm run dev` so Next.js loads the environment variable.
6. Submit a lead and check for HTTP 201 with a `leadId`. Verify the row with your
   PostgreSQL client or `npx prisma studio`.

The schema is in `prisma/schema.prisma`. No migration has been applied as part of
the initial integration because `DATABASE_URL` was not configured. Prisma Client
generation and the production build do not need an active database connection.
Valid submissions return HTTP 503 if persistence fails; the form retains the
entered values so they can be retried. Invalid input still returns HTTP 400.

## AI lead analysis

The dashboard's **Analyze with AI** button calls `POST /api/leads/[id]/analyze`.
The server loads the existing lead, sends only its name, service, budget and
message to the OpenAI Responses API, validates the structured result with Zod,
and saves the analysis on that lead. Re-analyzing replaces only the AI fields.

Add your actual OpenAI project API key to `OPENAI_API_KEY` in the root `.env`.
Never commit it or prefix it with `NEXT_PUBLIC_`. Set `OPENAI_MODEL` if you want
to choose another model that supports Responses structured output; leaving it
empty uses `gpt-5.4-nano`. Restart the dev server after changing environment
variables. The OpenAI project must have API billing/credits and model access.

The request uses a 30-second timeout, no automatic retries, a 1000-token output
limit, and bounded input fields. Requests without a configured key return an
honest configuration error and do not save an analysis. No actual AI call was
tested during initial implementation because the key was missing.

## Telegram lead notifications

After a lead is successfully inserted in PostgreSQL, the server attempts one
plain-text Telegram notification using the native `fetch` API. The request has
a five-second timeout and no automatic retries. Missing configuration or a
Telegram failure is logged safely; the saved lead and HTTP 201 success response
are preserved. Telegram credentials are never sent to the browser or stored on
lead records. No OpenAI call is made during submission.

To enable real delivery:

1. Open the official `@BotFather` in Telegram and use `/newbot` to create a bot.
2. Store its actual token as `TELEGRAM_BOT_TOKEN` in the root `.env`.
3. Open your new bot from the business owner's Telegram account and press Start
   or send `/start`. Bots cannot initiate a private conversation with a user.
4. Call that bot's `getUpdates` method from a trusted local tool and find the
   owner's `message.chat.id`. Set that value as `TELEGRAM_CHAT_ID` in `.env`.
   Treat the token as a secret; do not paste it into source, screenshots, or logs.
5. Restart `npm run dev`, submit a lead, and verify both the database row and the
   Telegram message. Leaving either variable empty keeps submission working.

See the [Bot API documentation](https://core.telegram.org/bots/api#getupdates)
for update retrieval and [sendMessage](https://core.telegram.org/bots/api#sendmessage)
for delivery. This is a best-effort notification: there is no queue or retry job.

## Single-admin authentication

The public homepage and `POST /api/leads` remain public. `/dashboard`,
`PATCH /api/leads/[id]/status` and `POST /api/leads/[id]/analyze` require a
verified session. Every admin mutation checks the session on the server before
database or OpenAI work. Login, logout and admin mutations require a matching
`Origin` header and reject cross-site requests. Non-browser callers must send
the application's origin explicitly. Reverse proxies must preserve the public
request origin/protocol so this comparison matches the URL visitors use.

Configure the three server-only variables in the root `.env` (or your deployment's
secret settings). No password or secret has been generated for your actual admin:

1. Set `ADMIN_EMAIL` to your admin email address.
2. In your own interactive terminal, run `npm run auth:hash`. Enter and confirm
   your chosen password; input is hidden and never echoed. Use at least 12
   characters, no more than 72 UTF-8 bytes. Copy the printed
   `ADMIN_PASSWORD_HASH='...'` line into `.env`, keeping its quotes so the hash's
   dollar signs survive environment parsing. The command uses bcrypt cost 12;
   configured hashes must have cost 10–14.
3. Generate an independent random signing secret locally:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

   Set the output as `AUTH_SECRET`. Do not commit either generated value, share
   terminal screenshots, or put these variables behind `NEXT_PUBLIC_`.
4. Restart the server and visit `/login`. Missing or invalid configuration keeps
   admin access closed and displays a setup message; login returns HTTP 503.
5. Sign in, check the dashboard, then use Logout. Production must be served over
   HTTPS so the secure cookie can be sent.

`bcryptjs` verifies the salted password hash; `jose` creates and verifies an
HS256 JWT restricted to the application's issuer, audience and admin subject.
The cookie expires after eight hours, is HttpOnly, SameSite=Lax and scoped to `/`.
In production it is Secure and uses the `__Host-` prefix. It contains no password,
password hash, admin email or signing secret. Password/hash/email changes or
AUTH_SECRET rotation invalidate existing sessions. Logout expires the browser's
cookie through a server POST and redirects to `/login`. Sessions are stateless:
a previously copied token remains usable until expiry or credential/secret
rotation; there is no database session registry or per-token revocation.

Login errors do not identify which credential was wrong. A small per-process
limit permits ten sign-in attempts per minute. This is not a shared limiter across
serverless instances; configure the hosting platform's rate limiting before
scaling. Authentication does not require a database migration or user table.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
