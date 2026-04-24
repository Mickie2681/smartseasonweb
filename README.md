SmartSeason - README
# SmartSeason - Field Management & Monitoring System

SmartSeason is a full-stack web application for managing and monitoring agricultural fields. It provides real-time field status tracking, environmental condition monitoring, and field agent assignment capabilities.

## Features

### Core Functionality
- **Field Management**: Create, read, update, and delete field records
- **Field Stages**: Track fields through lifecycle stages (Planted, Growing, Ready, Harvested)
- **Field Agents**: Assign field agents to specific fields and manage their updates
- **Environmental Conditions Monitoring**: Track field conditions including:
  - Stress
  - Drought
  - Pest
  - Disease
  - Damage
  - Wilting
  - None (healthy)

### Smart Status System
The system automatically calculates field status based on:
1. **Environmental Conditions**: If any risk condition is selected → Status = "At Risk"
2. **Update Notes**: Scans notes for keywords (stress, drought, pest, disease, damage, wilting) → Status = "At Risk"
3. **Days Since Planting**: Fields planted for 30+ days without updates → Status = "At Risk"
4. **Lifecycle**: Harvested fields → Status = "Completed"
5. **Default**: Active fields → Status = "Active"

### Role-Based Access
- **Admin**: Full access to all fields, user management, field creation/editing
- **Field Agent**: Access to assigned fields only, can submit field updates

## Tech Stack

### Backend
- **Framework**: Django 4.2.30
- **API**: Django REST Framework 3.15.1
- **Database**: PostgreSQL (via psycopg)
- **CORS**: django-cors-headers
- **Authentication**: Token-based (Django REST Framework)

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router
- **Styling**: CSS-in-JS (inline styles)
- **API Communication**: Axios

## Project Structure
smartseason/
├── backend/
│ ├── manage.py
│ ├── requirements.txt
│ ├── db.sqlite3
│ ├── field/
│ │ ├── migrations/
│ │ ├── models.py
│ │ ├── serializers.py
│ │ ├── views.py
│ │ ├── urls.py
│ │ ├── permissions.py
│ │ └── tests.py
│ └── smartseason/
│ ├── settings.py
│ ├── urls.py
│ ├── asgi.py
│ └── wsgi.py
└── frontend/
├── src/
│ ├── pages/
│ │ ├── Login.jsx
│ │ ├── Register.jsx
│ │ ├── Dashboard.jsx
│ │ ├── Fields.jsx
│ │ └── FieldDetail.jsx
│ ├── components/
│ │ ├── Navbar.jsx
│ │ ├── ProtectedRoute.jsx
│ │ ├── StatusBadge.jsx
│ │ └── Layout.jsx
│ ├── contexts/
│ │ └── AuthContext.jsx
│ ├── services/
│ │ ├── api.js
│ │ └── apiHelpers.js
│ └── App.jsx
├── package.json
├── vite.config.js
└── index.html

## Installation & Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend

Create a virtual environment:
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
Install dependencies:
pip install -r requirements.txt
Run migrations:
python manage.py migrate
Create superuser (admin):
python manage.py createsuperuser
Start the development server:
python manage.py runserver
The backend API will be available at http://localhost:8000
Frontend Setup
Navigate to frontend directory:
cd frontend
Install dependencies:
npm install
Start the development server:
npm run dev
The frontend will be available at http://localhost:5173
PI Endpoints
Authentication
POST /api/auth/token/ - Obtain auth token
POST /api/auth/register/ - Register new user
GET /api/users/profile/ - Get current user profile
Fields
GET /api/fields/ - List all fields (filtered by role)
POST /api/fields/ - Create new field (admin only)
GET /api/fields/{id}/ - Get field details
PUT /api/fields/{id}/ - Update field (admin only)
DELETE /api/fields/{id}/ - Delete field (admin only)
Field Updates
POST /api/field-updates/ - Submit field update (agents only)
GET /api/fields/{field_id}/updates/ - Get field update history
Dashboard
GET /api/dashboard/stats/ - Get dashboard statistics
Environmental Conditions Feature
How It Works
Selection: Admins select environmental conditions when creating or editing fields
Status Calculation: The system automatically marks fields as "At Risk" if:
Any risk condition is selected (stress, drought, pest, disease, damage, wilting)
"None" is selected alone → field remains in normal status logic
Visibility: Field agents immediately see status changes in their field list and details
Using the Feature
Go to "Add Field" or "Edit Field" (admin only)
Scroll to "Environmental Conditions" section
Check relevant conditions:
Multiple conditions can be selected simultaneously
Selecting "None" automatically clears other selections
Selecting any risk condition clears the "None" option
Save the field
Status automatically updates based on selections
Database Models
User
Extends Django's AbstractUser
role: Admin or Field Agent
username, email, first_name, last_name
Field
name: Field identifier
crop_type: Type of crop (corn, wheat, soybeans, rice, cotton, etc.)
planting_date: Date when crop was planted
current_stage: Current lifecycle stage
assigned_agent: ForeignKey to User (agent)
environmental_conditions: JSONField storing list of conditions
created_at, updated_at: Timestamps
FieldUpdate
field: ForeignKey to Field
agent: ForeignKey to User (agent)
stage: Stage at time of update
notes: Agent observations
created_at: Timestamp
Authentication
The application uses token-based authentication:

Register: New users register with username, email, password, and role
Login: Users obtain an auth token by providing credentials
Protected Routes: Endpoints require valid token in Authorization header
Token Storage: Frontend stores token in localStorage
Permissions
Admin Users: Full access to all fields and user management
Field Agents: Can only view and update fields assigned to them
Unauthenticated: Only access to login/register endpoints
Status Badge Colors
Active (Green): Field is healthy and progressing normally
At Risk (Red): Environmental issues detected
Completed (Gray): Field has been harvested
Recent Updates
Environmental Conditions Feature (v1.1)
Added multi-select environmental conditions field
Implemented smart status override logic
Added condition display in field details
Integrated with form validation
Future Enhancements
Weather integration API
Pest/disease detection using ML
SMS notifications for at-risk fields
Mobile app support
Historical trend analysis
Crop yield predictions
