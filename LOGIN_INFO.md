# PerfectRatio Admin Login Information

## Default Login Credentials

**Password:** `admin123`

## How to Access

1. Go to your Railway app URL
2. You'll be redirected to the login page
3. Enter the password: `admin123`
4. Click "Sign In"

## To Change the Password

Set the `ADMIN_PASSWORD` environment variable in Railway:

1. Go to your Railway project
2. Click on your service
3. Go to Variables tab
4. Add a new variable:
   - Key: `ADMIN_PASSWORD`
   - Value: `your-new-password`
5. Click "Add" and the app will redeploy

## Troubleshooting

If you get "Connection error":
- Make sure you're using the correct password
- Check that the server has deployed successfully
- Try refreshing the page

## Security Note

This is a basic authentication system suitable for personal use. For production applications with multiple users, consider implementing proper JWT authentication with bcrypt password hashing.