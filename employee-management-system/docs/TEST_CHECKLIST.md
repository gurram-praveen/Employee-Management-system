# Test Checklist

Start MySQL (with `database/schema.sql` loaded), backend (8080) and frontend (5173). Tick each item.

## Employee management
- [ ] Add employee with all 9 fields; success message shows; appears in list
- [ ] Employee ID is unique: adding a duplicate ID shows an error (409)
- [ ] Email is unique: adding a duplicate email shows an error (409)
- [ ] View details page shows every field
- [ ] Edit employee; change saved; success message
- [ ] Edit: changing email to another employee's email is rejected
- [ ] Delete shows a confirmation dialog; Cancel keeps the record; Delete removes it
- [ ] List shows all employees in a table
- [ ] Search by name (partial, any case) works
- [ ] Search by email works
- [ ] Filter by department works
- [ ] Filter by status works
- [ ] Search + department + status combine
- [ ] Pagination: 12 sample rows give 2 pages; Next/Previous work
- [ ] Summary cards (Total / Active / Inactive) update after add/delete

## Validation and errors
- [ ] Submitting an empty form shows a message under every required field
- [ ] Invalid email rejected
- [ ] Phone with fewer than 10 digits rejected
- [ ] Salary 0 or negative rejected
- [ ] Future joining date rejected
- [ ] Open `/employees/999999`: "Employee not found" message
- [ ] Stop the backend, reload: "Cannot reach the server" message
- [ ] Loading spinner shows while the list loads

## UI
- [ ] Sidebar + header visible on desktop
- [ ] Mobile width (under 860px): sidebar collapses behind the menu button; table becomes stacked cards

## Backend / docs
- [ ] `mvn test` passes
- [ ] Swagger UI opens at `/swagger-ui.html`; try GET, POST, PUT, DELETE from the browser
- [ ] Postman collection runs; error requests return 400 and 404
- [ ] CORS: frontend at 5173 can call the API without console errors

## Optional enhancements
- [ ] Unauthenticated API requests are rejected; valid admin credentials allow sign in
- [ ] Logging out returns to the sign-in page; reloading a protected route requires sign in
- [ ] Create, rename and delete an unused department
- [ ] Renaming a department updates employees assigned to it
- [ ] Department assigned to employees cannot be deleted
- [ ] CSV download includes every record matching the current filters, across all pages
- [ ] `npm test` passes
- [ ] `docker compose up --build` starts MySQL, backend and frontend
