# SmartSeason - Field Management & Monitoring System

SmartSeason is a full-stack web application for managing and monitoring agricultural fields. It helps administrators and field agents track crop progress, monitor environmental risks, and manage field updates in real time.

---

## Features

## Core Functionality

- **Field Management** – Create, view, update, and delete field records  
- **Field Stages** – Track crop lifecycle stages:
  - Planted
  - Growing
  - Ready
  - Harvested

- **Field Agent Assignment** – Assign field agents to specific fields

- **Environmental Monitoring** – Monitor field conditions such as:
  - Stress
  - Drought
  - Pest
  - Disease
  - Damage
  - Wilting
  - None (Healthy)

---

## Smart Status System

The system automatically determines field status using the following logic:

1. If field stage is **Harvested** → `Completed`
2. If any environmental risk exists → `At Risk`
3. If update notes contain keywords like pest, disease, drought, wilting, etc. → `At Risk`
4. If field has no updates after 30+ days from planting → `At Risk`
5. Otherwise → `Active`

---

## Role-Based Access

### Admin
- Full system access
- Manage users
- Create/Edit/Delete fields
- Assign field agents
- View reports and dashboard

### Field Agent
- Access assigned fields only
- Submit updates
- View field conditions and progress

---

## Tech Stack

## Backend

- **Framework:** Django 4.2.30
- **API:** Django REST Framework 3.15.1
- **Database:** PostgreSQL
- **Authentication:** Token-Based Authentication
- **CORS:** django-cors-headers

## Frontend

- **Framework:** React 18 + Vite
- **Routing:** React Router
- **Styling:** CSS / Inline Styles
- **API Calls:** Axios

---

## Project Structure

```text
smartseason/
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3
│   ├── field/
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   └── tests.py
│   │
│   └── smartseason/
│       ├── settings.py
│       ├── urls.py
│       ├── asgi.py
│       └── wsgi.py
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Fields.jsx
    │   │   └── FieldDetail.jsx
    │   │
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── StatusBadge.jsx
    │   │   └── Layout.jsx
    │   │
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   │
    │   ├── services/
    │   │   ├── api.js
    │   │   └── apiHelpers.js
    │   │
    │   └── App.jsx
    │
    ├── package.json
    ├── vite.config.js
    └── index.html
````

---

## Installation & Setup

## Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate environment
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install packages
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

Backend runs at:

```text
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Start frontend server
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## API Endpoints

## Authentication

| Method | Endpoint            | Description          |
| ------ | ------------------- | -------------------- |
| POST   | /api/auth/token/    | Obtain login token   |
| POST   | /api/auth/register/ | Register new user    |
| GET    | /api/users/profile/ | Current user profile |

---

## Fields

| Method | Endpoint          | Description     |
| ------ | ----------------- | --------------- |
| GET    | /api/fields/      | List all fields |
| POST   | /api/fields/      | Create field    |
| GET    | /api/fields/{id}/ | Field details   |
| PUT    | /api/fields/{id}/ | Update field    |
| DELETE | /api/fields/{id}/ | Delete field    |

---

## Field Updates

| Method | Endpoint                  | Description    |
| ------ | ------------------------- | -------------- |
| POST   | /api/field-updates/       | Submit update  |
| GET    | /api/fields/{id}/updates/ | Update history |

---

## Dashboard

| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| GET    | /api/dashboard/stats/ | Dashboard statistics |

---

## Environmental Conditions Logic

### How It Works

* Admin selects conditions during field creation/editing
* If any risk condition selected → Status becomes **At Risk**
* If **None** selected alone → normal logic applies
* Field agents immediately see updated status

### Selection Rules

* Multiple risk conditions can be selected
* Selecting **None** removes other options
* Selecting any risk removes **None**

---

## Database Models

## User

* Extends Django `AbstractUser`
* `role`
* `username`
* `email`
* `first_name`
* `last_name`

## Field

* `name`
* `crop_type`
* `planting_date`
* `current_stage`
* `assigned_agent`
* `environmental_conditions`
* `created_at`
* `updated_at`

## FieldUpdate

* `field`
* `agent`
* `stage`
* `notes`
* `created_at`

---

## Authentication System

* Users register with credentials + role
* Login returns auth token
* Protected routes require token
* Token stored in frontend localStorage

---

## Permissions

### Admin Users

* Full access

### Field Agents

* Assigned fields only

### Guests

* Login/Register only

---

## Status Badge Colors

| Status    | Color | Meaning          |
| --------- | ----- | ---------------- |
| Active    | Green | Healthy field    |
| At Risk   | Red   | Problem detected |
| Completed | Gray  | Harvested        |

---

## Recent Updates (v1.1)

* Added environmental condition multi-select
* Smart status override logic
* Condition display in field details
* Improved form validation

---

## Future Enhancements

* Weather API integration
* Disease detection using AI
* SMS alerts
* Mobile application
* Historical analytics
* Crop yield prediction

---

## License

MIT License

---

## Author

SmartSeason Development Team

```
```
