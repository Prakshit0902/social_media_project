# Deployment Guide: Synapse Social Media App

## 🚀 Deployment Checklist

### **Backend Deployment (Render)**

#### 1. **Create Account & New Web Service**
- Go to [Render.com](https://render.com)
- Click "New +" → "Web Service"
- Connect your GitHub repository

#### 2. **Configure Build Settings**
- **Name**: synapse-backend (or your choice)
- **Region**: Choose closest to your users
- **Branch**: main
- **Root Directory**: backend
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### 3. **Set Environment Variables in Render Dashboard**
Add these variables in the Environment section:

**Note**: Do NOT add PORT - Render automatically provides this!

```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
FRONTEND_URL=https://synapse-net.netlify.app

ACCESS_TOKEN_SECRET=your_secret_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_secret_here
REFRESH_TOKEN_EXPIRY=7d

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### 4. **Deploy Backend**
- Click "Create Web Service"
- Wait for deployment to complete
- Note your backend URL: `https://your-app-name.onrender.com`

---

### **Frontend Deployment (Netlify)**

#### 1. **Update Environment Variable**
In Netlify Dashboard:
- Go to Site Settings → Environment Variables
- Add: `VITE_API_URL` = `https://your-backend-url.onrender.com`

#### 2. **Build & Deploy**
Netlify will automatically:
- Detect your `netlify.toml` configuration
- Run `npm run build`
- Deploy from `dist` folder
- Handle SPA routing with redirects

#### 3. **Verify Deployment**
- Your site: `https://synapse-net.netlify.app`
- Check browser console for API connection
- Test login/signup functionality

---

### **MongoDB Atlas Setup** (if not done)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster

2. **Network Access**
   - Add IP: `0.0.0.0/0` (Allow from anywhere)
   - Or add Render's IP addresses

3. **Database User**
   - Create user with read/write permissions
   - Note username and password

4. **Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```

---

### **Cloudinary Setup** (for file uploads)

1. Go to [Cloudinary](https://cloudinary.com)
2. Get your credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Add to Render environment variables

---

## 🔧 Post-Deployment Configuration

### **Test Your Deployment**

1. **Backend Health Check**
   ```bash
   curl https://your-backend-url.onrender.com/api/v1/healthcheck
   ```

2. **Frontend Connection**
   - Open browser console at `https://synapse-net.netlify.app`
   - Check for "API Base URL:" log
   - Should show your Render backend URL

3. **Test Features**
   - ✅ User Registration
   - ✅ Login
   - ✅ Create Post (with image/video upload)
   - ✅ Real-time chat
   - ✅ Socket.IO connection

---

## 🐛 Troubleshooting

### **CORS Errors**
- Verify `FRONTEND_URL` in Render matches exactly: `https://synapse-net.netlify.app`
- Check backend logs in Render dashboard
- Ensure no trailing slashes in URLs

### **Socket.IO Not Connecting**
- Check browser console for connection errors
- Verify Socket.IO CORS configuration
- Ensure backend URL in frontend is correct

### **File Uploads Failing**
- Verify Cloudinary credentials in Render
- Check file size limits
- Ensure `public/temp` folder exists (Render creates it)

### **Database Connection Issues**
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

---

## 📝 Important Notes

### **Render Free Tier**
- Service spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds (cold start)
- Consider keeping service warm or upgrading

### **Environment Variables**
- Never commit `.env` files to Git
- Update `.gitignore` to exclude:
  ```
  .env
  .env.local
  .env.production
  ```

### **MongoDB Atlas**
- Free tier: 512MB storage
- Monitor usage in Atlas dashboard
- Set up automated backups

---

## 🔄 Continuous Deployment

Both platforms auto-deploy on Git push:

**Render**: Watches your `main` branch for changes
**Netlify**: Watches your repository for changes

To deploy updates:
```bash
git add .
git commit -m "your message"
git push origin main
```

---

## 🔐 Security Checklist

- ✅ All secrets in environment variables
- ✅ CORS properly configured
- ✅ MongoDB IP whitelist configured
- ✅ HTTPS enabled (automatic on both platforms)
- ✅ Credentials not in code
- ✅ `.env` files in `.gitignore`

---

## 📊 Monitoring

**Render Dashboard**: 
- View logs
- Monitor CPU/Memory usage
- Check deployment history

**Netlify Dashboard**:
- Build logs
- Deploy history
- Bandwidth usage

**MongoDB Atlas**:
- Database metrics
- Query performance
- Storage usage

---

## 🆘 Support

If you encounter issues:
1. Check service logs in dashboards
2. Verify all environment variables
3. Test API endpoints directly
4. Check browser console for errors

---

## 🎉 Your App is Live!

**Frontend**: https://synapse-net.netlify.app
**Backend**: https://your-backend-url.onrender.com
**Database**: MongoDB Atlas

Happy Deploying! 🚀
