import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cloud, Code, Briefcase, GraduationCap, Rocket, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const response = await axios.get(`${API}/testimonials?featured=true`);
      setTestimonials(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error loading testimonials:', error);
    }
  };

  const services = [
    {
      icon: <Cloud size={32} />,
      title: 'Cloud Solutions',
      description: 'Secure cloud storage solutions designed to meet your specific needs with state-of-the-art technology.',
      color: 'bg-sky-100 text-sky-600'
    },
    {
      icon: <Code size={32} />,
      title: 'Web Development',
      description: 'Responsive and fully customizable designs with user-friendly interfaces for optimal engagement.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: <Briefcase size={32} />,
      title: 'IT Services',
      description: 'Cutting-edge technology services with experienced professionals bringing wealth of knowledge.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: <GraduationCap size={32} />,
      title: 'Full Stack Training',
      description: 'Comprehensive training program with expert guidance to become a successful developer.',
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      icon: <Rocket size={32} />,
      title: 'Projects',
      description: 'Innovative solutions for final year projects that take your work to a whole new level.',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      icon: <Users size={32} />,
      title: 'Internships',
      description: 'Hands-on experience in fast-paced technology environment where you will thrive and grow.',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <ChatBot />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-orange-50 -z-10"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="hero-heading">
              Experience Digital Excellence with{' '}
              <span className="gradient-text">MasterSolis</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mb-8" data-testid="hero-description">
              MasterSolis InfoTech believes in connecting corporate professionals to excel students
              professionally and make them industry-ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-sky-500 hover:bg-sky-600 text-white btn-hover-scale"
                asChild
                data-testid="hero-cta-primary"
              >
                <Link to="/contact">
                  Get Started <ArrowRight className="ml-2" size={20} />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-sky-500 text-sky-600 hover:bg-sky-50 btn-hover-scale"
                asChild
                data-testid="hero-cta-secondary"
              >
                <Link to="/services">Our Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-white" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="services-heading">Our Services</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              MasterSolis InfoTech is your go-to IT consulting partner with expertise to help your business succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl card-hover"
                data-testid={`service-card-${index}`}
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-xl ${service.color} flex items-center justify-center mb-6`}>
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  <Link
                    to="/services"
                    className="text-sky-600 hover:text-sky-700 font-medium text-sm inline-flex items-center"
                    data-testid={`service-learn-more-${index}`}
                  >
                    Learn More <ArrowRight className="ml-1" size={16} />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-sky-500 to-sky-600" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center text-white fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="cta-heading">
            Discover How MasterSolis Can Transform Your Business
          </h2>
          <p className="text-base sm:text-lg mb-8 opacity-90">
            From digital marketing to full-fledged software development, MasterSolis provides innovative
            solutions tailored to your business needs.
          </p>
          <Button
            size="lg"
            className="bg-white text-sky-600 hover:bg-gray-100 btn-hover-scale"
            asChild
            data-testid="cta-button"
          >
            <Link to="/contact">Contact Us Today</Link>
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-20 px-4 bg-gray-50" data-testid="testimonials-section">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-base sm:text-lg text-gray-600">Trusted by businesses worldwide</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={testimonial.id} className="border-0 shadow-lg" data-testid={`testimonial-card-${index}`}>
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mr-4">
                        <span className="text-sky-600 font-semibold text-lg">
                          {testimonial.client_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{testimonial.client_name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.company}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 italic">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Home;