# FlightWatch AI - Frontend

A modern, vanilla JavaScript web application for tracking flight prices and getting alerts when great deals appear.

## 🚀 Features

- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Real-time Flight Search** - Search across multiple airlines
- **Watchlist Management** - Create and manage multiple price watches
- **Price History Charts** - Visualize price trends with Chart.js
- **Smart Notifications** - Email, push, and in-app alerts
- **User Authentication** - Secure login/signup with JWT
- **Settings & Preferences** - Customize notifications and preferences
- **Modern Stack** - Vanilla JS, Vite, Tailwind CSS, Chart.js

## 🛠️ Tech Stack

- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Charts**: Chart.js 4
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Cookies**: js-cookie

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running on `http://localhost:3000`

## ⚙️ Installation

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Update .env if needed**
```
VITE_API_BASE_URL=http://localhost:3000
```

## 🎯 Development

### Start development server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/                  # API service modules
│   │   ├── auth.js          # Authentication API
│   │   ├── flights.js       # Flights API
│   │   ├── watchlist.js     # Watchlist API
│   │   └── notifications.js # Notifications API
│   ├── components/          # Reusable components
│   │   └── header.js        # Navigation header
│   ├── pages/               # Page components
│   │   ├── home.js          # Landing page
│   │   ├── login.js         # Login page
│   │   ├── signup.js        # Signup page
│   │   ├── dashboard.js     # Dashboard
│   │   ├── search.js        # Flight search
│   │   ├── watchlist.js     # Watchlist management
│   │   ├── watchlist-details.js # Watch details
│   │   ├── notifications.js # Notifications page
│   │   └── settings.js      # User settings
│   ├── styles/
│   │   └── main.css         # Global styles
│   ├── utils/               # Utility functions
│   │   ├── api.js           # Axios instance
│   │   ├── storage.js       # Local storage helpers
│   │   ├── router.js        # SPA router
│   │   └── helpers.js       # Format & utility functions
│   └── main.js              # Application entry point
├── public/                  # Static assets
├── index.html              # HTML entry point
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies
```

## 🔐 Authentication Flow

1. User signs up or logs in
2. JWT token is stored in cookies and localStorage
3. Token is automatically attached to API requests via axios interceptor
4. Protected routes redirect to login if not authenticated
5. On 401 response, token is cleared and user is redirected to login

## 🎨 Styling

The project uses Tailwind CSS with custom configuration:

- **Primary Color**: `#0284c7` (Sky Blue)
- **Secondary Color**: `#8b5cf6` (Violet)
- **Custom Animations**: fadeIn, slideInUp, spin-slow

### Utility Classes

```html
<!-- Fade in animation -->
<div class="fade-in"></div>

<!-- Slide up animation -->
<div class="slide-in-up"></div>

<!-- Skeleton loading -->
<div class="skeleton"></div>
```

## 🌐 API Integration

The application connects to the backend API at `http://localhost:3000`

### Key API Endpoints

```
POST   /auth/signup              - User registration
POST   /auth/login               - User login
POST   /auth/logout              - User logout
PUT    /user/profile             - Update profile
POST   /auth/change-password     - Change password

GET    /watchlist                - Get all watchlists
GET    /watchlist/:id            - Get watchlist details
POST   /watchlist                - Create watchlist
PUT    /watchlist/:id            - Update watchlist
DELETE /watchlist/:id            - Delete watchlist
PATCH  /watchlist/:id            - Toggle active status
GET    /watchlist/:id/price-history - Get price history

GET    /flights/search           - Search flights
GET    /flights/:id              - Get flight details
GET    /flights/airlines         - Get airlines list
GET    /flights/airports         - Get airports list

GET    /notifications            - Get all notifications
GET    /notifications/unread     - Get unread notifications
PATCH  /notifications/:id/read   - Mark as read
PATCH  /notifications/read-all   - Mark all as read
GET    /notifications/preferences - Get preferences
PUT    /notifications/preferences - Update preferences
DELETE /notifications/:id        - Delete notification
```

## 🚦 Routing

Routes are managed using a custom SPA router in `src/utils/router.js`

### Public Routes
- `/` - Home/Landing page
- `/login` - Login page
- `/signup` - Signup page

### Protected Routes (require authentication)
- `/dashboard` - Main dashboard
- `/search` - Flight search
- `/watchlist` - Watchlist management
- `/watchlist/:id` - Watchlist details
- `/notifications` - User notifications
- `/settings` - User settings
- `/profile` - Profile settings

## 💾 Local Storage

The app uses localStorage for:
- Authentication token (backup)
- Current user information
- Search history

```javascript
// Token
localStorage.setItem('user_token', token)
localStorage.getItem('user_token')

// User
localStorage.setItem('current_user', JSON.stringify(user))
localStorage.getItem('current_user')
```

## 🔔 Notifications

Users receive notifications for:
- **Price Drops** - When tracked flight prices decrease
- **Price Alerts** - When prices reach target budget
- **System Alerts** - App notifications and updates

Notification preferences can be configured in Settings.

## 📊 Charts

The watchlist details page displays price history using Chart.js:

```javascript
new Chart(ctx, {
  type: 'line',
  data: {
    labels: dates,
    datasets: [{
      label: 'Price Trend',
      data: prices,
      // Chart configuration
    }]
  }
});
```

## 🎯 Helper Functions

Located in `src/utils/helpers.js`:

```javascript
formatPrice(1200)           // '$1,200'
formatDate('2024-05-31')    // 'May 31, 2024'
formatTime('14:30')         // '2:30 PM'
getPriceStatus(100, 150)    // 'down'
getPriceColor('down')       // 'text-green-600'
showNotification(msg, type) // Show toast notification
```

## 🚀 Deployment

### Build for production
```bash
npm run build
```

### Serve from `dist/` folder
The built files are optimized and ready for deployment to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## 🔗 Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=FlightWatch AI
```

## 🐛 Debugging

Enable API logging by adding to main.js:
```javascript
api.interceptors.response.use(response => {
  console.log('API Response:', response);
  return response;
});
```

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome for Android)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request

## 📄 License

ISC - See LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the backend API is running
2. Verify environment variables
3. Check browser console for errors
4. Ensure all dependencies are installed

---

Built with ❤️ using Vanilla JavaScript, Vite, and Tailwind CSS
