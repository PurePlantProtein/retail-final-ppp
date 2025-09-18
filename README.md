
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d73a9acb-fe77-4ec3-aa5d-b97e819d7fc6

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d73a9acb-fe77-4ec3-aa5d-b97e819d7fc6) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Running the local API and smoke test

The backend API lives in `server/` and uses PostgreSQL (see `docker/init/init.sql`). To run locally:

```bash
cd server
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres" # adjust if needed
export JWT_SECRET="dev-secret"
npm install
npm start
```

Endpoints used by the app:
- `POST /api/auth/signup`, `POST /api/auth/signin`, `GET /api/auth/session`
- `GET /api/products`, `GET /api/products/:id`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`
- `POST /api/orders` (create order), `POST /api/admin/orders` (admin create), `POST /api/orders/:id/tracking` (save tracking)
- `POST /api/query` (generic shim for tables)

Smoke test the API end-to-end (signup → create product → create order):

```bash
cd server
API_BASE="http://localhost:4000/api" npm run smoke
```

If it prints `SMOKE TEST OK`, the core flows are working.

## Adding site images (login/marketing backgrounds)

You can now drop images into the repository-tracked folder `storage/assets/` and reference them directly in the app:

- Path to place files: `storage/assets/<your-file-name>`
- URL to use in the frontend: `/api/storage/assets/<your-file-name>`

Examples:
- Place `storage/assets/login-bg.jpg` → reference it at `/api/storage/assets/login-bg.jpg` in CSS or JSX.
- If you later upload via the admin upload endpoint with a key (e.g., `login-bg`), you can use `/api/storage/assets/login-bg` (without extension), and the server will resolve the actual extension.

Notes:
- The server already exposes these files via the `assets` bucket routes.
- Ensure the server process runs with access to the `storage/assets` directory.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d73a9acb-fe77-4ec3-aa5d-b97e819d7fc6) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Security Guidelines

This project implements several security measures:

1. **Authentication and Authorization**
   - JWT-based authentication with Supabase
   - Role-based access control for admin vs retailer users
   - Session timeout for inactivity

2. **Data Protection**
   - Input sanitization to prevent XSS attacks
   - Content Security Policies
   - Rate limiting on sensitive operations

3. **Payment Security**
   - Secure bank transfer instructions
   - Unique reference codes for payments
   - No storage of payment information in the frontend

4. **Best Practices**
   - HTTPS enforcement
   - Protection against common web vulnerabilities (XSS, CSRF)
   - Secure HTTP headers

## Recommended Security Practices

- Keep all dependencies updated regularly
- Use HTTPS for all production environments
- Implement regular data backups
- Monitor for suspicious activity
- Follow security updates from Supabase
