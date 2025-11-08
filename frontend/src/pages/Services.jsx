import React from 'react';
import { Cloud, Code, Server, GraduationCap, Rocket, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    {
      icon: <Cloud size={48} />,
      title: 'Cloud Solutions',
      description: 'We offer cloud storage solutions that are designed to meet your specific needs. With our state-of-the-art technology, you can rest assured that your data is safe and easily accessible.',
      features: [
        'Secure cloud storage',
        'Scalable infrastructure',
        'Data backup & recovery',
        '24/7 monitoring',
        'Cost-effective solutions'
      ],
      color: 'bg-sky-500'
    },
    {
      icon: <Server size={48} />,
      title: 'IT Services',
      description: 'Our proficient cutting-edge technology allows us to provide the most efficient services available, while our team of experienced professionals brings a wealth of knowledge and expertise to every project.',
      features: [
        'IT consulting',
        'System integration',
        'Network management',
        'Cybersecurity',
        'Technical support'
      ],
      color: 'bg-orange-500'
    },
    {
      icon: <Code size={48} />,
      title: 'Web Development',
      description: 'We specialize in creating responsive designs that are fully customizable to your unique business needs. Our team prioritizes a user-friendly interface for optimal customer engagement.',
      features: [
        'Custom web applications',
        'Responsive design',
        'E-commerce solutions',
        'CMS development',
        'API integration'
      ],
      color: 'bg-purple-500'
    },
    {
      icon: <GraduationCap size={48} />,
      title: 'Full Stack Training',
      description: 'Our full stack training program offers expert training, giving you all the tools you need to become a successful developer. We provide a comprehensive curriculum that covers everything you need to know.',
      features: [
        'Frontend & backend development',
        'Database management',
        'Modern frameworks',
        'Project-based learning',
        'Career guidance'
      ],
      color: 'bg-emerald-500'
    },
    {
      icon: <Rocket size={48} />,
      title: 'Projects',
      description: 'Looking for a team that can take on your final year project with confidence? Our IT startup specializes in providing innovative solutions that will help take your project to a whole new level.',
      features: [
        'Final year projects',
        'Research & development',
        'Innovation consulting',
        'Project management',
        'Technical mentorship'
      ],
      color: 'bg-pink-500'
    },
    {
      icon: <Users size={48} />,
      title: 'Internships',
      description: 'Our comprehensive internship program offers hands-on experience in the fast-paced world of technology. We provide a supportive and stimulating environment where you will thrive and grow.',
      features: [
        'Real-world projects',
        'Industry exposure',
        'Skill development',
        'Mentorship program',
        'Certification'
      ],
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-sky-50 via-white to-orange-50" data-testid="services-hero-section">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="services-main-heading">
            Our <span className="gradient-text">Services</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive IT solutions and training programs tailored to your business needs and career goals.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4 bg-white" data-testid="services-grid-section">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-16">
            {services.map((service, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
                data-testid={`service-detail-${index}`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <Card className="border-0 shadow-xl h-full">
                    <CardContent className="p-12">
                      <div className={`w-20 h-20 rounded-2xl ${service.color} text-white flex items-center justify-center mb-6`}>
                        {service.icon}
                      </div>
                      <h2 className="text-3xl font-bold mb-4">{service.title}</h2>
                      <p className="text-base text-gray-600 mb-6">{service.description}</p>
                      <Button
                        className="bg-sky-500 hover:bg-sky-600 btn-hover-scale"
                        asChild
                        data-testid={`service-contact-button-${index}`}
                      >
                        <Link to="/contact">Get Started</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold mb-6">Key Features</h3>
                    {service.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-start space-x-3" data-testid={`service-feature-${index}-${fIndex}`}>
                        <CheckCircle className="text-sky-500 flex-shrink-0 mt-1" size={20} />
                        <p className="text-base text-gray-700">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-sky-500 to-orange-500" data-testid="services-cta-section">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-base sm:text-lg mb-8 opacity-90">
            Let's discuss how our services can help your business grow and succeed in the digital era.
          </p>
          <Button
            size="lg"
            className="bg-white text-sky-600 hover:bg-gray-100 btn-hover-scale"
            asChild
            data-testid="services-cta-button"
          >
            <Link to="/contact">Contact Us Today</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;