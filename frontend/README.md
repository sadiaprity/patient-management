# Frontend (Task 3)

React (Vite) app for managing patients, built with Axios. It talks to the Django API.

## Setup

The backend must be running first (see [../backend/README.md](../backend/README.md)).

```
cd frontend
npm install
copy .env.example .env
npm run dev
```
(macOS/Linux: `cp .env.example .env`)

Open http://localhost:5173. Use `localhost`, not `127.0.0.1`, because the backend only allows that origin through CORS.

## Environment Variables

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_URL` | `http://127.0.0.1:8000/api` | Base URL of the backend API |

Restart `npm run dev` after changing `.env`.

## Using the App

1. Open the welcome page and click **Register** to create a patient, or **Sign in** with the demo login: mobile `01677307926`, password `Patient@123` (after running the seed script).
2. The patient table shows 5 patients per page. Use Previous / Next to page.
3. **Add Patient** opens a form. Validation errors from the API appear under each field.
4. **Edit** opens the form prefilled. Leave the password blank to keep it unchanged.
5. **Delete** asks for confirmation first.
6. **Record Visit** adds a visit and updates the patient's visit count and last visit date.
7. **History** shows all visits for that patient, newest first.

## Structure

```
src/
├── api/
│   ├── client.js      # axios instance, adds the JWT, refreshes it on 401
│   ├── auth.js        # login / logout
│   └── patients.js    # patient and visit API calls
├── components/        # UI components
├── App.jsx
└── main.jsx
```

## Notes

- Access tokens are stored in `localStorage`. When one expires, the app refreshes it automatically; if the refresh fails, you are returned to the welcome page.
- Pagination is server-side, using the backend's page-number pagination.