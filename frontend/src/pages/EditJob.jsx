import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const EditJob = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: '',
    description: '',
    qualification: '',
    timings: '',
    requirements: [''],
    responsibilities: ['']
  });

  const [atsConfig, setAtsConfig] = useState({
    min_accuracy_threshold: 85,
    skill_weight: 0.30,
    experience_weight: 0.25,
    education_weight: 0.20,
    qualification_weight: 0.15,
    overall_fit_weight: 0.10,
    required_skills: [''],
    preferred_skills: [''],
    min_experience_years: '',
    required_education: '',
    evaluation_criteria: ''
  });

  const [showAtsConfig, setShowAtsConfig] = useState(false);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      const response = await axios.get(`${API}/jobs/${jobId}`);
      const job = response.data;
      setFormData({
        title: job.title || '',
        department: job.department || '',
        location: job.location || '',
        type: job.type || '',
        description: job.description || '',
        qualification: job.qualification || '',
        timings: job.timings || '',
        requirements: job.requirements && job.requirements.length > 0 ? job.requirements : [''],
        responsibilities: job.responsibilities && job.responsibilities.length > 0 ? job.responsibilities : ['']
      });

      // Load ATS configuration if available
      if (job.ats_config) {
        setAtsConfig({
          min_accuracy_threshold: job.ats_config.min_accuracy_threshold || 85,
          skill_weight: job.ats_config.skill_weight || 0.30,
          experience_weight: job.ats_config.experience_weight || 0.25,
          education_weight: job.ats_config.education_weight || 0.20,
          qualification_weight: job.ats_config.qualification_weight || 0.15,
          overall_fit_weight: job.ats_config.overall_fit_weight || 0.10,
          required_skills: job.ats_config.required_skills && job.ats_config.required_skills.length > 0 ? job.ats_config.required_skills : [''],
          preferred_skills: job.ats_config.preferred_skills && job.ats_config.preferred_skills.length > 0 ? job.ats_config.preferred_skills : [''],
          min_experience_years: job.ats_config.min_experience_years || '',
          required_education: job.ats_config.required_education || '',
          evaluation_criteria: job.ats_config.evaluation_criteria || ''
        });
        setShowAtsConfig(true);
      }
    } catch (error) {
      console.error('Error loading job:', error);
      toast.error('Failed to load job details');
      navigate('/admin/dashboard');
    } finally {
      setLoadingJob(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const handleResponsibilityChange = (index, value) => {
    const newResponsibilities = [...formData.responsibilities];
    newResponsibilities[index] = value;
    setFormData(prev => ({
      ...prev,
      responsibilities: newResponsibilities
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addResponsibility = () => {
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, '']
    }));
  };

  const removeResponsibility = (index) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  const handleAtsConfigChange = (field, value) => {
    setAtsConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRequiredSkillChange = (index, value) => {
    const newSkills = [...atsConfig.required_skills];
    newSkills[index] = value;
    setAtsConfig(prev => ({
      ...prev,
      required_skills: newSkills
    }));
  };

  const handlePreferredSkillChange = (index, value) => {
    const newSkills = [...atsConfig.preferred_skills];
    newSkills[index] = value;
    setAtsConfig(prev => ({
      ...prev,
      preferred_skills: newSkills
    }));
  };

  const addRequiredSkill = () => {
    setAtsConfig(prev => ({
      ...prev,
      required_skills: [...prev.required_skills, '']
    }));
  };

  const removeRequiredSkill = (index) => {
    setAtsConfig(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter((_, i) => i !== index)
    }));
  };

  const addPreferredSkill = () => {
    setAtsConfig(prev => ({
      ...prev,
      preferred_skills: [...prev.preferred_skills, '']
    }));
  };

  const removePreferredSkill = (index) => {
    setAtsConfig(prev => ({
      ...prev,
      preferred_skills: prev.preferred_skills.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.department || !formData.location || 
        !formData.type || !formData.description || !formData.qualification || 
        !formData.timings) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Filter out empty requirements and responsibilities
    const requirements = formData.requirements.filter(req => req.trim() !== '');
    const responsibilities = formData.responsibilities.filter(resp => resp.trim() !== '');

    if (requirements.length === 0) {
      toast.error('Please add at least one requirement');
      return;
    }

    if (responsibilities.length === 0) {
      toast.error('Please add at least one responsibility');
      return;
    }

    setLoading(true);

    try {
      // Prepare ATS configuration
      const atsConfigData = {
        min_accuracy_threshold: parseInt(atsConfig.min_accuracy_threshold) || 85,
        skill_weight: parseFloat(atsConfig.skill_weight) || 0.30,
        experience_weight: parseFloat(atsConfig.experience_weight) || 0.25,
        education_weight: parseFloat(atsConfig.education_weight) || 0.20,
        qualification_weight: parseFloat(atsConfig.qualification_weight) || 0.15,
        overall_fit_weight: parseFloat(atsConfig.overall_fit_weight) || 0.10,
        required_skills: atsConfig.required_skills.filter(s => s.trim() !== ''),
        preferred_skills: atsConfig.preferred_skills.filter(s => s.trim() !== ''),
        min_experience_years: atsConfig.min_experience_years ? parseInt(atsConfig.min_experience_years) : null,
        required_education: atsConfig.required_education || null,
        evaluation_criteria: atsConfig.evaluation_criteria || null
      };

      const jobData = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        description: formData.description,
        qualification: formData.qualification,
        timings: formData.timings,
        requirements: requirements,
        responsibilities: responsibilities,
        ats_config: atsConfigData
      };

      console.log('Updating job:', jobId, jobData);
      const response = await axios.put(`${API}/jobs/${jobId}`, jobData);
      console.log('Job updated successfully:', response.data);
      
      // Verify the update was successful
      if (response.data && response.data.id) {
        toast.success('Job updated successfully!');
        // Navigate back to dashboard - it will reload data automatically
        navigate('/admin/dashboard');
      } else {
        toast.error('Update completed but response was invalid');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to update job: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
              >
                <ArrowLeft className="mr-2" size={18} />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="text-sky-500">Edit</span>
                  <span className="text-orange-500"> Job</span>
                </h1>
                <p className="text-sm text-gray-600">Update job posting details</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Edit Job Posting</CardTitle>
            <CardDescription>Update the job posting details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>

              {/* Department and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="e.g., Engineering"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Remote, New York, etc."
                    required
                  />
                </div>
              </div>

              {/* Job Type and Timings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Job Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timings">Work Timings *</Label>
                  <Input
                    id="timings"
                    value={formData.timings}
                    onChange={(e) => handleInputChange('timings', e.target.value)}
                    placeholder="e.g., 9 AM - 6 PM, Flexible"
                    required
                  />
                </div>
              </div>

              {/* Qualification */}
              <div className="space-y-2">
                <Label htmlFor="qualification">Required Qualification *</Label>
                <Textarea
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) => handleInputChange('qualification', e.target.value)}
                  placeholder="e.g., Bachelor's degree in Computer Science or related field"
                  rows={3}
                  required
                />
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the job role, what the candidate will be doing, company culture, etc."
                  rows={6}
                  required
                />
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label>Requirements *</Label>
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      placeholder={`Requirement ${index + 1}`}
                      required={index === 0}
                    />
                    {formData.requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRequirement(index)}
                      >
                        <X size={18} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRequirement}
                  className="w-full"
                >
                  <Plus className="mr-2" size={16} />
                  Add Requirement
                </Button>
              </div>

              {/* Responsibilities */}
              <div className="space-y-2">
                <Label>Responsibilities *</Label>
                {formData.responsibilities.map((resp, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={resp}
                      onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                      placeholder={`Responsibility ${index + 1}`}
                      required={index === 0}
                    />
                    {formData.responsibilities.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeResponsibility(index)}
                      >
                        <X size={18} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addResponsibility}
                  className="w-full"
                >
                  <Plus className="mr-2" size={16} />
                  Add Responsibility
                </Button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-600"
                  disabled={loading}
                >
                  <Save className="mr-2" size={18} />
                  {loading ? 'Updating...' : 'Update Job'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditJob;

