# Employee Management System

Full-stack CRUD app for the Kloudspot Software Engineer / Backend (Fresher) assessment.

- **Backend:** Java 17, Spring Boot 3.5, Spring Data JPA, Maven, springdoc OpenAPI
- **Frontend:** React 18, Vite, React Router, Axios
- **Database:** MySQL 8
- **Tests:** JUnit 5 + Mockito (service layer), Vitest + React Testing Library
- **Bonus features:** Environment-configured admin login, department management, CSV export and Docker Compose

```
employee-management-system/
  backend/    Spring Boot REST API
  frontend/   React dashboard
  database/   schema.sql (schema + sample data)
  docs/       Postman collection, test checklist
```

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Docker Desktop | Current | `docker compose version` |
| JDK | 17+ | `java -version` |
| Maven | 3.9+ | `mvn -v` |
| Node.js | 18+ | `node -v` |
| MySQL | 8.x | `mysql --version` |

## Quick start (clone and run locally)

Docker Compose is the simplest clean-clone setup and requires no source-code edits. Install and start Docker Desktop, then run:

```bash
git clone <your-repository-url>
cd <cloned-repository-folder>/employee-management-system
docker compose up --build
```

The repository keeps the application in the `employee-management-system` subfolder; run the commands below from that folder.

On first launch, Compose creates the MySQL database, loads the schema and sample employees, and starts the backend and frontend. Wait for all three services to start, then open http://localhost:5173. The local-only starter sign-in is `admin` / `change-me`. The sample credentials and `.env.example` are for local development only; do not use them in a public or production deployment.

To use different local values, copy `.env.example` to `.env` and edit the environment values (no source code changes are required). Stop the services with `docker compose down`; employee data remains in the Docker volume. `docker compose down -v` permanently deletes the local database volume.

## 1. Database

```bash
mysql -u root -p < database/schema.sql
```

In Windows PowerShell, use `cmd` for the input redirection:

```powershell
cmd /c "mysql -u root -p < database\schema.sql"
```

This creates the `employee_db` database, the `employees` table (unique `employee_id` and `email`) and 12 sample employees.
For an existing installation, initialize the new department table without re-inserting sample employees using `mysql -u root -p < database/department-migration.sql`.
That department migration has already been applied to the local assessment database. Run it once on any other existing database before starting the updated backend; Hibernate validates the schema and does not create missing tables automatically.

In Windows PowerShell, run the migration with:

```powershell
cmd /c "mysql -u root -p < database\department-migration.sql"
```

## 2. Backend

The backend reads its DB settings from environment variables (defaults in brackets). Nothing secret is committed.

| Variable | Default |
|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/employee_db?...` |
| `DB_USERNAME` | `root` |
| `DB_PASSWORD` | *(empty)* |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `change-me` |

Set your database and admin passwords, then run. The default admin credentials are for local assessment use only; override them before sharing the application or deploying it.

In VS Code, the workspace task **Start Employee Management Backend** runs the backend with the configured Java 17 and Maven installations. Keep that task terminal running while using the frontend.

**Windows PowerShell**
```powershell
cd backend
$env:DB_PASSWORD = "your_mysql_password"
$env:ADMIN_PASSWORD = "choose_a_strong_password"
mvn spring-boot:run
```

**macOS / Linux**
```bash
cd backend
export DB_PASSWORD=your_mysql_password
export ADMIN_PASSWORD=choose_a_strong_password
mvn spring-boot:run
```

- API: http://localhost:8080/api/employees
- Swagger UI: http://localhost:8080/swagger-ui.html

Run unit tests (no database needed): `mvn test`

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and sign in using `ADMIN_USERNAME` and `ADMIN_PASSWORD` configured for the backend. Keep the backend running on port 8080 and MySQL running on port 3306; the frontend cannot authenticate if the backend is stopped. The API URL defaults to `http://localhost:8080/api`; to change it copy `.env.example` to `.env` and edit `VITE_API_BASE_URL`.

## Optional enhancements

- **Admin login:** `POST /api/auth/login` checks the configured credentials. The frontend keeps HTTP Basic credentials only in the current browser tab's session storage. All employee and department APIs require authentication. Configure `ADMIN_USERNAME` and `ADMIN_PASSWORD`; replace the local-only defaults before exposing the app.
- **Department management:** Open **Departments** in the sidebar to add, rename, and remove departments. Renaming updates existing employee assignments. Departments assigned to employees cannot be deleted; reassign those employees first.
- **CSV export:** Select any search/status/department filters in the employee list and click **Export CSV** to download every matching employee, not just the current page.
- **Directory controls:** Sort by recently added, name, department, or joining date; use the Active/Inactive summary cards as quick filters; and choose 10, 25, or 50 rows per page (25 by default).
- **Automated frontend tests:** Run `npm test` in `frontend/`.
- **Docker Compose (local development only):** Follow [Quick start](#quick-start-clone-and-run-locally). The app connects as a dedicated `ems_app` database user rather than MySQL root. Compose's frontend build uses `VITE_API_BASE_URL`; set it to your externally reachable API URL when building a non-local image. Local Compose defaults are deliberately for development and must not be used in production.

## Production readiness

This repository includes a `production` Spring profile. Activate it with `SPRING_PROFILES_ACTIVE=production` and supply `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `CORS_ORIGINS` from your deployment secret store. These values have no profile-specific fallback, so a missing setting stops startup. Swagger/OpenAPI is disabled in this profile; forwarded headers are enabled for a trusted TLS reverse proxy. The backend container runs as a non-root user.

**Do not expose this assessment application to the public internet as-is.** Authentication is a single in-memory administrator using HTTP Basic; the browser keeps the Basic credential in tab-scoped session storage. Before production, integrate your organization’s identity provider and short-lived server-validated tokens, enforce HTTPS at the edge, use managed MySQL with TLS/backups, set exact production CORS origins, add monitoring/rate limiting, and review privacy/data-retention requirements. The local Compose file is not a production deployment manifest. Validate the chosen hosting platform and proxy configuration in a staging environment before go-live.

## API summary

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/employees?page&size&search&department&status&sortBy&direction` | Paginated list, search by name/email, filters |
| GET | `/api/employees/export?search&department&status` | Download all matching employees as CSV |
| GET | `/api/employees/{id}` | Details (404 if missing) |
| POST | `/api/employees` | Create (201; 400 validation; 409 duplicate) |
| PUT | `/api/employees/{id}` | Update |
| DELETE | `/api/employees/{id}` | Delete (204) |
| GET | `/api/employees/summary` | Total / active / inactive counts |
| GET | `/api/employees/departments` | Distinct departments |
| POST | `/api/auth/login` | Validate admin credentials |
| GET | `/api/departments` | List departments and employee counts |
| POST | `/api/departments` | Create a department |
| PUT | `/api/departments/{id}` | Rename a department and update assigned employees |
| DELETE | `/api/departments/{id}` | Delete an unused department |

Error format: `{ timestamp, status, error, message, fieldErrors }`.
Import `docs/EMS.postman_collection.json` into Postman for ready-made requests. Set its `adminUsername` and `adminPassword` collection variables to match the backend configuration.

## Push to GitHub

```bash
cd employee-management-system
git init
git add .
git commit -m "Employee Management System"
git branch -M main
# create an empty repo on github.com first, then:
git remote add origin https://github.com/<your-username>/employee-management-system.git
git push -u origin main
```

Before pushing, confirm no password is in the code: `git grep -i password` should only show `application.properties` (which reads `DB_PASSWORD`) and this README.

## Screenshots to capture

Save your project screenshots in [`docs/screenshots/`](./docs/screenshots/), then include that folder when you upload or push the project. Use descriptive filenames such as `employee-dashboard.png`, `employee-details.png`, and `mobile-view.png`. Add the screenshots here with relative links if you want them displayed in this README.

1. Employee list with summary cards (desktop).
2. Search result and department/status filter applied.
3. Pagination (page 2).
4. Add Employee form showing validation errors, then the success message.
5. Employee details page.
6. Edit form, then the success message.
7. Delete confirmation dialog.
8. List at mobile width (browser dev tools, F12, device toolbar).
9. Swagger UI at `/swagger-ui.html` with an endpoint expanded.
10. Terminal showing `mvn test` passing.

## Submission

Email the GitHub link (or ZIP) to **manjunatha.v@kloudspot.com** with **hr.team@kloudspot.com** in To or CC, within 24 hours of receiving the assessment.
