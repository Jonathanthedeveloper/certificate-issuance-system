# CertifyEdu - Certificate Issuance System

A blockchain-based certificate management system built with Next.js, Prisma, and Solana integration.

## Quick start (clone → run)

1. Clone the repository:

```powershell
git clone https://github.com/Jonathanthedeveloper/certificate-issuance-system.git
cd certificate-issuance-system
```

2. Copy or edit the environment file for the `website` service (optional step if you want to customize envs):

```powershell
cd website
cp .env.example .env
# edit website/.env as needed (DATABASE_URL will be set by Docker compose for the default setup)
cd ..
```

3. Build and start the app with Docker Compose (production):

```powershell
docker compose up -d --build
```

4. Open the app in your browser: http://localhost:3000

5. To stop and remove containers:

```powershell
docker compose down
```

## Development

Development setup supports a fast local workflow with hot reload. There may be a `docker-compose.dev.yml` present — use it if you want the dev compose behavior.

Run the dev compose (if provided):

```powershell
docker compose -f docker-compose.dev.yml up -d --build
```

Local (without Docker) dev using Bun:

```powershell
cd website
bun install
# copy an env file for local development
cp .env.example .env.local
# update .env.local as needed, then:
bunx prisma generate
bun dev
```

Notes:
- Prisma reads `DATABASE_URL` from `website/.env` when running in the Docker container. When running the app inside Docker Compose, the `DATABASE_URL` should point to the MySQL service using the service hostname `db` (for example `mysql://root:example@db:3306/certdb`).

## Troubleshooting: Prisma can't reach DB (P1001)

Symptoms: `website` logs show `P1001: Can't reach database server at 'localhost:3306'` and the container exits.

Cause: Inside containers `localhost` refers to the container itself, not the database service. The Prisma `DATABASE_URL` must point to the `db` service used in `docker-compose.yml`.

Fixes applied in this repo:

- The `website/.env` has been updated to use `DATABASE_URL="mysql://root:example@db:3306/certdb"` so Prisma connects to `db:3306`.
- The `website` service no longer mounts the MySQL data volume (only the `db` service mounts `mysql_data`) — mounting the DB data into the `website` container can corrupt or hide the actual DB data.

How to verify locally:

1. Bring everything down and up again while rebuilding:

```powershell
docker compose down -v
docker compose up --build
```

2. Watch the logs for `website` and `db`:

```powershell
docker compose logs -f website db
```

Expected successful output:

- `db` starts and prints `ready for connections`.
- `website` prints `Waiting for MySQL at db:3306...` then `MySQL is available - running prisma db push and generate` and no P1001 errors.

If Prisma still shows P1001, check:

- That `website` is loading the `website/.env` file (no other .env or environment override is pointing to `localhost`).
- The `db` service health and that `db` is reachable from inside the `website` container: run `docker compose exec website bash` (or sh) and try `nc -z db 3306` or `telnet db 3306`.

## Useful commands

- Build and start (foreground): `docker compose up --build`
- Start detached: `docker compose up -d --build`
- Stop and remove: `docker compose down`
- Show logs: `docker compose logs -f website db`
- Enter website container: `docker compose exec website sh` or `bash`

## API & Features (high level)

- Health Check: GET /api/health
- Certificate Verification: POST /api/certificates/verify
- Auth: POST /api/auth/login, POST /api/auth/register
- Certificates, Institutions, Students management endpoints under `/api`

Tech stack: Next.js, Prisma, MySQL (in Docker), Solana integration, Bun runtime.

---

If you'd like, I can also add a short section on how to seed the DB and run Prisma migrations for dev usage.
- **Frontend**: Next.js 15, React 19, Tailwind CSS
