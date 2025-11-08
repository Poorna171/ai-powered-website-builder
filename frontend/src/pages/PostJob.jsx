import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X, Send } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
        ...formData,
        requirements,
        responsibilities,
        ats_config: atsConfigData
      };

      console.log('Posting job:', jobData);
      const response = await axios.post(`${API}/jobs`, jobData);
      console.log('Job posted successfully:', response.data);
      toast.success('Job posted successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error posting job:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to post job: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
                  <span className="text-sky-500">Post</span>
                  <span className="text-orange-500"> New Job</span>
                </h1>
                <p className="text-sm text-gray-600">Create a new job posting</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Job Posting Details</CardTitle>
            <CardDescription>Fill in all the details to post a new job opening</CardDescription>
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

              {/* ATS Configuration Section */}
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">ATS Configuration</h3>
                    <p className="text-sm text-gray-600">Configure how applications should be evaluated</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAtsConfig(!showAtsConfig)}
                  >
                    {showAtsConfig ? 'Hide' : 'Show'} ATS Config
                  </Button>
                </div>

                {showAtsConfig && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    {/* Minimum Accuracy Threshold */}
                    <div className="space-y-2">
                      <Label htmlFor="min_accuracy_threshold">Minimum Accuracy Threshold (%)</Label>
                      <Input
                        id="min_accuracy_threshold"
                        type="number"
                        min="0"
                        max="100"
                        value={atsConfig.min_accuracy_threshold}
                        onChange={(e) => handleAtsConfigChange('min_accuracy_threshold', e.target.value)}
                        placeholder="85"
                      />
                      <p className="text-xs text-gray-500">Candidates with accuracy above this threshold will be automatically selected</p>
                    </div>

                    {/* Evaluation Weights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="skill_weight">Skill Weight (0-1)</Label>
                        <Input
                          id="skill_weight"
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={atsConfig.skill_weight}
                          onChange={(e) => handleAtsConfigChange('skill_weight', e.target.value)}
                          placeholder="0.30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience_weight">Experience Weight (0-1)</Label>
                        <Input
                          id="experience_weight"
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={atsConfig.experience_weight}
                          onChange={(e) => handleAtsConfigChange('experience_weight', e.target.value)}
                          placeholder="0.25"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="education_weight">Education Weight (0-1)</Label>
                        <Input
                          id="education_weight"
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={atsConfig.education_weight}
                          onChange={(e) => handleAtsConfigChange('education_weight', e.target.value)}
                          placeholder="0.20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qualification_weight">Qualification Weight (0-1)</Label>
                        <Input
                          id="qualification_weight"
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={atsConfig.qualification_weight}
                          onChange={(e) => handleAtsConfigChange('qualification_weight', e.target.value)}
                          placeholder="0.15"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="overall_fit_weight">Overall Fit Weight (0-1)</Label>
                        <Input
                          id="overall_fit_weight"
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={atsConfig.overall_fit_weight}
                          onChange={(e) => handleAtsConfigChange('overall_fit_weight', e.target.value)}
                          placeholder="0.10"
                        />
                      </div>
                    </div>

                    {/* Required Skills */}
                    <div className="space-y-2">
                      <Label>Required Skills (Must Have)</Label>
                      {atsConfig.required_skills.map((skill, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={skill}
                            onChange={(e) => handleRequiredSkillChange(index, e.target.value)}
                            placeholder={`Required skill ${index + 1}`}
                          />
                          {atsConfig.required_skills.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRequiredSkill(index)}
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
                        onClick={addRequiredSkill}
                        className="w-full"
                      >
                        <Plus className="mr-2" size={16} />
                        Add Required Skill
                      </Button>
                    </div>

                    {/* Preferred Skills */}
                    <div className="space-y-2">
                      <Label>Preferred Skills (Nice to Have)</Label>
                      {atsConfig.preferred_skills.map((skill, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={skill}
                            onChange={(e) => handlePreferredSkillChange(index, e.target.value)}
                            placeholder={`Preferred skill ${index + 1}`}
                          />
                          {atsConfig.preferred_skills.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removePreferredSkill(index)}
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
                        onClick={addPreferredSkill}
                        className="w-full"
                      >
                        <Plus className="mr-2" size={16} />
                        Add Preferred Skill
                      </Button>
                    </div>

                    {/* Minimum Experience Years */}
                    <div className="space-y-2">
                      <Label htmlFor="min_experience_years">Minimum Experience Years</Label>
                      <Input
                        id="min_experience_years"
                        type="number"
                        min="0"
                        value={atsConfig.min_experience_years}
                        onChange={(e) => handleAtsConfigChange('min_experience_years', e.target.value)}
                        placeholder="e.g., 3"
                      />
                    </div>

                    {/* Required Education */}
                    <div className="space-y-2">
                      <Label htmlFor="required_education">Required Education</Label>
                      <Input
                        id="required_education"
                        value={atsConfig.required_education}
                        onChange={(e) => handleAtsConfigChange('required_education', e.target.value)}
                        placeholder="e.g., Bachelor's degree in Computer Science"
                      />
                    </div>

                    {/* Custom Evaluation Criteria */}
                    <div className="space-y-2">
                      <Label htmlFor="evaluation_criteria">Custom Evaluation Instructions</Label>
                      <Textarea
                        id="evaluation_criteria"
                        value={atsConfig.evaluation_criteria}
                        onChange={(e) => handleAtsConfigChange('evaluation_criteria', e.target.value)}
                        placeholder="Add any custom instructions for evaluating applications..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
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
                  <Send className="mr-2" size={18} />
                  {loading ? 'Posting...' : 'Post Job'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostJob;

