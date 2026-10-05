# LeadFlow AI

A Next.js App Router application for collecting leads in PostgreSQL, managing
lead status, and optionally analyzing leads with OpenAI and notifying Telegram.
The public form stays accessible; the dashboard requires a single-admin session.

## Local development and Prisma

Use Node.js 22 and npm. Copy `.env.example` to an untracked `.env` and configure
your own development Neon/PostgreSQL database plus admin credentials below.

```bash
npm ci --include=dev
npm run db:status
npm run db:migrate
npm run dev
```

The migration command above applies the repository's existing migrations to the
selected database. Check the target before running it. Open http://localhost:3000.
Never commit `.env` or use a `NEXT_PUBLIC_` prefix for credentials.

Prisma 6 reads `DATABASE_URL` from the environment. `prisma generate` creates the
application's typed database client and does not connect to PostgreSQL. The build
and postinstall scripts already generate it. Keep all files in `prisma/migrations`.

- `prisma migrate dev`: authors new migrations and checks schema drift using a
  shadow database; use only on a development database when changing the schema.
  If it asks for a reset, stop and investigate.
- `npm run db:migrate` (`prisma migrate deploy`): applies pending committed
  migrations non-interactively. It does not author migrations or reset data.
  Review migration SQL and back up the target first; migration SQL can still
  change data. Never use `migrate dev`, `migrate reset`, or `db push` in production.
- `npm run db:status`: read-only migration-history status, not a complete drift
  or data-integrity check.

The dashboard queries at request time, so building needs no active database
connection. Failed persistence returns HTTP 503; invalid input returns HTTP 400.

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
honest configuration error and do not save an analysis. Real AI testing remains postponed until API billing is enabled.

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
`PATCH /api/leads/[id]/status`, `DELETE /api/leads/[id]` and
`POST /api/leads/[id]/analyze` require a verified session. Every admin mutation
checks the session on the server before
database or OpenAI work. Login, logout and admin mutations require a matching
`Origin` header and reject cross-site requests. Non-browser callers must send
the application's origin explicitly. Reverse proxies must preserve the public
request protocol. Set server-only `APP_ORIGIN` to the exact public HTTPS origin
in production so checks do not compare against an internal container address.
No path or trailing slash is accepted. Local development can leave it blank.
An invalid configured origin fails closed; incoming Host/forwarded-host headers
do not determine the allowed origin.

Configure the three server-only variables in the root `.env` (or your deployment's
secret settings) using your own credentials:

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

## Production Security

Public lead requests are limited to 16 KiB of actual bytes read, even when
`Content-Length` is missing or dishonest. Login JSON is capped at 4 KiB and status
JSON at 1 KiB. Configure body/time limits at the reverse proxy too: application
checks cannot stop oversized traffic from reaching the server in the first place.

The lead form sends an empty off-screen `website` honeypot and its elapsed fill
time (`formFillTimeMs`). Both signals are checked before lead validation/database
work. The conservative minimum is 750 ms, measured in the browser with a monotonic
clock to avoid device clock skew. Failed attempts retain the form. API callers
must include `website: ""` and a numeric `formFillTimeMs` of at least 750. These
client-supplied values are easily bypassed by a purposeful bot; they only deter
simple autofill/instant submission scripts. They are never stored on lead rows.

The in-memory limiter allows five lead attempts per identified IP per ten minutes,
including invalid requests. Without a verified IP, all visitors share a fallback
of 30 attempts per ten minutes. Login permits ten attempts per bucket per minute;
there is no permanent lockout. HTTP 429 includes `Retry-After`. Buckets have bounded
memory, expire, and use a process-random HMAC rather than storing raw IPs. No IP
is written to PostgreSQL. Shared networks may share a limit, and the fallback can
temporarily throttle unrelated visitors during a flood.

Next.js Route Handlers do not expose a trustworthy socket IP here. By default
forwarded headers are ignored. Only set `TRUST_PROXY_IP_HEADER` to `x-real-ip` or
`x-forwarded-for` when the app is reachable exclusively through your trusted proxy
and that proxy overwrites the selected header with exactly one validated client
IP. Comma-separated chains, missing/invalid IPs and unsupported settings use the
fallback bucket. Do not enable this for a publicly reachable origin or a proxy
that preserves client-supplied headers. Verify that changing incoming forged
headers does not change the proxy-provided identity before enabling it.

These limits reset on process restart and do not coordinate between containers,
workers or serverless instances. They are not distributed protection or DDoS
defense. Before deploying multiple instances, move limits to Redis, a gateway,
Cloudflare or equivalent trusted infrastructure. Fixed windows also permit a
burst across a window boundary; monitor aggregate traffic.

Admin mutations still require signed HttpOnly sessions and matching Origin headers.
Public requests reject foreign browser origins when supplied, but non-browser
bots can omit or forge Origin. Dashboard/login metadata and response headers are
noindex/nofollow. Admin pages and APIs use private/no-store responses; do not add
a CDN rule that overrides this or caches authenticated responses.

Serve production over HTTPS. Secure cookies require it. The application adds
nosniff, strict-origin-when-cross-origin referrer policy, DENY framing, and disables
camera/microphone/geolocation. HSTS should be enabled at the HTTPS termination
layer after TLS is verified; it is deliberately not emitted on local HTTP. A CSP
with verified Next.js-compatible nonce handling is a future improvement rather
than an untested policy that breaks hydration.

Keep `.env` untracked and use deployment secret settings for database, OpenAI,
Telegram and admin credentials. `.env.example` contains only empty placeholders;
never use `NEXT_PUBLIC_` for these values. API errors/logs are generic and do not
include raw provider errors or credentials. The password setup command prints a
hash only for local configuration, never during normal app requests. Rotate
credentials if exposed; AUTH_SECRET/credential rotation invalidates sessions.

Use a least-privilege database account, restrict database access where supported,
and enable Neon backups/point-in-time recovery appropriate to your plan. Verify
restore procedures and keep migrations reviewed. No database schema/data reset,
deletion or production deployment is part of this QA pass.

## Production deployment: GitHub → Netlify → Neon

This demo is deployed on Netlify's free plan. Netlify's automatic Next.js adapter
supports App Router, Server Components and Route Handlers. Keep the framework
detected as Next.js, Node.js 22, and the build command `npm run build`; do not
configure a static export or a long-running `npm start` container. Installation
and build generate Prisma Client on the deployment platform. Never copy Windows
`node_modules` to Netlify.

See [Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)
for the supported runtime and automatic adapter setup. No extra adapter package
or committed Netlify configuration is required by this application. This QA pass
does not change the existing Netlify settings or trigger a deployment.

Configure server credentials in Netlify's environment settings, never in source
or `netlify.toml`. They must be available to Functions; `APP_ORIGIN` must also be
available during Builds for homepage canonical/hreflang metadata. If your plan
does not offer scope selection, the default all-scopes setting includes both.
Use separate credentials/databases for preview deployments; never give untrusted
pull-request builds production credentials. See
[environment variable configuration](https://docs.netlify.com/build/environment-variables/overview/).

| Variable | Requirement |
| --- | --- |
| `DATABASE_URL` | Actual Neon PostgreSQL URL with SSL; required for persistence/dashboard. |
| `ADMIN_EMAIL` | Required for admin access. |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash from `npm run auth:hash`; required for admin access. |
| `AUTH_SECRET` | Independent random base64url secret of at least 32 bytes. |
| `APP_ORIGIN` | Exact public HTTPS origin for this deployment, no path/trailing slash. |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Both required for delivery; missing/failed delivery preserves the saved lead. |
| `OPENAI_API_KEY` | Optional for serving/submission; real analysis requires enabled API billing. |
| `OPENAI_MODEL` | Optional Responses structured-output model override. |
| `TRUST_PROXY_IP_HEADER` | Leave blank unless the trusted single-IP proxy guarantee has been verified. |

Use the actual HTTPS Netlify site origin as `APP_ORIGIN`; a custom domain is not
required. Preserve the bcrypt hash's literal dollar signs: a raw-value field
takes the hash without surrounding quotes, while local dotenv files need single
quotes. Keep signing secrets stable across releases; rotation signs users out.
Do not copy workstation-only `SWC_NATIVE_BINDING_CACHE` to Netlify.

The build never runs migrations. For a release that actually changes the schema,
review committed migration SQL, verify the target and backups, then use a separate
trusted runner with the correct `DATABASE_URL` to run `npm run db:migrate` and
`npm run db:status`. Never reset the database, use `migrate dev`/`db push` in
production, or migrate merely to rerun QA. This cleanup has no schema changes.

After a manual deployment, check the public HTTPS URL:

- `GET /api/health` returns HTTP 200 and `{"status":"ok"}`. This is liveness,
  not database or provider readiness.
- Locale redirects, homepage links and localized login/dashboard routes work.
- Login/logout, Secure/HttpOnly/SameSite=Lax cookies, authenticated mutations,
  security headers and admin noindex/private-no-store responses work.
- A deliberately submitted test lead persists before Telegram delivery is
  attempted; delivery failure leaves the row and submission success intact.
- AI is tested only when billing/model access is enabled. Real AI testing is
  intentionally postponed for this demo.

Netlify serves dynamic pages/API handlers through serverless functions. The
in-memory limiter is per process, resets with new instances and is not shared
between function instances. It remains a documented demo limitation; do not
describe it as distributed spam protection. Telegram has no durable retry queue.
No paid infrastructure, custom domain, registration or password reset is included.

### Local release checks

`npm run lint`, `npm run typecheck`, `npx prisma generate` and `npm run build`
must pass. Check that `.env` remains ignored and no credentials are tracked.
Destructive dashboard tests should use isolated fixtures, not existing Neon rows.

## Interface languages

The interface supports English (`en`), Russian (`ru`) and Uzbek Latin (`uz`) via
`next-intl`. `/` redirects to `/en`; legacy `/login` and `/dashboard` redirect to
English equivalents. Explicit locale URLs always keep their requested language.
Browser language detection is disabled so unprefixed URLs have a predictable
English default. API routes and assets remain unprefixed.

Pages and the root layout live under `src/app/[locale]`. `src/proxy.ts` performs
locale routing only; all authorization stays in the existing server checks.
`src/i18n/routing.ts` is the locale allowlist, `navigation.ts` provides localized
links/redirects, and `request.ts` loads one catalog using Next.js root parameters.
English, Russian and Uzbek catalogs live in `messages/` and must have matching
keys and ICU placeholders. Server Components use `getTranslations` or server
hooks; small interactive components use hooks inside `NextIntlClientProvider`.
Only their needed message namespaces are serialized to the browser.

EN/RU/UZ links preserve the route, query and section anchor with a full navigation.
Switching language does not preserve an unsent form draft. Browser requests send
`x-leadflow-locale`; handlers validate it against the locale allowlist and fall
back to English for missing/unsupported values. Native logout uses an allowlisted
`locale` query parameter. Neither mechanism grants access or changes input rules.
The Zod schema factory shares the same rules on browser/server and receives only
a translation function. Persisted service/status values remain unchanged.

Customer names, contacts, budget text, messages and saved AI-generated prose are
never translated. Dates are formatted for the interface locale in UTC; stored
timestamps stay unchanged. AI prompts/output and business-owner Telegram messages
remain unchanged in English. Server logs, provider/configuration identifiers and
CLI-only validation diagnostics also stay in English. Login/dashboard retain
noindex and private/no-store headers on all locale paths. The homepage has
localized metadata and canonical/hreflang URLs when a real `APP_ORIGIN` is set.

On Windows, a workstation may need an ignored `.env.local`
`SWC_NATIVE_BINDING_CACHE` override for its native-loader cache. This is a local
configuration only; do not copy it to Netlify/Linux or commit it.
