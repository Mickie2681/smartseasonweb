from pathlib import Path
import os
from decouple import config, Csv
import dj_database_url

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# --- SECURITY ---
SECRET_KEY = config('SECRET_KEY', default='django-insecure-5o!8*is8id=rcnuf8px3bz^qx99=kr%0tfefjzf4-_=pf009(n)')

# Set DEBUG to False in Render via environment variable
DEBUG = config('DEBUG', default=False, cast=bool)

# Allow Render domains and local development
ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS', 
    default='localhost,127.0.0.1,.onrender.com', 
    cast=Csv()
)

# --- Application definition ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    # Local apps
    'field',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Must be at the top
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # For static files on Render
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'smartseason.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'smartseason.wsgi.application'

# --- Database ---
if os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'), 
            conn_max_age=600
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='season_db'),
            'USER': config('DB_USER', default='seasonadmin'),
            'PASSWORD': config('DB_PASSWORD', default='Pilhaw@20'),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }

# --- Static files ---
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Use WhiteNoise's storage for compression (safer version for first deploy)
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# --- CORS & CSRF ---
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=False, cast=bool)

CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,https://smartseasonweb.vercel.app',
    cast=Csv()
)

# Trust the Vercel frontend for secure requests
CSRF_TRUSTED_ORIGINS = [
    "https://smartseasonweb.vercel.app",
    "https://*.onrender.com"
]

# --- REST Framework ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# --- Custom Settings ---
AUTH_USER_MODEL = 'field.User'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

FIELD_STAGE_CHOICES = [
    ('planted', 'Planted'),
    ('growing', 'Growing'),
    ('ready', 'Ready'),
    ('harvested', 'Harvested'),
]