import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X, Send, Image as ImageIcon, Upload } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const PostBlog = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    tags: [],
    published: false
  });
  const [tagInput, setTagInput] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [contentImages, setContentImages] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContentImageAdd = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setContentImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeContentImage = (index) => {
    setContentImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.content || !formData.author) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.content.length < 100) {
      toast.error('Blog content must be at least 100 characters');
      return;
    }

    setLoading(true);

    try {
      // Convert images to base64
      let featuredImageBase64 = null;
      if (featuredImage) {
        featuredImageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result.split(',')[1]); // Remove data:image/...;base64, prefix
          };
          reader.onerror = reject;
          reader.readAsDataURL(featuredImage);
        });
      }

      const blogData = {
        title: formData.title,
        content: formData.content,
        author: formData.author,
        tags: formData.tags,
        featured_image: featuredImageBase64,
        images: contentImages.map(img => img.split(',')[1]), // Remove data:image/...;base64, prefix
        published: formData.published
      };

      console.log('Posting blog:', blogData);
      const response = await axios.post(`${API}/blog`, blogData);
      console.log('Blog posted successfully:', response.data);
      toast.success('Blog post created successfully! AI summary generated automatically.');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error posting blog:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to post blog: ${error.response?.data?.detail || error.message}`);
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
                <h1 className="text-2xl font-bold">Create Blog Post</h1>
                <p className="text-sm text-gray-600">Write and publish a new blog post</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>New Blog Post</CardTitle>
            <CardDescription>Create a professional blog post with images and AI-generated summary</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter blog post title"
                  required
                />
              </div>

              {/* Author */}
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  placeholder="Author name"
                  required
                />
              </div>

              {/* Featured Image */}
              <div className="space-y-2">
                <Label htmlFor="featured_image">Featured Image</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      id="featured_image"
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: 1200x630px, max 5MB</p>
                  </div>
                  {featuredImagePreview && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border">
                      <img
                        src={featuredImagePreview}
                        alt="Featured preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Write your blog post content here... (Minimum 100 characters)"
                  rows={15}
                  required
                  className="font-sans"
                />
                <p className="text-xs text-gray-500">
                  {formData.content.length} characters (minimum 100)
                </p>
              </div>

              {/* Content Images */}
              <div className="space-y-2">
                <Label>Content Images</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleContentImageAdd}
                    className="cursor-pointer"
                  />
                </div>
                {contentImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {contentImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Content ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeContentImage(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTagAdd();
                      }
                    }}
                    placeholder="Add a tag and press Enter"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTagAdd}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => handleInputChange('published', e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="published" className="cursor-pointer">
                  Publish immediately
                </Label>
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
                  {loading ? 'Creating...' : 'Create Blog Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PostBlog;

