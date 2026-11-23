# NGO Community App

A web application that connects NGOs with communities, helping people discover NGOs, explore community needs, and coordinate support.

**Live application:** https://bucolic-kataifi-d21d7c.netlify.app\

## 🚀 Features

### Core Functionality
- **User Authentication**: Login/Register for regular users and NGOs
- **NGO Management**: Registration, approval system, and profile management
- **Requirements System**: Post and search for NGO requirements
- **Search & Discovery**: Find NGOs by location, category, or name
- **Messaging System**: Direct communication between users and NGOs
- **Admin Dashboard**: Comprehensive administration panel

## 🛠️ Tech Stack

### Frontend

-   React
-   Vite
-   Bootstrap
-   Axios
-   Redux

### Backend

-   Node.js
-   Express.js
-   MongoDB with Mongoose
-   JSON Web Tokens (JWT)
-   bcryptjs

## 📁 Project Structure

```
ngo-community/
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── redux/
│   ├── styles/
│   ├── server/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── server.js
│   │   └── package.json
│   ├── App.jsx
│   ├── config.js
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Run Locally

### Prerequisites

-   Node.js and npm
-   A MongoDB database (MongoDB Atlas or a local MongoDB instance)
-   Git

### 1. Clone the repository

``` bash
git clone https://github.com/shyambendale/ngo-community.git
cd ngo-community
```

### 2. Install frontend dependencies

Run this from the repository root:

``` bash
npm install
```

### 3. Configure the backend

Go to the backend directory:

``` bash
cd src/server
npm install
```

Create a `.env` file inside `src/server/`:

``` env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

Optional administrator bootstrap variables:

``` env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use_a_strong_unique_password
```

The backend creates an administrator account when both `ADMIN_EMAIL` and
`ADMIN_PASSWORD` are configured and that email does not already exist.

**Important:** Replace all example values with your own. Never commit
`.env`, database credentials, JWT secrets, or administrator passwords to
GitHub. The backend reads `MONGO_URI` (not `MONGODB_URI`).

### 4. Start the backend

From `src/server/`:

``` bash
npm run dev
```

The backend uses port `5000` by default. You can check that it is
running by opening:

``` text
http://localhost:5000/
```

Expected response:

``` json
{
  "status": "NGO API running"
}
```

### 5. Configure the frontend API URL

Create a `.env` file in the repository root:

``` env
VITE_API_URL=http://localhost:5000
```

The frontend uses this value to connect to the backend. If it is not
set, the current frontend configuration falls back to
`http://localhost:5000`.

### 6. Start the frontend

Open a second terminal at the repository root and run:

``` bash
npm run dev
```

Open the local URL printed by Vite, usually:

``` text
http://localhost:5173
```

## Environment Variables

### Backend (`src/server/.env`)

  -----------------------------------------------------------------------
  Variable                Required                Purpose
  ----------------------- ----------------------- -----------------------
  `MONGO_URI`             Yes                     MongoDB connection
                                                  string

  `JWT_SECRET`            Yes                     Secret used to sign and
                                                  verify JWTs

  `PORT`                  No                      Backend port; defaults
                                                  to `5000`

  `CLIENT_URL`            Recommended             Allowed frontend
                                                  origin(s) for CORS;
                                                  comma-separated values
                                                  are supported

  `ADMIN_EMAIL`           No                      Email for initial
                                                  administrator account
                                                  creation

  `ADMIN_PASSWORD`        No                      Password for initial
                                                  administrator account
                                                  creation
  -----------------------------------------------------------------------

### Frontend (root `.env`)

  Variable         Required      Purpose
  ---------------- ------------- -----------------------------
  `VITE_API_URL`   Recommended   Base URL of the backend API

Do not put private credentials in variables prefixed with `VITE_`;
frontend variables are exposed to the browser.

## Deployment

This project is deployed with the frontend and backend as separate
services.

### Frontend --- Netlify

-   Repository: `shyambendale/ngo-community`
-   Branch: `main`
-   Base directory: leave blank
-   Build command: `npm run build`
-   Publish directory: `dist`
-   Environment variable:
    `VITE_API_URL=https://ngo-community-wrjs.onrender.com`

### Backend --- Render

-   Repository: `shyambendale/ngo-community`
-   Branch: `main`
-   Root directory: `src/server`
-   Build command: `npm install`
-   Start command: `npm start`

Configure these backend environment variables in Render: `MONGO_URI`,
`JWT_SECRET`, and `CLIENT_URL`. Set `CLIENT_URL` to the exact deployed
Netlify site origin, without a trailing slash. Add the optional
administrator variables only if you want the backend to bootstrap an
administrator account.

The backend CORS configuration reads `CLIENT_URL` and supports
comma-separated origins. After changing backend environment variables,
save and redeploy the Render service.

## Security Notes

-   Keep `.env` files out of version control.
-   Use a unique, strong `JWT_SECRET` in production.
-   Use a strong MongoDB database password.
-   Do not expose MongoDB credentials, JWT secrets, or administrator
    credentials in frontend code.
-   Configure CORS with the actual frontend origin(s), rather than
    allowing every origin in production.

## 📱 Features Overview

### 1. User Authentication
- **Login/Register**: Secure user authentication system
- **Role-based Access**: Different permissions for users, NGOs, and admins
- **Session Management**: Persistent login state with localStorage

### 2. NGO Management
- **Registration**: Comprehensive NGO registration form
- **Approval System**: Admin approval workflow for new NGOs
- **Profile Management**: NGO information and status tracking

### 3. Requirements System
- **Post Requirements**: NGOs can post what they need
- **Search & Filter**: Find requirements by category or description
- **Status Tracking**: Monitor requirement fulfillment status

### 4. Search & Discovery
- **Advanced Search**: Filter NGOs by city, category, and name
- **Real-time Results**: Instant search results with filtering
- **Responsive Design**: Works on all device sizes

### 5. Messaging System
- **Direct Communication**: Private messaging between users
- **Conversation Management**: Organized chat interface
- **Real-time Updates**: Instant message delivery

### 6. Admin Dashboard
- **Overview Statistics**: Platform usage metrics
- **NGO Approval**: Review and approve NGO registrations
- **System Monitoring**: Platform health and status

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Bootstrap 5
- **Modern Interface**: Clean, professional design
- **Accessibility**: WCAG compliant with proper focus management
- **Custom Styling**: Enhanced Bootstrap components with custom CSS
- **Smooth Animations**: CSS transitions and hover effects

## 🔒 Security Features

- **Protected Routes**: Role-based access control
- **Input Validation**: Form validation and sanitization
- **Error Handling**: Comprehensive error management
- **Secure API Calls**: Proper authentication headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

No license has been specified yet. Unless a license is added to this
repository, the project is not explicitly offered for reuse,
modification, or redistribution.

## 🔮 Future Enhancements

- **Real-time Notifications**: Push notifications for updates
- **File Upload**: Support for document and image uploads
- **Advanced Analytics**: Detailed reporting and insights
- **Mobile App**: React Native mobile application
- **Multi-language Support**: Internationalization (i18n)
- **Advanced Search**: Elasticsearch integration
- **Payment Integration**: Donation and payment processing

---

**Built with ❤️ using React.js and Bootstrap**
