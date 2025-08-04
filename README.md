# Interactive React Calendar

## Running Locally

To run this project locally, follow these steps:

1. **Install [pnpm](https://pnpm.io/):**
   If you don't have pnpm installed, run:
   ```sh
   npm install -g pnpm
   ```

2. **Install dependencies:**
   ```sh
   pnpm install
   ```

3. **Run the development server:**
   ```sh
   pnpm dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

4. **Environment Variables:**
   - If your app requires environment variables, create a `.env.local` file in the root directory and add the required variables as specified in the documentation or codebase.

5. **Build for production:**
   ```sh
   pnpm build
   ```
   To preview the production build:
   ```sh
   pnpm start
   ```

## Database Setup (Drizzle ORM with Neon)

This project uses Drizzle ORM with a Neon serverless Postgres database. To get started, you'll need to set up your database and environment variables.

1. **Create a Neon Account and Project:**
   - Go to [Neon](https://neon.tech/) and create a new project.
   - In your project's dashboard, find the **Connection Details** section.
   - Copy the connection string that looks like this: `postgresql://<user>:<password>@<endpoint_id>.neon.tech/neondb?sslmode=require`

2. **Set Up Environment Variables:**
   - Create a `.env` file in the root of the project.
   - Add the following line, replacing the placeholder with your actual database connection string:
     ```
     DATABASE_URL="postgresql://<user>:<password>@<endpoint_id>.neon.tech/neondb?sslmode=require"
     ```

3. **Install Dependencies:**
   - If you haven't already, install the necessary packages:
     ```sh
     pnpm install drizzle-orm @neondatabase/serverless pg
     pnpm install -D drizzle-kit
     ```

4. **Generate Migrations:**
   - Whenever you make changes to your database schema (in `lib/db/schema.ts`), generate a migration file:
     ```sh
     pnpm drizzle-kit generate:pg
     ```

5. **Apply Migrations:**
   - To apply the migrations and update your database schema, run:
     ```sh
     pnpm drizzle-kit push:pg
     ```

Refer to the `drizzle.config.ts` file and the [Drizzle ORM documentation](https://orm.drizzle.team/docs/overview) for more details.
