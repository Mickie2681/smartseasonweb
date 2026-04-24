# Deploying SmartSeason to Render

This guide will walk you through deploying the SmartSeason application to Render.

## Prerequisites

1. GitHub account (already have your code pushed)
2. Render account (free at https://render.com)
3. Your GitHub repository URL: https://github.com/Mickie2681/smartseason.git

## Step-by-Step Deployment

### Step 1: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → Select **"PostgreSQL"**
3. Fill in the details:
   - **Name**: `smartseason-db`
   - **Database**: `smartseason_db`
   - **User**: `seasonadmin`
   - **Region**: Choose closest to you
   - **Plan**: Free (for testing)
4. Click **"Create Database"**
5. Copy the **Internal Database URL** (starts with `postgresql://`)
   - Save this for later

### Step 2: Deploy Django Backend

1. Click **"New +"** → Select **"Web Service"**
2. Connect your GitHub repository:
   - Click **"Connect account"** and authorize GitHub
   - Select `smartseason` repository
   - Branch: `main`
3. Configure the service:
   - **Name**: `smartseason-api`
   - **Environment**: `Python 3.9`
   - **Build Command**: 
     ```bash
     pip install -r backend/requirements-production.txt && cd backend && python manage.py migrate && python manage.py collectstatic --noinput
     ```
   - **Start Command**:
     ```bash
     cd backend && gunicorn smartseason.wsgi:application --bind 0.0.0.0:$PORT
     ```
   - **Plan**: Free (for testing)

4. Add Environment Variables (click **"Add Environment Variable"**):
   
   | Key | Value |
   |-----|-------|
   | `DEBUG` | `False` |
   | `SECRET_KEY` | Generate a strong key: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
   | `ALLOWED_HOSTS` | `smartseason-api.onrender.com` (will update after deployment) |
   | `DB_NAME` | `smartseason_db` |
   | `DB_USER` | `seasonadmin` |
   | `DB_PASSWORD` | (From your database creation) |
   | `DB_HOST` | (Internal Database URL host part) |
   | `DB_PORT` | `5432` |
   | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,https://your-frontend-url.onrender.com` |
   | `PYTHON_VERSION` | `3.9` |

5. Click **"Create Web Service"**
6. Wait for deployment to complete (5-10 minutes)
7. Copy the deployment URL (e.g., `https://smartseason-api.onrender.com`)

### Step 3: Deploy React Frontend

1. Click **"New +"** → Select **"Static Site"**
2. Connect your GitHub repository (same as backend)
3. Configure the service:
   - **Name**: `smartseason-web`
   - **Build Command**:
     ```bash
     cd frontend && npm install && npm run build
     ```
   - **Publish directory**: `frontend/dist`
   - **Plan**: Free

4. Add Environment Variables:
   
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://smartseason-api.onrender.com` (use your backend URL) |

5. Click **"Create Static Site"**
6. Wait for deployment (5-10 minutes)
7. Copy the frontend URL (e.g., `https://smartseason-web.onrender.com`)

### Step 4: Update CORS Settings

1. Go back to your **backend Web Service** (smartseason-api)
2. Click **"Environment"**
3. Update `CORS_ALLOWED_ORIGINS` to include your frontend URL:
   ```
   https://smartseason-web.onrender.com,https://your-custom-domain.com
   ```
4. Render will redeploy automatically

### Step 5: Test the Deployment

1. Visit your frontend URL: `https://smartseason-web.onrender.com`
2. Try to register a new account
3. Login and test the functionality
4. Create/edit fields to verify everything works

## Troubleshooting

### Backend deployment fails
- Check build logs in Render dashboard
- Ensure all environment variables are set correctly
- Verify database credentials

### API calls return 401/403
- Check CORS settings in backend environment variables
- Ensure token is being sent in requests
- Check browser console for errors

### Frontend shows blank page
- Check browser console for errors
- Verify `VITE_API_URL` is set correctly
- Clear browser cache and reload

### Database migration fails
- Check database credentials
- Ensure database exists
- Try manually running migration command in terminal

## Environment Variables Reference

### Backend (.env or Render Environment)
```
DEBUG=False
SECRET_KEY=your-random-secret-key
ALLOWED_HOSTS=smartseason-api.onrender.com
DB_NAME=smartseason_db
DB_USER=seasonadmin
DB_PASSWORD=your-password
DB_HOST=your-db-host.render.internal
DB_PORT=5432
CORS_ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
```

### Frontend (.env.local or Render Environment)
```
VITE_API_URL=https://smartseason-api.onrender.com
```

## Production Checklist

- [ ] DEBUG is set to `False`
- [ ] SECRET_KEY is a strong random string
- [ ] Database credentials are correct
- [ ] CORS_ALLOWED_ORIGINS includes your frontend URL
- [ ] ALLOWED_HOSTS includes your backend domain
- [ ] Both services deployed successfully
- [ ] Can register and login
- [ ] Can create/edit/delete fields
- [ ] Environmental conditions feature works
- [ ] Status badges display correctly

## Custom Domain (Optional)

1. In Render dashboard, go to your service
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain
4. Update DNS records (instructions provided by Render)
5. Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` with your custom domain

## Performance Tips

- Use Render's free tier for development/testing
- Upgrade to paid plans for production reliability
- Consider upgrading database to "Standard" for better performance
- Monitor logs in Render dashboard
- Set up error tracking with services like Sentry

## Further Documentation

- [Render Django Deployment](https://render.com/docs/deploy-django)
- [Render Static Site Deployment](https://render.com/docs/static-sites)
- [Django Production Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)

---

For questions or issues, check the Render support documentation or your application logs.
