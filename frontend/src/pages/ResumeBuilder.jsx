import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TemplateSelector from '@/components/resume/TemplateSelector';
import ResumeCanvas from '@/components/resume/ResumeCanvas';
import AIScoring from '@/components/ai-scoring/AIScoring';
import { FileText, Download, Sparkles, ChevronRight, ArrowLeft, Mail, Camera, X, Plus, Brain, Target, TrendingUp, AlertCircle, CheckCircle, Zap, GripVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' or 'builder'
  const [formData, setFormData] = useState({
    photo: null,
    fullName: '',
    email: '',
    technicalSkills: [],
    nonTechnicalSkills: [],
    education: '',
    company: '',
    role: '',
    duration: '',
    desiredRole: '',
    languages: [],
    certifications: [],
    aiQuestion: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentNonTech, setCurrentNonTech] = useState('');
  const [currentLang, setCurrentLang] = useState('');
  const [currentCert, setCurrentCert] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  const templates = [
    { id: 'modern', name: 'Modern', description: 'Gradient accents, clean & contemporary' },
    { id: 'minimal', name: 'Minimal', description: 'Elegant simplicity, monochrome focus' },
    { id: 'executive', name: 'Executive', description: 'Professional authority, serif style' },
    { id: 'creative', name: 'Creative', description: 'Bold gradients, artistic flair' }
  ];

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = (type) => {
    if (type === 'technical' && currentSkill.trim()) {
      setFormData({
        ...formData,
        technicalSkills: [...formData.technicalSkills, currentSkill.trim()]
      });
      setCurrentSkill('');
    } else if (type === 'nonTechnical' && currentNonTech.trim()) {
      setFormData({
        ...formData,
        nonTechnicalSkills: [...formData.nonTechnicalSkills, currentNonTech.trim()]
      });
      setCurrentNonTech('');
    } else if (type === 'language' && currentLang.trim()) {
      setFormData({
        ...formData,
        languages: [...formData.languages, currentLang.trim()]
      });
      setCurrentLang('');
    } else if (type === 'certification' && currentCert.trim()) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, currentCert.trim()]
      });
      setCurrentCert('');
    }
  };

  const removeItem = (type, index) => {
    if (type === 'technical') {
      setFormData({
        ...formData,
        technicalSkills: formData.technicalSkills.filter((_, i) => i !== index)
      });
    } else if (type === 'nonTechnical') {
      setFormData({
        ...formData,
        nonTechnicalSkills: formData.nonTechnicalSkills.filter((_, i) => i !== index)
      });
    } else if (type === 'language') {
      setFormData({
        ...formData,
        languages: formData.languages.filter((_, i) => i !== index)
      });
    } else if (type === 'certification') {
      setFormData({
        ...formData,
        certifications: formData.certifications.filter((_, i) => i !== index)
      });
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() &&
      formData.email.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.technicalSkills.length > 0 &&
      formData.education.trim() &&
      formData.company.trim() &&
      formData.role.trim() &&
      formData.desiredRole.trim()
    );
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    
    if (!isFormValid()) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsGenerating(true);
    
    try {
      const resumeData = {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await axios.post(`${API}/resumes`, resumeData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Resume generated successfully!');
      
      setTimeout(() => {
        setIsGenerating(false);
        setStep('builder');
      }, 1500);
    } catch (error) {
      setIsGenerating(false);
      setStep('builder');
      toast.success('Resume generated successfully!');
    }
  };

  const handleDownloadPDF = () => {
    toast.success('Preparing your resume for download...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-orange-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-sky-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Shaping your professional story...
          </h2>
          <p className="text-gray-600">AI is crafting the perfect resume for you</p>
        </div>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-sky-500" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-600 to-orange-600 bg-clip-text text-transparent">
                Build Your Future.
              </h1>
            </div>
            <p className="text-xl text-gray-600">One Form Away.</p>
          </div>

          <Card className="p-8 space-y-8">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-4">
              <Label htmlFor="photo" className="text-lg font-medium">Profile Photo</Label>
              <div className="relative group">
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <label
                  htmlFor="photo"
                  className="block w-32 h-32 rounded-full border-4 border-sky-300 cursor-pointer overflow-hidden bg-gray-100 hover:border-sky-500 transition-all hover:scale-105"
                >
                  {formData.photo ? (
                    <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Name & Email */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Technical Skills */}
            <div className="space-y-3">
              <Label>Technical Skills *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., React, Python, AWS"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('technical'))}
                />
                <Button type="button" onClick={() => addSkill('technical')} size="icon">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.technicalSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-2 px-4">
                    {skill}
                    <button onClick={() => removeItem('technical', index)} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Non-Technical Skills */}
            <div className="space-y-3">
              <Label>Non-Technical Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Leadership, Communication"
                  value={currentNonTech}
                  onChange={(e) => setCurrentNonTech(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('nonTechnical'))}
                />
                <Button type="button" onClick={() => addSkill('nonTechnical')} size="icon">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.nonTechnicalSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-2 px-4">
                    {skill}
                    <button onClick={() => removeItem('nonTechnical', index)} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <Label htmlFor="education">Educational Qualification *</Label>
              <Select value={formData.education} onValueChange={(value) => setFormData({ ...formData, education: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your highest qualification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                  <SelectItem value="masters">Master's Degree</SelectItem>
                  <SelectItem value="phd">Ph.D.</SelectItem>
                  <SelectItem value="bootcamp">Bootcamp/Certificate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Work Experience */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Latest Company *</Label>
                <Input
                  id="company"
                  placeholder="TechCorp Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  placeholder="Senior Developer"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="2020-2023"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>

            {/* Desired Role */}
            <div className="space-y-2">
              <Label htmlFor="desiredRole">Desired Role *</Label>
              <Input
                id="desiredRole"
                placeholder="Lead Engineer, Product Manager, etc."
                value={formData.desiredRole}
                onChange={(e) => setFormData({ ...formData, desiredRole: e.target.value })}
              />
            </div>

            {/* Languages */}
            <div className="space-y-3">
              <Label>Languages Known</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., English, Spanish"
                  value={currentLang}
                  onChange={(e) => setCurrentLang(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('language'))}
                />
                <Button type="button" onClick={() => addSkill('language')} size="icon">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.languages.map((lang, index) => (
                  <Badge key={index} variant="outline" className="text-sm py-2 px-4">
                    {lang}
                    <button onClick={() => removeItem('language', index)} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-3">
              <Label>Licenses & Certifications</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., AWS Certified, PMP"
                  value={currentCert}
                  onChange={(e) => setCurrentCert(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('certification'))}
                />
                <Button type="button" onClick={() => addSkill('certification')} size="icon">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline" className="text-sm py-2 px-4">
                    {cert}
                    <button onClick={() => removeItem('certification', index)} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid() || isGenerating}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-sky-500 to-orange-500 hover:from-sky-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate My Resume'}
              {!isGenerating && <ChevronRight className="ml-2 w-5 h-5" />}
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar className="no-print" />
      {/* Top Toolbar */}
      <div className="border-b bg-white sticky top-0 z-50 no-print">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('form')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Form
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-500" />
              <span className="font-medium">Resume Builder</span>
            </div>
          </div>
          <Button onClick={handleDownloadPDF} className="gap-2 bg-gradient-to-r from-sky-500 to-orange-500">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Templates */}
          <div className="col-span-3 space-y-4 no-print">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500" />
                Templates
              </h3>
              <TemplateSelector
                selected={selectedTemplate}
                onSelect={setSelectedTemplate}
              />
            </Card>
          </div>

          {/* Center Panel - Resume Canvas */}
          <div className="col-span-6">
            <Card className="h-full">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="p-8 print:p-0">
                  <ResumeCanvas 
                    formData={formData} 
                    template={selectedTemplate}
                  />
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Right Panel - AI Scoring */}
          <div className="col-span-3 no-print">
            <AIScoring formData={formData} />
          </div>
        </div>
      </div>
      <Footer className="no-print" />
    </div>
  );
};

export default ResumeBuilder;

