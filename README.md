# 🏠 My Rental Room – Simplified by AI

A full-stack rental room search platform that helps users discover suitable rental properties based on their preferred location, monthly budget, and room type. It features a preference-based recommendation system, property listings, and a form for adding new rental properties.

## 🌐 Live Demo

- **Frontend:** https://my-rental-room-simplified-by-ai.vercel.app/
- **Backend API:** https://my-rental-room-backend.onrender.com
- **GitHub Repository:** https://github.com/kshitisrivastava27/My-Rental-Room-Simplified-by-AI

## ✨ Features

- **Property Listings:** Displays rental properties with images, locations, room types, and monthly rent.
- **Preference-Based Recommendations:** Calculates a match percentage using user preferences.
- **Smart Search:** Ranks properties based on location, budget, and room type.
- **Budget-Based Matching:** Gives higher priority to properties within the user's budget.
- **Favorites:** Allows users to mark properties as favorites during their session.
- **Add a Property:** Users can submit new rental listings through a form.
- **MongoDB Integration:** Stores and retrieves property information from MongoDB Atlas.
- **Responsive Interface:** Provides a user-friendly interface for different screen sizes.

## 🛠️ Tech Stack

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express.js
- REST API

**Database**
- MongoDB Atlas

**Deployment**
- Vercel — Frontend
- Render — Backend

## 🧠 How the Recommendation System Works

The application calculates a recommendation score using three weighted preferences:

| Preference | Weight |
|---|---:|
| Location match | 40 points |
| Within-budget match | 35 points |
| Room type match | 25 points |
| **Total possible score** | **100 points** |

The match percentage is calculated using:

`Match Percentage = (Earned Points / Applicable Preference Weights) × 100`

Only the preferences entered by the user are included in the denominator. This allows recommendations to work even when the user provides only some preferences.

Properties are ranked by their recommendation scores, with lower-priced properties appearing first when scores are equal.

*Note: This is a rule-based recommendation algorithm, not a trained machine-learning model.*

## 🏗️ Project Structure

```text
MYRENTALROOM/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
├── .gitignore
└── README.md
```

## ⚙️ Run the Project Locally

### Prerequisites

- Node.js and npm
- A MongoDB Atlas account, or another compatible MongoDB deployment
- Git

### 1. Clone the repository

```bash
git clone https://github.com/kshitisrivastava27/My-Rental-Room-Simplified-by-AI.git
cd My-Rental-Room-Simplified-by-AI
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

Replace the example database value with your own MongoDB Atlas connection string. Never commit your `.env` file or expose database credentials.

### 3. Start the backend

```bash
node server.js
```

The backend should start on port `5000` when running locally, provided the environment is configured correctly.

### 4. Run the frontend

Open `frontend/index.html` using a local development server, such as the VS Code Live Server extension.

Ensure the API URL in `frontend/script.js` points to the backend you want to use:

```javascript
// Local development
const API_URL = "http://localhost:5000/api/properties";

// Production
// const API_URL = "https://my-rental-room-backend.onrender.com/api/properties";
```

Use the appropriate URL for your environment. If both deployments are active, the production frontend should use the deployed backend URL.

## 🔌 API Endpoints

Base URL:

`https://my-rental-room-backend.onrender.com`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/properties` | Retrieves property listings |
| POST | `/api/properties` | Adds a new property |

### Example Property

```json
{
  "title": "Modern 1 BHK Apartment",
  "location": "Kalyanpur, Kanpur",
  "price": 8500,
  "type": "1 BHK",
  "image": "https://example.com/property.jpg"
}
```

The backend validates the property details before saving a new listing.

## 🔮 Future Improvements

- User authentication and authorization
- Persistent favorites linked to user accounts
- Detailed property pages with owner contact information
- Property availability and booking functionality
- Advanced filtering and sorting options
- More personalized recommendations based on user behavior
- Automated testing and improved input validation

## 👩‍💻 Author

**Kshiti Srivastava**

Computer Science and Engineering Student

- GitHub: [kshitisrivastava27](https://github.com/kshitisrivastava27)

---

If you find this project useful, feel free to explore the repository and share feedback.