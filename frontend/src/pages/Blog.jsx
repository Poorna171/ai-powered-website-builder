import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import { Calendar, User, ArrowRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const Blog = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog?published=true`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-sky-50 via-white to-orange-50" data-testid="blog-hero-section">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="blog-main-heading">
            Our <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Insights, updates, and stories from the world of technology and innovation.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 px-4 bg-white" data-testid="blog-posts-section">
        <div className="max-w-7xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20" data-testid="no-posts-message">
              <p className="text-lg text-gray-600">No blog posts available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Card
                  key={post.id}
                  className="border-0 shadow-lg hover:shadow-xl card-hover overflow-hidden"
                  data-testid={`blog-post-card-${index}`}
                >
                  {post.featured_image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.featured_image.startsWith('data:') ? post.featured_image : `data:image/jpeg;base64,${post.featured_image}`}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  {!post.featured_image && (
                    <div className="h-48 bg-gradient-to-br from-sky-100 to-orange-100 flex items-center justify-center">
                      <span className="text-4xl font-bold text-sky-500">{post.title.charAt(0)}</span>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags && post.tags.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt || post.content.substring(0, 150) + '...'}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <User size={14} className="mr-1" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span>{formatDate(post.created_date)}</span>
                      </div>
                    </div>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-sky-600 hover:text-sky-700 font-medium text-sm inline-flex items-center"
                      data-testid={`blog-read-more-${index}`}
                    >
                      Read More <ArrowRight className="ml-1" size={16} />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;