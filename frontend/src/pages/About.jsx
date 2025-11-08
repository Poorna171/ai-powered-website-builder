import React from 'react';
import { Target, Eye, Award, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  const values = [
    {
      icon: <Target size={32} />,
      title: 'Mission',
      description: 'To connect corporate professionals with excel students, bridging the gap between academia and industry through innovative technology solutions.',
      color: 'bg-sky-100 text-sky-600'
    },
    {
      icon: <Eye size={32} />,
      title: 'Vision',
      description: 'To become the leading IT consulting partner that transforms businesses and careers through cutting-edge technology and expert training.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: <Award size={32} />,
      title: 'Excellence',
      description: 'We are committed to delivering the highest quality services and training, ensuring our clients and students achieve their full potential.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: <Users size={32} />,
      title: 'Collaboration',
      description: 'We believe in the power of teamwork and partnerships, fostering an environment where innovation and growth thrive together.',
      color: 'bg-emerald-100 text-emerald-600'
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-sky-50 via-white to-orange-50" data-testid="about-hero-section">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="about-heading">
            About <span className="gradient-text">MasterSolis</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Empowering businesses and individuals through innovative IT solutions and comprehensive training programs.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 bg-white" data-testid="story-section">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="slide-in-left">
              <h2 className="text-4xl font-bold mb-6">Our Story</h2>
              <p className="text-base text-gray-600 mb-4">
                MasterSolis InfoTech was founded with a clear vision: to bridge the gap between academic learning
                and industry requirements. We recognized that while students excel in their studies, they often
                lack the practical experience needed to thrive in corporate environments.
              </p>
              <p className="text-base text-gray-600 mb-4">
                Our journey began with a small team of passionate professionals who believed in the power of
                technology and education. Today, we've grown into a comprehensive IT consulting firm that not
                only provides cutting-edge solutions to businesses but also prepares the next generation of
                tech professionals.
              </p>
              <p className="text-base text-gray-600">
                Through our range of services - from cloud solutions to full-stack training - we continue to
                make a lasting impact on both businesses and individuals, helping them achieve their goals
                and realize their full potential.
              </p>
            </div>
            <div className="slide-in-right">
              <div className="bg-gradient-to-br from-sky-100 to-orange-100 rounded-2xl p-12 h-96 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-6xl font-bold text-sky-600 mb-4">5+</h3>
                  <p className="text-xl text-gray-700">Years of Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-gray-50" data-testid="values-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="values-heading">Our Values</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl card-hover"
                data-testid={`value-card-${index}`}
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 rounded-xl ${value.color} flex items-center justify-center mx-auto mb-6`}>
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-white" data-testid="team-section">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Meet Our Team</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Our team consists of experienced professionals, certified trainers, and industry experts who are
            passionate about technology and education. Together, we work to deliver exceptional results for
            our clients and students.
          </p>
          <div className="bg-gradient-to-br from-sky-50 to-orange-50 rounded-2xl p-12">
            <p className="text-lg text-gray-700 italic">
              "We are a diverse team united by a common goal: to empower businesses and individuals through
              technology and knowledge. Our collaborative approach ensures that every project receives the
              attention, expertise, and innovation it deserves."
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;