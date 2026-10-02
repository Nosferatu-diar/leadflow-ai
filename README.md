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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
