# ai-powered-company-website-builder

# ATS System - Resume Builder & Job Management Platform

A comprehensive Applicant Tracking System (ATS) with AI-powered resume builder, job management, blog posting, and admin dashboard.

## Features

### 🎯 Resume Builder
- **AI-Powered Resume Creation**: Build professional resumes with multiple templates
- **Template Selection**: Choose from Modern, Minimal, Executive, and Creative templates
- **AI Scoring**: Get real-time feedback on resume quality, ATS match, and impact score
- **PDF Download**: Download clean, professional resumes ready for job applications
- **MongoDB Storage**: All resume data is securely stored in MongoDB

### 💼 Job Management
- **Job Posting**: Admin can post new job roles with detailed descriptions
- **ATS Configuration**: Configure evaluation criteria (skills, experience, education weights)
- **Application Tracking**: Automatic resume analysis and accuracy scoring
- **Status Management**: Track applications (Selected/Rejected) based on ATS accuracy threshold

### 📝 Blog Management
- **Blog Posting**: Create and publish blog posts with images
- **AI Summarization**: Automatic AI-generated summaries and SEO descriptions
- **Image Support**: Upload featured images and content images (base64 encoded)
- **CRUD Operations**: Full create, read, update, delete functionality

### 👨‍💼 Admin Dashboard
- **Analytics**: View applications, contacts, jobs, and blog posts
- **Job Management**: View, edit, delete, and toggle job status
- **Blog Management**: Create, edit, and delete blog posts
- **Application Review**: Review and manage job applications

### 🎨 User Features
- **Careers Page**: Browse and apply for job openings
- **Application Status**: View application status in real-time
- **Blog Reading**: Read blog posts with AI-generated summaries
- **Resume Builder**: Access the resume builder from navigation

## Tech Stack

### Frontend
- **React** with React Router
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Axios** for API calls
- **Sonner** for toast notifications

### Backend
- **FastAPI** (Python)
- **MongoDB** with Motor (async driver)
- **HuggingFace API** for AI content generation
- **pdfplumber** & **python-docx** for resume parsing
- **bcrypt** for password hashing

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (local or cloud)
- HuggingFace API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file in backend directory:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=ats_system
HUGGINGFACE_API_KEY=your_huggingface_api_key
HUGGINGFACE_MODEL=meta-llama/Llama-3.1-8B-Instruct
CORS_ORIGINS=http://localhost:3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

4. Run the backend server:
```bash
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory (optional):
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
ats-system-main/
├── backend/
│   ├── server.py          # FastAPI main application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables (not in git)
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # React components
│   │   └── App.js        # Main app router
│   └── package.json     # Node dependencies
├── .gitignore           # Git ignore rules
└── README.md           # This file
```

## API Endpoints

### Resume Builder
- `POST /api/resumes` - Create new resume
- `GET /api/resumes` - Get all resumes (optional email filter)
- `GET /api/resumes/{resume_id}` - Get specific resume

### Job Management
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/{job_id}` - Update job
- `DELETE /api/jobs/{job_id}` - Delete job
- `POST /api/applications` - Submit job application

### Blog Management
- `GET /api/blog` - Get all blog posts
- `POST /api/blog` - Create blog post
- `GET /api/blog/{slug}` - Get specific blog post
- `PUT /api/blog/{slug}` - Update blog post
- `DELETE /api/blog/{slug}` - Delete blog post
- `POST /api/blog/{slug}/summarize` - Generate AI summary

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/analytics` - Get dashboard analytics

## Environment Variables

### Backend (.env)
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `HUGGINGFACE_API_KEY` - HuggingFace API key for AI features
- `HUGGINGFACE_MODEL` - HuggingFace model name
- `CORS_ORIGINS` - Allowed CORS origins
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD` - Admin login password (bcrypt hashed)

### Frontend (.env)
- `REACT_APP_BACKEND_URL` - Backend API URL (defaults to http://localhost:8000)

## Security Notes

- `.env` files are excluded from git
- Admin passwords are hashed using bcrypt
- CORS is configured for security
- All sensitive data should be in `.env` files only

## License

This project is private and proprietary.

## Contributing

This is a private project. For issues or questions, contact the project maintainer.
