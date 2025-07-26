🎬 YouTube Clone Backend (Node.js + Express)

A backend API for a YouTube-like platform with features like auth, video upload, comments, likes, subscriptions, and playlists.

🚀 Tech Stack

- Node.js, Express.js, MongoDB (Mongoose)
- JWT for Auth, Cloudinary for Uploads
- dotenv, custom middlewares, RESTful structure

📁 Structure

src/
├── controllers/
├── routes/
├── middlewares/
├── models/
├── utils/
├── app.js
└── index.js


🛠️ Setup

git clone https://github.com/your-username/youtube-clone-backend.git
cd youtube-clone-backend
npm install
Create .env:

makefile
Copy
Edit
MONGODB_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
Run:
npm run dev

📦 Features
User Auth (Register/Login)

Upload & Manage Videos

Likes/Dislikes, Comments

Subscriptions, Playlists

Error Handling, Async Wrapper

📪 Routes Example
POST /api/v1/users/register

POST /api/v1/videos/upload

GET /api/v1/videos/

🤘 Author
Subhadeep Ghosh — Metalhead 💀 | Coder ⚙️
