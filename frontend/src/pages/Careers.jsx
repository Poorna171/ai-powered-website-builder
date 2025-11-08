import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import { toast } from 'sonner';
import { MapPin, Briefcase, Clock, Upload, CheckCircle, XCircle, FileSearch } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusEmail, setStatusEmail] = useState('');
  const [userApplications, setUserApplications] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cover_letter: ''
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await axios.get(`${API}/jobs?status=active`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load job listings');
    }
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplyDialog(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!resumeFile) {
      toast.error('Please upload your resume');
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('job_id', selectedJob.id);
    formDataToSend.append('job_title', selectedJob.title);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('cover_letter', formData.cover_letter);
    formDataToSend.append('resume', resumeFile);

    try {
      console.log('Submitting application for job:', selectedJob.id);
      const response = await axios.post(`${API}/applications`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const result = response.data;
      console.log('Application submitted successfully:', result);
      let message = 'Application submitted successfully! We\'ll be in touch soon.';
      if (result.accuracy !== undefined) {
        message += ` Your application accuracy: ${result.accuracy}%. Status: ${result.status}.`;
      }
      toast.success(message);
      setShowApplyDialog(false);
      setFormData({ name: '', email: '', phone: '', cover_letter: '' });
      setResumeFile(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to submit application: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!statusEmail || !statusEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoadingStatus(true);
    try {
      const encodedEmail = encodeURIComponent(statusEmail);
      console.log('Checking status for email:', statusEmail);
      const response = await axios.get(`${API}/applications/by-email/${encodedEmail}`);
      console.log('Applications found:', response.data);
      setUserApplications(response.data);
      setShowStatusDialog(true);
      if (response.data.length === 0) {
        toast.info('No applications found for this email address.');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to check application status: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoadingStatus(false);
    }
  };

  const getStatusBadge = (status, accuracy) => {
    if (status === 'selected') {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle size={16} />
          <span className="font-semibold">Selected (Accuracy: {accuracy}%)</span>
        </div>
      );
    } else if (status === 'rejected') {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <XCircle size={16} />
          <span className="font-semibold">Rejected (Accuracy: {accuracy}%)</span>
        </div>
      );
    } else if (status === 'reviewing') {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <FileSearch size={16} />
          <span className="font-semibold">Under Review</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-yellow-600">
          <Clock size={16} />
          <span className="font-semibold">Pending Review</span>
        </div>
      );
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.name.match(/\.(pdf|docx|doc)$/i)) {
        toast.error('Only PDF and DOCX files are allowed');
        return;
      }
      setResumeFile(file);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-sky-50 via-white to-orange-50" data-testid="careers-hero-section">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="careers-main-heading">
            Join Our <span className="gradient-text">Team</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Build your career with MasterSolis InfoTech. Explore exciting opportunities in technology and innovation.
          </p>
          {/* Check Application Status */}
          <Card className="max-w-md mx-auto border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Check Your Application Status</h3>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={statusEmail}
                  onChange={(e) => setStatusEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={checkApplicationStatus}
                  disabled={loadingStatus}
                  className="bg-sky-500 hover:bg-sky-600"
                >
                  {loadingStatus ? 'Checking...' : 'Check Status'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-20 px-4 bg-white" data-testid="careers-jobs-section">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Open Positions</h2>
          
          {jobs.length === 0 ? (
            <div className="text-center py-20" data-testid="no-jobs-message">
              <p className="text-lg text-gray-600">No open positions at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job, index) => (
                <Card
                  key={job.id}
                  className="border-0 shadow-lg hover:shadow-xl card-hover"
                  data-testid={`job-card-${index}`}
                >
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold mb-3" data-testid={`job-title-${index}`}>{job.title}</h3>
                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Briefcase size={16} className="mr-2" />
                            <span className="text-sm">{job.department}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin size={16} className="mr-2" />
                            <span className="text-sm">{job.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock size={16} className="mr-2" />
                            <span className="text-sm">{job.type}</span>
                          </div>
                          {job.timings && (
                            <div className="flex items-center text-gray-600">
                              <Clock size={16} className="mr-2" />
                              <span className="text-sm">{job.timings}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{job.description}</p>
                        {job.qualification && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-sm mb-2 text-gray-700">Required Qualification:</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{job.qualification}</p>
                          </div>
                        )}
                        <div className="space-y-2">
                          {job.requirements && job.requirements.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Key Requirements:</h4>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {job.requirements.slice(0, 4).map((req, i) => (
                                  <li key={i}>{req}</li>
                                ))}
                                {job.requirements.length > 4 && (
                                  <li className="text-sky-600">+{job.requirements.length - 4} more requirements</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start mt-6 lg:mt-0 lg:ml-8">
                        <Button
                          className="bg-sky-500 hover:bg-sky-600 btn-hover-scale"
                          onClick={() => handleApply(job)}
                          data-testid={`apply-button-${index}`}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-20 px-4 bg-gray-50" data-testid="why-join-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Join MasterSolis?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-3">Growth Opportunities</h3>
                <p className="text-sm text-gray-600">Continuous learning and career advancement in a dynamic environment.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="text-xl font-semibold mb-3">Innovative Projects</h3>
                <p className="text-sm text-gray-600">Work on cutting-edge technology and challenging projects.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-3">Great Team Culture</h3>
                <p className="text-sm text-gray-600">Collaborative environment with supportive team members.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="application-dialog">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Fill in your details to apply for this position. We'll review your application and get back to you soon.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitApplication} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                data-testid="application-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                data-testid="application-email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                data-testid="application-phone-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resume">Resume * (PDF or DOCX, max 5MB)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  required
                  data-testid="application-resume-input"
                />
                {resumeFile && (
                  <Badge variant="outline" className="text-xs">
                    {resumeFile.name}
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover_letter">Cover Letter (Optional)</Label>
              <Textarea
                id="cover_letter"
                value={formData.cover_letter}
                onChange={(e) => setFormData({...formData, cover_letter: e.target.value})}
                rows={5}
                placeholder="Tell us why you're a great fit for this role..."
                data-testid="application-cover-letter-input"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowApplyDialog(false)}
                disabled={loading}
                data-testid="application-cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-sky-500 hover:bg-sky-600"
                disabled={loading}
                data-testid="application-submit-button"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Application Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Application Status</DialogTitle>
            <DialogDescription>
              Applications submitted with email: {statusEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {userApplications.length === 0 ? (
              <p className="text-center text-gray-600 py-8">
                No applications found for this email address.
              </p>
            ) : (
              userApplications.map((app, index) => (
                <Card key={app.id} className="border">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{app.job_title}</h3>
                        <p className="text-sm text-gray-600">
                          Applied on: {new Date(app.applied_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      {getStatusBadge(app.status, app.ai_analysis?.accuracy)}
                    </div>
                    {app.ai_analysis && app.ai_analysis.accuracy !== undefined && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold mb-2">ATS Analysis:</p>
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Accuracy Score:</strong> {app.ai_analysis.accuracy}%
                        </p>
                        <p className="text-xs text-gray-600">
                          {app.ai_analysis.raw_analysis}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Careers;