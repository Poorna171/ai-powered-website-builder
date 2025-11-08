import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { toast } from 'sonner';
import { BarChart3, FileText, Briefcase, Users, LogOut, TrendingUp, Download, Plus, CheckCircle, XCircle, Edit, Trash2, BookOpen } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobFilter, setJobFilter] = useState('active'); // 'active', 'closed', 'all'
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }
    setAdmin(JSON.parse(adminData));
    loadDashboardData();
  }, []);

  // Reload data when navigating back to dashboard (e.g., after editing a job)
  useEffect(() => {
    if (location.pathname === '/admin/dashboard') {
      loadDashboardData();
    }
  }, [location.pathname]);

  // Reload data when component comes into focus
  useEffect(() => {
    const handleFocus = () => {
      loadDashboardData();
    };
    window.addEventListener('focus', handleFocus);
    
    // Reload data when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboardData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsRes, applicationsRes, contactsRes, jobsRes, blogsRes] = await Promise.all([
        axios.get(`${API}/admin/analytics`),
        axios.get(`${API}/applications`),
        axios.get(`${API}/contact`),
        axios.get(`${API}/jobs`),
        axios.get(`${API}/blog`)
      ]);

      setAnalytics(analyticsRes.data);
      setApplications(applicationsRes.data);
      setContacts(contactsRes.data);
      setJobs(jobsRes.data);
      setBlogs(blogsRes.data);
      
      console.log('Dashboard data loaded:', {
        analytics: analyticsRes.data,
        applications: applicationsRes.data.length,
        contacts: contactsRes.data.length,
        jobs: jobsRes.data.length,
        blogs: blogsRes.data.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to load dashboard data: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const updateApplicationStatus = async (appId, status) => {
    try {
      await axios.put(`${API}/applications/${appId}/status?status=${status}`);
      toast.success('Application status updated');
      loadDashboardData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(`${API}/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting job:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to delete job: ${error.response?.data?.detail || error.message}`);
    }
  };

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      await axios.put(`${API}/jobs/${jobId}/status?status=${newStatus}`);
      toast.success(`Job status updated to ${newStatus}`);
      loadDashboardData();
    } catch (error) {
      console.error('Error updating job status:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to update job status: ${error.response?.data?.detail || error.message}`);
    }
  };

  const filteredJobs = () => {
    if (jobFilter === 'all') {
      return jobs;
    }
    return jobs.filter(job => job.status === jobFilter);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" data-testid="admin-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                <span className="text-sky-500">Master</span>
                <span className="text-orange-500">Solis</span>
                {' '}Admin
              </h1>
              <p className="text-sm text-gray-600">Welcome back, {admin.username}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={() => navigate('/admin/post-blog')}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <BookOpen className="mr-2" size={18} />
                Write Post
              </Button>
              <Button
                variant="default"
                onClick={() => navigate('/admin/post-job')}
                className="bg-sky-500 hover:bg-sky-600"
              >
                <Plus className="mr-2" size={18} />
                Post New Job
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                data-testid="logout-button"
              >
                <LogOut className="mr-2" size={18} />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="analytics-section">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Contacts</p>
                  <p className="text-3xl font-bold text-sky-600" data-testid="total-contacts">
                    {analytics?.total_contacts || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                  <Users className="text-sky-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Job Applications</p>
                  <p className="text-3xl font-bold text-orange-600" data-testid="total-applications">
                    {analytics?.total_applications || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Briefcase className="text-orange-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Jobs</p>
                  <p className="text-3xl font-bold text-purple-600" data-testid="total-jobs">
                    {analytics?.total_jobs || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Published Blogs</p>
                  <p className="text-3xl font-bold text-emerald-600" data-testid="total-blogs">
                    {analytics?.total_blogs || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FileText className="text-emerald-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Summary */}
        {analytics?.ai_summary && (
          <Card className="mb-8 border-sky-200 bg-sky-50">
            <CardHeader>
              <CardTitle className="flex items-center text-sky-700">
                <BarChart3 className="mr-2" size={20} />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700" data-testid="ai-insights">{analytics.ai_summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Data */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <Tabs defaultValue="applications" data-testid="admin-tabs">
              <TabsList className="mb-6">
                <TabsTrigger value="applications" data-testid="applications-tab">All Applications ({applications.length})</TabsTrigger>
                <TabsTrigger value="selected" data-testid="selected-tab">
                  Selected ({applications.filter(app => app.status === 'selected').length})
                </TabsTrigger>
                <TabsTrigger value="rejected" data-testid="rejected-tab">
                  Rejected ({applications.filter(app => app.status === 'rejected').length})
                </TabsTrigger>
                <TabsTrigger value="contacts" data-testid="contacts-tab">Contacts ({contacts.length})</TabsTrigger>
                <TabsTrigger value="jobs" data-testid="jobs-tab">Jobs ({jobs.length})</TabsTrigger>
                <TabsTrigger value="blogs" data-testid="blogs-tab">
                  <BookOpen className="mr-2" size={16} />
                  Blog Posts ({blogs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="applications">
                <div className="space-y-4">
                  {applications.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">No applications yet</p>
                  ) : (
                    applications.map((app, index) => (
                      <Card key={app.id} className="border" data-testid={`application-card-${index}`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div className="flex-1 mb-4 md:mb-0">
                              <h3 className="text-lg font-semibold mb-2">{app.name}</h3>
                              <p className="text-sm text-gray-600 mb-1"><strong>Position:</strong> {app.job_title}</p>
                              <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong> {app.email}</p>
                              <p className="text-sm text-gray-600 mb-1"><strong>Phone:</strong> {app.phone}</p>
                              <p className="text-sm text-gray-600 mb-2"><strong>Applied:</strong> {formatDate(app.applied_date)}</p>
                              {app.ai_analysis && (
                                <div className="mt-3 p-3 bg-sky-50 rounded-lg">
                                  <p className="text-xs font-semibold text-sky-700 mb-1">
                                    ATS Analysis {app.ai_analysis.accuracy !== undefined && `- Accuracy: ${app.ai_analysis.accuracy}%`}
                                  </p>
                                  <p className="text-xs text-gray-700">{app.ai_analysis.raw_analysis}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Badge className={`
                                ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${app.status === 'reviewing' ? 'bg-blue-100 text-blue-800' : ''}
                                ${app.status === 'shortlisted' ? 'bg-green-100 text-green-800' : ''}
                                ${app.status === 'selected' ? 'bg-green-100 text-green-800' : ''}
                                ${app.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                              `}>
                                {app.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateApplicationStatus(app.id, 'reviewing')}
                                disabled={app.status === 'reviewing'}
                              >
                                Mark Reviewing
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600"
                                onClick={() => updateApplicationStatus(app.id, 'shortlisted')}
                                disabled={app.status === 'shortlisted'}
                              >
                                Shortlist
                              </Button>
                              {app.resume_filename && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600"
                                  onClick={() => window.open(`${API}/applications/${app.id}/resume`, '_blank')}
                                >
                                  <Download className="mr-1" size={14} />
                                  Download Resume
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="selected">
                <div className="space-y-4">
                  {applications.filter(app => app.status === 'selected').length === 0 ? (
                    <p className="text-center text-gray-600 py-8">No selected applications yet</p>
                  ) : (
                    applications.filter(app => app.status === 'selected').map((app, index) => (
                      <Card key={app.id} className="border border-green-200 bg-green-50">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div className="flex-1 mb-4 md:mb-0">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="text-green-600" size={20} />
                                <h3 className="text-lg font-semibold">{app.name}</h3>
                                <Badge className="bg-green-100 text-green-800">Selected</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1"><strong>Position:</strong> {app.job_title}</p>
                              <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong> {app.email}</p>
                              <p className="text-sm text-gray-600 mb-1"><strong>Phone:</strong> {app.phone}</p>
                              <p className="text-sm text-gray-600 mb-2"><strong>Applied:</strong> {formatDate(app.applied_date)}</p>
                              {app.ai_analysis && app.ai_analysis.accuracy !== undefined && (
                                <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                                  <p className="text-sm font-semibold text-green-700 mb-1">
                                    ATS Accuracy: <span className="text-lg">{app.ai_analysis.accuracy}%</span>
                                  </p>
                                  <p className="text-xs text-gray-700">{app.ai_analysis.raw_analysis}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col space-y-2">
                              {app.resume_filename && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600"
                                  onClick={() => window.open(`${API}/applications/${app.id}/resume`, '_blank')}
                                >
                                  <Download className="mr-1" size={14} />
                                  Download Resume
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="rejected">
                <div className="space-y-4">
                  {applications.filter(app => app.status === 'rejected').length === 0 ? (
                    <p className="text-center text-gray-600 py-8">No rejected applications yet</p>
                  ) : (
                    applications.filter(app => app.status === 'rejected').map((app, index) => (
                      <Card key={app.id} className="border border-red-200 bg-red-50">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div className="flex-1 mb-4 md:mb-0">
                              <div className="flex items-center gap-2 mb-2">
                                <XCircle className="text-red-600" size={20} />
                                <h3 className="text-lg font-semibold">{app.name}</h3>
                                <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1"><strong>Position:</strong> {app.job_title}</p>
                              <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong> {app.email}</p>
                              <p className="text-sm text-gray-600 mb-1"><strong>Phone:</strong> {app.phone}</p>
                              <p className="text-sm text-gray-600 mb-2"><strong>Applied:</strong> {formatDate(app.applied_date)}</p>
                              {app.ai_analysis && app.ai_analysis.accuracy !== undefined && (
                                <div className="mt-3 p-3 bg-white rounded-lg border border-red-200">
                                  <p className="text-sm font-semibold text-red-700 mb-1">
                                    ATS Accuracy: <span className="text-lg">{app.ai_analysis.accuracy}%</span>
                                  </p>
                                  <p className="text-xs text-gray-700">{app.ai_analysis.raw_analysis}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col space-y-2">
                              {app.resume_filename && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600"
                                  onClick={() => window.open(`${API}/applications/${app.id}/resume`, '_blank')}
                                >
                                  <Download className="mr-1" size={14} />
                                  Download Resume
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contacts">
                <div className="space-y-4">
                  {contacts.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">No contacts yet</p>
                  ) : (
                    contacts.map((contact, index) => (
                      <Card key={contact.id} className="border" data-testid={`contact-card-${index}`}>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-2">{contact.name}</h3>
                          <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong> {contact.email}</p>
                          {contact.subject && (
                            <p className="text-sm text-gray-600 mb-1"><strong>Subject:</strong> {contact.subject}</p>
                          )}
                          <p className="text-sm text-gray-600 mb-2"><strong>Date:</strong> {formatDate(contact.timestamp)}</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{contact.message}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="jobs">
                <div className="space-y-4">
                  {/* Job Filter Buttons */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant={jobFilter === 'active' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setJobFilter('active')}
                      className={jobFilter === 'active' ? 'bg-sky-500 hover:bg-sky-600' : ''}
                    >
                      Active Jobs ({jobs.filter(j => j.status === 'active').length})
                    </Button>
                    <Button
                      variant={jobFilter === 'closed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setJobFilter('closed')}
                      className={jobFilter === 'closed' ? 'bg-gray-500 hover:bg-gray-600' : ''}
                    >
                      Closed Jobs ({jobs.filter(j => j.status === 'closed').length})
                    </Button>
                    <Button
                      variant={jobFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setJobFilter('all')}
                      className={jobFilter === 'all' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                    >
                      All Jobs ({jobs.length})
                    </Button>
                    <div className="flex-1"></div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate('/admin/post-blog')}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <BookOpen className="mr-2" size={18} />
                      Write Post
                    </Button>
                    <Button
                      onClick={() => navigate('/admin/post-job')}
                      className="bg-sky-500 hover:bg-sky-600"
                    >
                      <Plus className="mr-2" size={18} />
                      Post New Job
                    </Button>
                  </div>
                  </div>

                  {filteredJobs().length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">
                        {jobFilter === 'active' && 'No active jobs posted yet'}
                        {jobFilter === 'closed' && 'No closed jobs'}
                        {jobFilter === 'all' && 'No jobs posted yet'}
                      </p>
                      {jobFilter === 'active' && (
                        <Button
                          onClick={() => navigate('/admin/post-job')}
                          className="bg-sky-500 hover:bg-sky-600"
                        >
                          <Plus className="mr-2" size={18} />
                          Post Your First Job
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredJobs().map((job, index) => (
                      <Card key={job.id} className="border" data-testid={`job-card-${index}`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                              <Badge className={job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {job.status}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/admin/edit-job/${job.id}`)}
                                title="Edit job details"
                              >
                                <Edit className="mr-1" size={14} />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateJobStatus(job.id, job.status === 'active' ? 'closed' : 'active')}
                                className={job.status === 'active' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                                title={job.status === 'active' ? 'Close job' : 'Activate job'}
                              >
                                {job.status === 'active' ? 'Close' : 'Activate'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => deleteJob(job.id)}
                                title="Delete job permanently"
                              >
                                <Trash2 className="mr-1" size={14} />
                                Delete
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <p className="text-sm text-gray-600"><strong>Department:</strong> {job.department}</p>
                            <p className="text-sm text-gray-600"><strong>Location:</strong> {job.location}</p>
                            <p className="text-sm text-gray-600"><strong>Type:</strong> {job.type}</p>
                            {job.timings && (
                              <p className="text-sm text-gray-600"><strong>Timings:</strong> {job.timings}</p>
                            )}
                          </div>
                          {job.qualification && (
                            <p className="text-sm text-gray-600 mb-2"><strong>Qualification:</strong> {job.qualification}</p>
                          )}
                          <p className="text-sm text-gray-600 mb-3">{job.description.substring(0, 150)}...</p>
                          {job.requirements && job.requirements.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-semibold mb-1">Requirements:</p>
                              <ul className="text-sm text-gray-600 list-disc list-inside">
                                {job.requirements.slice(0, 3).map((req, i) => (
                                  <li key={i}>{req}</li>
                                ))}
                                {job.requirements.length > 3 && (
                                  <li className="text-gray-500">+{job.requirements.length - 3} more</li>
                                )}
                              </ul>
                            </div>
                          )}
                          <p className="text-sm text-gray-500"><strong>Posted:</strong> {formatDate(job.posted_date)}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="blogs">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Blog Posts</h3>
                    <Button
                      onClick={() => navigate('/admin/post-blog')}
                      className="bg-sky-500 hover:bg-sky-600"
                    >
                      <Plus className="mr-2" size={18} />
                      Post New Blog
                    </Button>
                  </div>

                  {blogs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No blog posts yet</p>
                      <Button
                        onClick={() => navigate('/admin/post-blog')}
                        className="bg-sky-500 hover:bg-sky-600"
                      >
                        <Plus className="mr-2" size={18} />
                        Create Your First Blog Post
                      </Button>
                    </div>
                  ) : (
                    blogs.map((blog, index) => (
                      <Card key={blog.id} className="border">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-2">{blog.title}</h3>
                              <div className="flex gap-2 mb-2">
                                <Badge className={blog.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                  {blog.published ? 'Published' : 'Draft'}
                                </Badge>
                                {blog.tags && blog.tags.slice(0, 3).map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          {blog.featured_image && (
                            <div className="mb-3 rounded-lg overflow-hidden">
                              <img
                                src={blog.featured_image.startsWith('data:') ? blog.featured_image : `data:image/jpeg;base64,${blog.featured_image}`}
                                alt={blog.title}
                                className="w-full h-48 object-cover"
                              />
                            </div>
                          )}
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {blog.excerpt || blog.content.substring(0, 150) + '...'}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                            <div className="flex items-center gap-4">
                              <span><strong>Author:</strong> {blog.author}</span>
                              <span><strong>Created:</strong> {formatDate(blog.created_date)}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                                title="View blog post"
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/admin/edit-blog/${blog.slug}`)}
                                title="Edit blog post"
                              >
                                <Edit className="mr-1" size={14} />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => deleteBlog(blog.slug)}
                                title="Delete blog post"
                              >
                                <Trash2 className="mr-1" size={14} />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;