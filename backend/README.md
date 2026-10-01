# Backend (Tasks 1 and 2)

Django REST Framework API with PostgreSQL and JWT authentication.

## Setup

**1. Create the virtual environment and install packages**
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
(macOS/Linux: `source venv/bin/activate`)

**2. Create the database**

In pgAdmin: right-click **Databases → Create → Database**, name it `patient_db`.
Or in `psql`: `CREATE DATABASE patient_db;`

**3. Configure environment variables**

Copy `.env.example` to `.env` and fill in your values:

| Variable | Meaning |
|---|---|
| `SECRET_KEY` | Django secret key (any long random string) |
| `DEBUG` | `True` for local development |
| `DB_NAME` | `patient_db` |
| `DB_USER` | PostgreSQL user, e.g. `postgres` |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `5432` |
| `SEED_DEFAULT_PASSWORD` | Demo password given to seeded patients |

Generate a secret key with:
```
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**4. Apply migrations**
```
python manage.py migrate
```

**5. (Optional) Create an admin user**
```
python manage.py createsuperuser
```
It asks for mobile, first name, age and password. The admin is at http://127.0.0.1:8000/admin.

**6. Run the server**
```
python manage.py runserver
```

## Task 2: Seed Script

Inserts the 10 patients from the task table.

```
python scripts/seed_patients.py
```

| Run | Result |
|---|---|
| First run | 10 created |
| Second run | 0 created, 10 skipped (no duplicates) |
| After adding new rows to the script | Only the new rows are created, existing ones are left untouched |

The script matches on the unique `mobile` field with `get_or_create`. The task hints at `update_or_create`, but it also requires existing rows to be ignored, and `update_or_create` would overwrite them. Seeded patients get `SEED_DEFAULT_PASSWORD` (development only, stored hashed).

Example output:
```
(venv) PS H:\prity\Projects\patient-management\backend> python scripts/seed_patients.py
created: 01677307926 - Ab.Kader
created: 01674205677 - Morshed Khan
created: 01675216052 - Jhorna
created: 01860280511 - Dhuku Miah
created: 01912850072 - Aklima
created: 01854558127 - Aslam
created: 01984605450 - Kobir
created: 01925704524 - Kamruzzaman
created: 01747497279 - Munna
created: 01910786529 - Ashraful

Summary: created=10, skipped=0, total=10
(venv) PS H:\prity\Projects\patient-management\backend> python scripts/seed_patients.py
skipped: 01677307926 - Ab.Kader
skipped: 01674205677 - Morshed Khan
skipped: 01675216052 - Jhorna
skipped: 01860280511 - Dhuku Miah
skipped: 01912850072 - Aklima
skipped: 01854558127 - Aslam
skipped: 01984605450 - Kobir
skipped: 01925704524 - Kamruzzaman
skipped: 01747497279 - Munna
skipped: 01910786529 - Ashraful

Summary: created=0, skipped=10, total=10
```

## Authentication

Log in with mobile and password:

```
POST /api/auth/login/
{ "mobile": "01677307926", "password": "Patient@123" }
```
The response contains `access` (30 minutes) and `refresh` (1 day) tokens. Send the access token on protected requests:

```
Authorization: Bearer <access>
```
Get a new access token with `POST /api/auth/refresh/` and `{ "refresh": "<refresh token>" }`.

## Endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/login/` | Public | Log in |
| POST | `/api/auth/refresh/` | Public | Refresh access token |
| POST | `/api/patients/` | Public | Create patient (registration) |
| GET | `/api/patients/?page=1` | JWT | Paginated list |
| GET | `/api/patients/<id>/` | JWT | Retrieve |
| PUT / PATCH | `/api/patients/<id>/` | JWT | Update |
| DELETE | `/api/patients/<id>/` | JWT | Delete |
| POST | `/api/visits/` | JWT | Create visit, updates counters |
| GET | `/api/patients/<id>/visits/` | JWT | Visit history, newest first |

**Paginated list response**
```json
{
  "count": 10,
  "next": "http://127.0.0.1:8000/api/patients/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

**Create a visit**
```
POST /api/visits/
{
  "patient": 1,
  "doctor_name": "Dr. Rahman",
  "visit_date": "2026-10-01",
  "clinical_note": "Fever for two days",
  "diagnosis": "Viral fever"
}
```
The patient's `total_visits` increases by 1 and `last_visit_date` is updated (it never moves backwards for older visits).

**Validation errors** return HTTP 400 with messages per field, for example `{"mobile": ["...already exists."]}`.

## Tests

```
python manage.py test
```
Runs 10 tests covering patient CRUD, validation, visit counters and JWT.