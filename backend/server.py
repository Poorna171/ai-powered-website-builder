from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import httpx
import pdfplumber
from docx import Document
import io
import bcrypt
import base64
import json
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# HuggingFace Configuration
HF_API_KEY = os.environ['HUGGINGFACE_API_KEY']
HF_MODEL = os.environ['HUGGINGFACE_MODEL']
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== AI Helper Functions ====================
async def generate_ai_content(prompt: str, max_tokens: int = 500) -> str:
    """Generate content using Llama model via HuggingFace API"""
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": max_tokens,
            "temperature": 0.7,
            "top_p": 0.9,
            "return_full_text": False
        }
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(HF_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get('generated_text', '').strip()
            return str(result)
        except Exception as e:
            logging.error(f"AI generation error: {str(e)}")
            return "Content generation temporarily unavailable."

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            text = ''
            for page in pdf.pages:
                text += page.extract_text() or ''
        return text
    except Exception as e:
        logging.error(f"PDF extraction error: {str(e)}")
        return ""

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        doc = Document(io.BytesIO(file_content))
        text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        logging.error(f"DOCX extraction error: {str(e)}")
        return ""

# ==================== Models ====================
class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactSubmissionCreate(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str

class ATSConfig(BaseModel):
    """ATS Configuration for job evaluation"""
    min_accuracy_threshold: int = 85  # Minimum accuracy to be selected (0-100)
    skill_weight: float = 0.30  # Weight for skills matching (0-1)
    experience_weight: float = 0.25  # Weight for experience matching (0-1)
    education_weight: float = 0.20  # Weight for education matching (0-1)
    qualification_weight: float = 0.15  # Weight for qualification matching (0-1)
    overall_fit_weight: float = 0.10  # Weight for overall fit (0-1)
    required_skills: List[str] = []  # Must-have skills
    preferred_skills: List[str] = []  # Nice-to-have skills
    min_experience_years: Optional[int] = None  # Minimum years of experience
    required_education: Optional[str] = None  # Required education level
    evaluation_criteria: Optional[str] = None  # Custom evaluation instructions

class JobPosting(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    department: str
    location: str
    type: str  # Full-time, Part-time, Contract, Internship
    description: str
    qualification: str  # Required qualifications
    timings: str  # Work timings
    requirements: List[str]
    responsibilities: List[str]
    ats_config: Optional[ATSConfig] = None  # ATS configuration
    status: str = "active"  # active, closed
    posted_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JobPostingCreate(BaseModel):
    title: str
    department: str
    location: str
    type: str
    description: str
    qualification: str
    timings: str
    requirements: List[str]
    responsibilities: List[str]
    ats_config: Optional[ATSConfig] = None  # ATS configuration

class JobApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    job_title: str
    name: str
    email: EmailStr
    phone: str
    resume_text: str
    resume_file: Optional[str] = None  # Base64 encoded file content
    resume_filename: Optional[str] = None  # Original filename
    resume_file_size: Optional[int] = None  # File size in bytes
    resume_content_type: Optional[str] = None  # MIME type (application/pdf, etc.)
    cover_letter: Optional[str] = None
    ai_analysis: Optional[Dict[str, Any]] = None
    status: str = "pending"  # pending, reviewing, shortlisted, rejected
    applied_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    summary: Optional[str] = None  # AI-generated summary
    author: str
    tags: List[str] = []
    featured_image: Optional[str] = None  # Base64 encoded image
    images: List[str] = []  # Additional images in content (base64 encoded)
    seo_description: Optional[str] = None
    published: bool = False
    created_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogPostCreate(BaseModel):
    title: str
    content: str
    author: str
    tags: List[str] = []
    featured_image: Optional[str] = None  # Base64 encoded image
    images: List[str] = []  # Additional images (base64 encoded)
    published: bool = False

class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    company: str
    position: Optional[str] = None
    content: str
    rating: int = 5
    avatar: Optional[str] = None
    featured: bool = False
    created_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TestimonialCreate(BaseModel):
    client_name: str
    company: str
    position: Optional[str] = None
    content: str
    rating: int = 5
    avatar: Optional[str] = None

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    technologies: List[str]
    category: str
    image: Optional[str] = None
    client: Optional[str] = None
    completion_date: Optional[str] = None
    featured: bool = False
    created_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectCreate(BaseModel):
    title: str
    description: str
    technologies: List[str]
    category: str
    image: Optional[str] = None
    client: Optional[str] = None
    completion_date: Optional[str] = None

class CaseStudy(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    client: str
    challenge: str
    solution: str
    results: str
    ai_summary: Optional[str] = None
    technologies: List[str]
    image: Optional[str] = None
    created_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CaseStudyCreate(BaseModel):
    title: str
    client: str
    challenge: str
    solution: str
    results: str
    technologies: List[str]
    image: Optional[str] = None

class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    password_hash: str
    created_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    username: str
    password: str

class ChatMessage(BaseModel):
    message: str

class AIRequest(BaseModel):
    prompt: str
    context: Optional[str] = None

# ==================== Routes ====================
@api_router.get("/")
async def root():
    return {"message": "MasterSolis InfoTech API"}

# Contact Routes
@api_router.post("/contact", response_model=ContactSubmission)
async def submit_contact(input: ContactSubmissionCreate):
    contact_dict = input.model_dump()
    contact_obj = ContactSubmission(**contact_dict)
    
    doc = contact_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.contact_submissions.insert_one(doc)
    
    # Generate AI response email
    email_prompt = f"""Write a professional acknowledgment email for a contact form submission.
    Name: {contact_obj.name}
    Subject: {contact_obj.subject or 'General Inquiry'}
    Message: {contact_obj.message[:200]}
    
    Keep it brief, professional, and assure them we'll respond within 24-48 hours."""
    
    ai_response = await generate_ai_content(email_prompt, 200)
    
    return contact_obj

@api_router.get("/contact", response_model=List[ContactSubmission])
async def get_contacts():
    contacts = await db.contact_submissions.find({}, {"_id": 0}).to_list(1000)
    for contact in contacts:
        if isinstance(contact['timestamp'], str):
            contact['timestamp'] = datetime.fromisoformat(contact['timestamp'])
    return contacts

# Job Posting Routes
@api_router.post("/jobs", response_model=JobPosting)
async def create_job(input: JobPostingCreate):
    try:
        job_dict = input.model_dump()
        job_obj = JobPosting(**job_dict)
        
        doc = job_obj.model_dump()
        doc['posted_date'] = doc['posted_date'].isoformat()
        
        result = await db.job_postings.insert_one(doc)
        logging.info(f"Job created successfully: {job_obj.id}, MongoDB ID: {result.inserted_id}")
        return job_obj
    except Exception as e:
        logging.error(f"Error creating job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")

@api_router.get("/jobs", response_model=List[JobPosting])
async def get_jobs(status: Optional[str] = None):
    try:
        query = {"status": status} if status else {}
        jobs = await db.job_postings.find(query, {"_id": 0}).to_list(1000)
        for job in jobs:
            if isinstance(job['posted_date'], str):
                job['posted_date'] = datetime.fromisoformat(job['posted_date'])
        logging.info(f"Retrieved {len(jobs)} jobs from database")
        return jobs
    except Exception as e:
        logging.error(f"Error retrieving jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve jobs: {str(e)}")

@api_router.get("/jobs/{job_id}", response_model=JobPosting)
async def get_job(job_id: str):
    job = await db.job_postings.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if isinstance(job['posted_date'], str):
        job['posted_date'] = datetime.fromisoformat(job['posted_date'])
    return job

@api_router.put("/jobs/{job_id}", response_model=JobPosting)
async def update_job(job_id: str, input: JobPostingCreate):
    try:
        job = await db.job_postings.find_one({"id": job_id})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Get update data from input
        update_data = input.model_dump()
        
        # Preserve the status and posted_date (don't update these)
        # Only update the fields that are in JobPostingCreate
        update_fields = {
            "title": update_data.get("title"),
            "department": update_data.get("department"),
            "location": update_data.get("location"),
            "type": update_data.get("type"),
            "description": update_data.get("description"),
            "qualification": update_data.get("qualification"),
            "timings": update_data.get("timings"),
            "requirements": update_data.get("requirements", []),
            "responsibilities": update_data.get("responsibilities", [])
        }
        
        # Update the job in MongoDB
        result = await db.job_postings.update_one(
            {"id": job_id},
            {"$set": update_fields}
        )
        
        if result.modified_count == 0:
            logging.warning(f"No changes detected for job {job_id}")
        
        # Fetch and return the updated job
        updated_job = await db.job_postings.find_one({"id": job_id}, {"_id": 0})
        if not updated_job:
            raise HTTPException(status_code=404, detail="Job not found after update")
            
        if isinstance(updated_job['posted_date'], str):
            updated_job['posted_date'] = datetime.fromisoformat(updated_job['posted_date'])
        
        logging.info(f"Job updated successfully: {job_id}, Modified: {result.modified_count}")
        return updated_job
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update job: {str(e)}")

@api_router.put("/jobs/{job_id}/status")
async def update_job_status(job_id: str, status: str):
    """Update only the status of a job"""
    try:
        job = await db.job_postings.find_one({"id": job_id})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        if status not in ['active', 'closed']:
            raise HTTPException(status_code=400, detail="Status must be 'active' or 'closed'")
        
        await db.job_postings.update_one({"id": job_id}, {"$set": {"status": status}})
        logging.info(f"Job status updated: {job_id} -> {status}")
        return {"message": "Job status updated successfully", "job_id": job_id, "status": status}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating job status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update job status: {str(e)}")

@api_router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    try:
        result = await db.job_postings.delete_one({"id": job_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Job not found")
        logging.info(f"Job deleted successfully: {job_id}")
        return {"message": "Job deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete job: {str(e)}")

# Job Application Routes
@api_router.post("/applications")
async def submit_application(
    job_id: str = Form(...),
    job_title: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    cover_letter: Optional[str] = Form(None),
    resume: UploadFile = File(...)
):
    # Read and parse resume
    resume_content = await resume.read()
    resume_text = ""
    
    if resume.filename.lower().endswith('.pdf'):
        resume_text = extract_text_from_pdf(resume_content)
        content_type = "application/pdf"
    elif resume.filename.lower().endswith(('.docx', '.doc')):
        resume_text = extract_text_from_docx(resume_content)
        content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract text from resume")
    
    # Store resume file as base64 encoded string in MongoDB
    resume_file_base64 = base64.b64encode(resume_content).decode('utf-8')
    
    # Get job posting details for ATS analysis
    job_posting = await db.job_postings.find_one({"id": job_id}, {"_id": 0})
    job_requirements = ""
    job_qualification = ""
    job_description = ""
    ats_config = None
    
    if job_posting:
        job_requirements = ", ".join(job_posting.get('requirements', []))
        job_qualification = job_posting.get('qualification', '')
        job_description = job_posting.get('description', '')
        # Get ATS configuration if available
        ats_config_data = job_posting.get('ats_config')
        if ats_config_data:
            try:
                ats_config = ATSConfig(**ats_config_data)
            except Exception as e:
                logging.warning(f"Error parsing ATS config: {str(e)}, using defaults")
                ats_config = ATSConfig()
        else:
            # Use default ATS configuration
            ats_config = ATSConfig()
    
    # Build ATS evaluation criteria
    ats_criteria = ""
    if ats_config:
        ats_criteria = f"""
    ATS EVALUATION CRITERIA:
    - Minimum Accuracy Threshold: {ats_config.min_accuracy_threshold}%
    - Skill Weight: {ats_config.skill_weight * 100}%
    - Experience Weight: {ats_config.experience_weight * 100}%
    - Education Weight: {ats_config.education_weight * 100}%
    - Qualification Weight: {ats_config.qualification_weight * 100}%
    - Overall Fit Weight: {ats_config.overall_fit_weight * 100}%
    - Required Skills (Must Have): {', '.join(ats_config.required_skills) if ats_config.required_skills else 'None specified'}
    - Preferred Skills (Nice to Have): {', '.join(ats_config.preferred_skills) if ats_config.preferred_skills else 'None specified'}
    - Minimum Experience Years: {ats_config.min_experience_years if ats_config.min_experience_years else 'Not specified'}
    - Required Education: {ats_config.required_education if ats_config.required_education else 'Not specified'}
    - Custom Evaluation Instructions: {ats_config.evaluation_criteria if ats_config.evaluation_criteria else 'Standard evaluation'}
    """
    
    # Enhanced ATS Analysis with job-specific configuration
    analysis_prompt = f"""You are a highly sophisticated ATS (Applicant Tracking System) analyzer. Analyze this resume against the job position using the specified evaluation criteria.
    
    JOB POSITION: {job_title}
    JOB REQUIREMENTS: {job_requirements}
    JOB QUALIFICATION: {job_qualification}
    JOB DESCRIPTION: {job_description[:500]}
    {ats_criteria}
    
    RESUME CONTENT: {resume_text[:2500]}
    
    Perform a comprehensive analysis and calculate a WEIGHTED ACCURACY PERCENTAGE (0-100) based on the specified weights:
    
    1. SKILLS MATCH ({ats_config.skill_weight * 100}% weight):
       - Check if required skills are present: {', '.join(ats_config.required_skills) if ats_config.required_skills else 'All job requirements'}
       - Check preferred skills: {', '.join(ats_config.preferred_skills) if ats_config.preferred_skills else 'None'}
       - Calculate skills match percentage
    
    2. EXPERIENCE RELEVANCE ({ats_config.experience_weight * 100}% weight):
       - Extract years of experience from resume
       - Compare with minimum requirement: {ats_config.min_experience_years if ats_config.min_experience_years else 'Not specified'}
       - Evaluate relevance of experience to job role
    
    3. EDUCATION MATCH ({ats_config.education_weight * 100}% weight):
       - Check education level in resume
       - Compare with required education: {ats_config.required_education if ats_config.required_education else 'Not specified'}
       - Evaluate qualification match
    
    4. QUALIFICATION MATCH ({ats_config.qualification_weight * 100}% weight):
       - Check if resume meets qualification requirements: {job_qualification[:200]}
       - Evaluate qualification relevance
    
    5. OVERALL FIT ({ats_config.overall_fit_weight * 100}% weight):
       - General fit for the position
       - Cultural fit indicators
       - Career progression alignment
    
    IMPORTANT: Calculate a WEIGHTED ACCURACY SCORE using the specified weights. The final accuracy must be between 0-100.
    
    Return ONLY a valid JSON object with these exact fields:
    {{
        "skills": ["skill1", "skill2", ...],
        "required_skills_match": number (0-100),
        "preferred_skills_match": number (0-100),
        "experience_years": number,
        "experience_match": number (0-100),
        "education": "education level",
        "education_match": number (0-100),
        "qualification_match": number (0-100),
        "overall_fit": number (0-100),
        "weighted_accuracy": number (0-100),
        "match_score": number (1-10),
        "summary": "2-sentence summary",
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "recommendation": "selected" or "rejected"
    }}
    
    Calculate weighted_accuracy using the formula:
    weighted_accuracy = (skills_match * {ats_config.skill_weight}) + 
                        (experience_match * {ats_config.experience_weight}) + 
                        (education_match * {ats_config.education_weight}) + 
                        (qualification_match * {ats_config.qualification_weight}) + 
                        (overall_fit * {ats_config.overall_fit_weight})
    
    If weighted_accuracy >= {ats_config.min_accuracy_threshold}, recommendation should be "selected", else "rejected".
    Return ONLY the JSON, no other text."""
    
    ai_analysis_raw = await generate_ai_content(analysis_prompt, 600)
    
    # Parse weighted accuracy from AI response
    accuracy = 0
    ats_analysis = {}
    try:
        # Try to extract JSON from the response
        json_match = re.search(r'\{.*?"weighted_accuracy".*?\}', ai_analysis_raw, re.DOTALL)
        if json_match:
            analysis_json = json.loads(json_match.group())
            accuracy = int(analysis_json.get('weighted_accuracy', 0))
            ats_analysis = analysis_json
        else:
            # Fallback: try to find weighted_accuracy or accuracy in text
            weighted_match = re.search(r'"weighted_accuracy":\s*(\d+)', ai_analysis_raw)
            if weighted_match:
                accuracy = int(weighted_match.group(1))
            else:
                accuracy_match = re.search(r'"accuracy":\s*(\d+)', ai_analysis_raw)
                if accuracy_match:
                    accuracy = int(accuracy_match.group(1))
    except Exception as e:
        logging.error(f"Error parsing accuracy from AI response: {str(e)}")
        # Default accuracy calculation based on basic matching
        resume_lower = resume_text.lower()
        job_req_lower = job_requirements.lower()
        matches = sum(1 for word in job_req_lower.split() if len(word) > 3 and word in resume_lower)
        accuracy = min(100, (matches / max(len(job_req_lower.split()), 1)) * 100)
    
    # Auto-assign status based on ATS configuration threshold
    threshold = ats_config.min_accuracy_threshold if ats_config else 85
    initial_status = "selected" if accuracy >= threshold else "rejected"
    
    ai_analysis = {
        "raw_analysis": ai_analysis_raw,
        "resume_length": len(resume_text),
        "accuracy": accuracy,
        "parsed_analysis": ai_analysis_raw
    }
    
    # Create application with auto-assigned status
    application = JobApplication(
        job_id=job_id,
        job_title=job_title,
        name=name,
        email=email,
        phone=phone,
        resume_text=resume_text,
        resume_file=resume_file_base64,
        resume_filename=resume.filename,
        resume_file_size=len(resume_content),
        resume_content_type=content_type,
        cover_letter=cover_letter,
        ai_analysis=ai_analysis,
        status=initial_status  # Auto-assign based on accuracy
    )
    
    doc = application.model_dump()
    doc['applied_date'] = doc['applied_date'].isoformat()
    
    # Store in MongoDB - the resume file is now stored as base64 in the document
    try:
        result = await db.job_applications.insert_one(doc)
        logging.info(f"Application stored in MongoDB: ID={application.id}, MongoDB_ID={result.inserted_id}, accuracy={accuracy}%, status={initial_status}, file_size={len(resume_content)} bytes")
    except Exception as e:
        logging.error(f"Error storing application in MongoDB: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to store application: {str(e)}")
    
    # Generate acknowledgment email
    email_prompt = f"""Write a professional job application acknowledgment email.
    Candidate: {name}
    Position: {job_title}
    
    Thank them for applying to MasterSolis InfoTech and inform them we'll review their application."""
    
    ai_email = await generate_ai_content(email_prompt, 200)
    
    return {
        "message": "Application submitted successfully",
        "application_id": application.id,
        "accuracy": accuracy,
        "status": initial_status
    }

@api_router.get("/applications", response_model=List[JobApplication])
async def get_applications(job_id: Optional[str] = None, status: Optional[str] = None):
    query = {}
    if job_id:
        query["job_id"] = job_id
    if status:
        query["status"] = status
    
    applications = await db.job_applications.find(query, {"_id": 0}).to_list(1000)
    for app in applications:
        if isinstance(app['applied_date'], str):
            app['applied_date'] = datetime.fromisoformat(app['applied_date'])
    return applications

@api_router.get("/applications/{app_id}", response_model=JobApplication)
async def get_application(app_id: str):
    app = await db.job_applications.find_one({"id": app_id}, {"_id": 0})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if isinstance(app['applied_date'], str):
        app['applied_date'] = datetime.fromisoformat(app['applied_date'])
    return app

@api_router.get("/applications/by-email/{email}")
async def get_applications_by_email(email: str):
    """Get all applications for a user by email"""
    applications = await db.job_applications.find({"email": email}, {"_id": 0}).to_list(1000)
    for app in applications:
        if isinstance(app['applied_date'], str):
            app['applied_date'] = datetime.fromisoformat(app['applied_date'])
    return applications

@api_router.put("/applications/{app_id}/status")
async def update_application_status(app_id: str, status: str):
    result = await db.job_applications.update_one(
        {"id": app_id},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Status updated successfully"}

@api_router.get("/applications/{app_id}/resume")
async def download_resume(app_id: str):
    """Download resume file for an application"""
    app = await db.job_applications.find_one({"id": app_id}, {"_id": 0})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if not app.get('resume_file'):
        raise HTTPException(status_code=404, detail="Resume file not found")
    
    # Decode base64 file content
    file_content = base64.b64decode(app['resume_file'])
    filename = app.get('resume_filename', 'resume.pdf')
    content_type = app.get('resume_content_type', 'application/pdf')
    
    # Return file as streaming response
    return StreamingResponse(
        io.BytesIO(file_content),
        media_type=content_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

# Blog Routes
@api_router.post("/blog", response_model=BlogPost)
async def create_blog(input: BlogPostCreate):
    try:
        blog_dict = input.model_dump()
        
        # Generate slug from title
        slug = blog_dict['title'].lower().replace(' ', '-').replace('/', '-')
        # Remove special characters and ensure unique slug
        slug = re.sub(r'[^a-z0-9-]', '', slug)
        # Check if slug exists, append number if needed
        existing = await db.blog_posts.find_one({"slug": slug})
        if existing:
            counter = 1
            while existing:
                new_slug = f"{slug}-{counter}"
                existing = await db.blog_posts.find_one({"slug": new_slug})
                if not existing:
                    slug = new_slug
                    break
                counter += 1
        blog_dict['slug'] = slug
        
        # Generate excerpt, summary, and SEO description using AI
        excerpt_prompt = f"""Write a compelling 2-sentence excerpt (max 150 characters) for this blog post:
        Title: {blog_dict['title']}
        Content: {blog_dict['content'][:500]}
        
        Return only the excerpt text, no additional formatting."""
        
        summary_prompt = f"""Write a comprehensive 3-4 sentence summary of this blog post:
        Title: {blog_dict['title']}
        Content: {blog_dict['content'][:1000]}
        
        The summary should:
        - Capture the main points and key takeaways
        - Be informative and engaging
        - Be 3-4 sentences long
        - Help readers understand what the post is about
        
        Return only the summary text, no additional formatting."""
        
        seo_prompt = f"""Write an SEO-optimized meta description (max 160 characters) for:
        Title: {blog_dict['title']}
        Content: {blog_dict['content'][:300]}
        
        Return only the SEO description, no additional formatting."""
        
        # Generate AI content
        blog_dict['excerpt'] = await generate_ai_content(excerpt_prompt, 100)
        blog_dict['summary'] = await generate_ai_content(summary_prompt, 200)
        blog_dict['seo_description'] = await generate_ai_content(seo_prompt, 50)
        
        blog_obj = BlogPost(**blog_dict)
        
        doc = blog_obj.model_dump()
        doc['created_date'] = doc['created_date'].isoformat()
        doc['updated_date'] = doc['updated_date'].isoformat()
        
        await db.blog_posts.insert_one(doc)
        logging.info(f"Blog post created: {blog_obj.title}, slug: {slug}")
        return blog_obj
    except Exception as e:
        logging.error(f"Error creating blog post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create blog post: {str(e)}")

@api_router.get("/blog", response_model=List[BlogPost])
async def get_blogs(published: Optional[bool] = None):
    query = {"published": published} if published is not None else {}
    blogs = await db.blog_posts.find(query, {"_id": 0}).to_list(1000)
    for blog in blogs:
        if isinstance(blog['created_date'], str):
            blog['created_date'] = datetime.fromisoformat(blog['created_date'])
        if isinstance(blog['updated_date'], str):
            blog['updated_date'] = datetime.fromisoformat(blog['updated_date'])
    return blogs

@api_router.get("/blog/{slug}", response_model=BlogPost)
async def get_blog(slug: str):
    blog = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    if isinstance(blog['created_date'], str):
        blog['created_date'] = datetime.fromisoformat(blog['created_date'])
    if isinstance(blog['updated_date'], str):
        blog['updated_date'] = datetime.fromisoformat(blog['updated_date'])
    return blog

@api_router.post("/blog/{slug}/summarize")
async def summarize_blog(slug: str):
    try:
        blog = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
        if not blog:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        # If summary already exists, return it
        if blog.get('summary'):
            return {"summary": blog['summary']}
        
        summary_prompt = f"""Write a comprehensive 3-4 sentence summary of this blog post:
        Title: {blog['title']}
        Content: {blog['content'][:1000]}
        
        The summary should:
        - Capture the main points and key takeaways
        - Be informative and engaging
        - Be 3-4 sentences long
        - Help readers understand what the post is about
        
        Return only the summary text, no additional formatting."""
        
        summary = await generate_ai_content(summary_prompt, 200)
        
        # Update blog post with summary
        await db.blog_posts.update_one({"slug": slug}, {"$set": {"summary": summary}})
        
        logging.info(f"Summary generated for blog post: {slug}")
        return {"summary": summary}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error generating summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

@api_router.put("/blog/{slug}", response_model=BlogPost)
async def update_blog(slug: str, input: BlogPostCreate):
    try:
        blog = await db.blog_posts.find_one({"slug": slug})
        if not blog:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        blog_dict = input.model_dump()
        
        # Regenerate excerpt, summary, and SEO description if content changed
        if blog_dict.get('content') != blog.get('content') or blog_dict.get('title') != blog.get('title'):
            excerpt_prompt = f"""Write a compelling 2-sentence excerpt (max 150 characters) for this blog post:
            Title: {blog_dict['title']}
            Content: {blog_dict['content'][:500]}
            
            Return only the excerpt text, no additional formatting."""
            
            summary_prompt = f"""Write a comprehensive 3-4 sentence summary of this blog post:
            Title: {blog_dict['title']}
            Content: {blog_dict['content'][:1000]}
            
            The summary should:
            - Capture the main points and key takeaways
            - Be informative and engaging
            - Be 3-4 sentences long
            - Help readers understand what the post is about
            
            Return only the summary text, no additional formatting."""
            
            seo_prompt = f"""Write an SEO-optimized meta description (max 160 characters) for:
            Title: {blog_dict['title']}
            Content: {blog_dict['content'][:300]}
            
            Return only the SEO description, no additional formatting."""
            
            blog_dict['excerpt'] = await generate_ai_content(excerpt_prompt, 100)
            blog_dict['summary'] = await generate_ai_content(summary_prompt, 200)
            blog_dict['seo_description'] = await generate_ai_content(seo_prompt, 50)
        
        # Preserve slug and dates
        blog_dict['slug'] = slug
        blog_dict['created_date'] = blog.get('created_date')
        blog_dict['updated_date'] = datetime.now(timezone.utc)
        
        await db.blog_posts.update_one({"slug": slug}, {"$set": blog_dict})
        
        updated_blog = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
        if isinstance(updated_blog['created_date'], str):
            updated_blog['created_date'] = datetime.fromisoformat(updated_blog['created_date'])
        if isinstance(updated_blog['updated_date'], str):
            updated_blog['updated_date'] = datetime.fromisoformat(updated_blog['updated_date'])
        
        logging.info(f"Blog post updated: {slug}")
        return updated_blog
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating blog post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update blog post: {str(e)}")

# Resume Builder Routes
class ResumeData(BaseModel):
    id: Optional[str] = None
    photo: Optional[str] = None  # Base64 encoded image
    fullName: str
    email: str
    technicalSkills: List[str]
    nonTechnicalSkills: List[str]
    education: str
    company: str
    role: str
    duration: str
    desiredRole: str
    languages: List[str]
    certifications: List[str]
    aiQuestion: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

@api_router.post("/resumes")
async def create_resume(resume: ResumeData):
    try:
        resume_dict = resume.model_dump()
        if not resume_dict.get('id'):
            resume_dict['id'] = str(uuid.uuid4())
        if not resume_dict.get('created_at'):
            resume_dict['created_at'] = datetime.now(timezone.utc).isoformat()
        if not resume_dict.get('updated_at'):
            resume_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        await db.resumes.insert_one(resume_dict)
        logging.info(f"Resume saved to MongoDB: {resume_dict['id']}, Email: {resume_dict.get('email')}")
        return resume_dict
    except Exception as e:
        logging.error(f"Error saving resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save resume: {str(e)}")

@api_router.get("/resumes")
async def get_resumes(email: Optional[str] = None):
    try:
        query = {"email": email} if email else {}
        resumes = await db.resumes.find(query, {"_id": 0}).to_list(1000)
        logging.info(f"Retrieved {len(resumes)} resumes from database")
        return resumes
    except Exception as e:
        logging.error(f"Error retrieving resumes: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve resumes: {str(e)}")

@api_router.get("/resumes/{resume_id}")
async def get_resume(resume_id: str):
    try:
        resume = await db.resumes.find_one({"id": resume_id}, {"_id": 0})
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        return resume
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error retrieving resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve resume: {str(e)}")

@api_router.delete("/blog/{slug}")
async def delete_blog(slug: str):
    try:
        result = await db.blog_posts.delete_one({"slug": slug})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Blog post not found")
        logging.info(f"Blog post deleted: {slug}")
        return {"message": "Blog post deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting blog post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete blog post: {str(e)}")

# Testimonial Routes
@api_router.post("/testimonials", response_model=Testimonial)
async def create_testimonial(input: TestimonialCreate):
    testimonial_obj = Testimonial(**input.model_dump())
    
    doc = testimonial_obj.model_dump()
    doc['created_date'] = doc['created_date'].isoformat()
    
    await db.testimonials.insert_one(doc)
    return testimonial_obj

@api_router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials(featured: Optional[bool] = None):
    query = {"featured": featured} if featured is not None else {}
    testimonials = await db.testimonials.find(query, {"_id": 0}).to_list(1000)
    for testimonial in testimonials:
        if isinstance(testimonial['created_date'], str):
            testimonial['created_date'] = datetime.fromisoformat(testimonial['created_date'])
    return testimonials

@api_router.post("/testimonials/generate")
async def generate_testimonial(input: AIRequest):
    """Generate or rephrase testimonial using AI"""
    prompt = f"""Based on this client feedback data, write a professional testimonial:
    {input.prompt}
    {input.context or ''}
    
    Make it authentic, specific, and impactful. Max 3 sentences."""
    
    testimonial = await generate_ai_content(prompt, 150)
    return {"generated_testimonial": testimonial}

# Project Routes
@api_router.post("/projects", response_model=Project)
async def create_project(input: ProjectCreate):
    project_obj = Project(**input.model_dump())
    
    doc = project_obj.model_dump()
    doc['created_date'] = doc['created_date'].isoformat()
    
    await db.projects.insert_one(doc)
    return project_obj

@api_router.get("/projects", response_model=List[Project])
async def get_projects(category: Optional[str] = None):
    query = {"category": category} if category else {}
    projects = await db.projects.find(query, {"_id": 0}).to_list(1000)
    for project in projects:
        if isinstance(project['created_date'], str):
            project['created_date'] = datetime.fromisoformat(project['created_date'])
    return projects

@api_router.get("/projects/search")
async def search_projects(tech: Optional[str] = None):
    query = {}
    if tech:
        query["technologies"] = {"$in": [tech]}
    projects = await db.projects.find(query, {"_id": 0}).to_list(1000)
    for project in projects:
        if isinstance(project['created_date'], str):
            project['created_date'] = datetime.fromisoformat(project['created_date'])
    return projects

# Case Study Routes
@api_router.post("/case-studies", response_model=CaseStudy)
async def create_case_study(input: CaseStudyCreate):
    case_dict = input.model_dump()
    
    # Generate AI summary
    summary_prompt = f"""Summarize this case study in 2-3 sentences:
    Challenge: {case_dict['challenge']}
    Solution: {case_dict['solution']}
    Results: {case_dict['results']}"""
    
    case_dict['ai_summary'] = await generate_ai_content(summary_prompt, 150)
    
    case_obj = CaseStudy(**case_dict)
    
    doc = case_obj.model_dump()
    doc['created_date'] = doc['created_date'].isoformat()
    
    await db.case_studies.insert_one(doc)
    return case_obj

@api_router.get("/case-studies", response_model=List[CaseStudy])
async def get_case_studies():
    cases = await db.case_studies.find({}, {"_id": 0}).to_list(1000)
    for case in cases:
        if isinstance(case['created_date'], str):
            case['created_date'] = datetime.fromisoformat(case['created_date'])
    return cases

# AI Chatbot
@api_router.post("/chat")
async def chat(input: ChatMessage):
    prompt = f"""You are a helpful assistant for MasterSolis InfoTech, an IT consulting company.
    Services: Cloud Solutions, IT Services, Web Development, Full Stack Training, Projects, Internships.
    
    User question: {input.message}
    
    Provide a helpful, professional response."""
    
    response = await generate_ai_content(prompt, 250)
    return {"response": response}

# Admin Authentication
@api_router.post("/admin/register")
async def register_admin(input: AdminLogin):
    # Check if admin exists
    existing = await db.admin_users.find_one({"username": input.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Hash password
    password_hash = bcrypt.hashpw(input.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    admin = AdminUser(
        username=input.username,
        email=f"{input.username}@mastersolis.com",
        password_hash=password_hash
    )
    
    doc = admin.model_dump()
    doc['created_date'] = doc['created_date'].isoformat()
    
    await db.admin_users.insert_one(doc)
    return {"message": "Admin registered successfully", "admin_id": admin.id}

@api_router.post("/admin/login")
async def login_admin(input: AdminLogin):
    admin = await db.admin_users.find_one({"username": input.username})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not bcrypt.checkpw(input.password.encode('utf-8'), admin['password_hash'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"message": "Login successful", "admin_id": admin['id'], "username": admin['username']}

# Analytics
@api_router.get("/admin/analytics")
async def get_analytics():
    total_contacts = await db.contact_submissions.count_documents({})
    total_applications = await db.job_applications.count_documents({})
    total_jobs = await db.job_postings.count_documents({"status": "active"})
    total_blogs = await db.blog_posts.count_documents({"published": True})
    total_projects = await db.projects.count_documents({})
    
    # AI-generated summary
    summary_prompt = f"""Generate a brief analytics summary:
    - {total_contacts} contact submissions
    - {total_applications} job applications
    - {total_jobs} active job postings
    - {total_blogs} published blogs
    - {total_projects} projects
    
    Provide 2-3 insights about business health."""
    
    ai_summary = await generate_ai_content(summary_prompt, 150)
    
    return {
        "total_contacts": total_contacts,
        "total_applications": total_applications,
        "total_jobs": total_jobs,
        "total_blogs": total_blogs,
        "total_projects": total_projects,
        "ai_summary": ai_summary
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()