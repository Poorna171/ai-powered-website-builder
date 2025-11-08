import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">
              <span className="text-sky-500">Master</span>
              <span className="text-orange-500">Solis</span>
            </h3>
            <p className="text-sm mb-4">
              MasterSolis InfoTech believes in connecting corporate professionals to excel students professionally and make them industry-ready.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="hover:text-sky-500 transition-colors" aria-label="LinkedIn" data-testid="footer-linkedin">
                <Linkedin size={20} />
              </a>
              <a href="#" className="hover:text-sky-500 transition-colors" aria-label="Twitter" data-testid="footer-twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-sky-500 transition-colors" aria-label="Facebook" data-testid="footer-facebook">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-sky-500 transition-colors" data-testid="footer-link-about">About Us</Link></li>
              <li><Link to="/services" className="hover:text-sky-500 transition-colors" data-testid="footer-link-services">Services</Link></li>
              <li><Link to="/projects" className="hover:text-sky-500 transition-colors" data-testid="footer-link-projects">Projects</Link></li>
              <li><Link to="/careers" className="hover:text-sky-500 transition-colors" data-testid="footer-link-careers">Careers</Link></li>
              <li><Link to="/blog" className="hover:text-sky-500 transition-colors" data-testid="footer-link-blog">Blog</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-sky-500 transition-colors cursor-pointer">Cloud Solutions</span></li>
              <li><span className="hover:text-sky-500 transition-colors cursor-pointer">IT Services</span></li>
              <li><span className="hover:text-sky-500 transition-colors cursor-pointer">Web Development</span></li>
              <li><span className="hover:text-sky-500 transition-colors cursor-pointer">Full Stack Training</span></li>
              <li><span className="hover:text-sky-500 transition-colors cursor-pointer">Internships</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Mail size={16} className="mt-1 flex-shrink-0" />
                <span>info@mastersolis.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone size={16} className="mt-1 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>123 Tech Street, Innovation City, IN 12345</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} MasterSolis InfoTech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;