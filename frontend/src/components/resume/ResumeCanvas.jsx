import React from 'react';
import { Mail } from 'lucide-react';

const ResumeCanvas = ({ formData, template }) => {
  const getTemplateStyles = () => {
    switch (template) {
      case 'modern':
        return {
          container: 'bg-gradient-to-br from-sky-50 to-orange-50',
          header: 'bg-gradient-to-r from-sky-500 to-orange-500 text-white',
          section: 'border-l-4 border-sky-500 pl-3',
          title: 'text-lg font-bold text-sky-600',
          text: 'text-gray-900'
        };
      case 'minimal':
        return {
          container: 'bg-white border-2 border-gray-300',
          header: 'border-b-4 border-gray-900',
          section: 'border-b border-gray-200 pb-3',
          title: 'text-base font-semibold text-gray-900 uppercase tracking-wide',
          text: 'text-gray-900'
        };
      case 'executive':
        return {
          container: 'bg-gradient-to-br from-gray-50 to-white',
          header: 'bg-gray-800 text-white border-b-4 border-sky-500',
          section: 'mb-4 pb-3 border-b-2 border-gray-200',
          title: 'text-lg font-serif text-gray-800',
          text: 'text-gray-900'
        };
      case 'creative':
        return {
          container: 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-4 border-purple-300',
          header: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white',
          section: 'border-l-8 border-pink-500 pl-4',
          title: 'text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
          text: 'text-gray-900'
        };
      default:
        return {
          container: 'bg-white',
          header: 'bg-sky-500 text-white',
          section: 'border-l-4 border-sky-500 pl-3',
          title: 'text-lg font-semibold text-sky-600',
          text: 'text-gray-900'
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div className={`resume-printable w-full aspect-[8.5/11] ${styles.container} shadow-2xl rounded-lg p-12 space-y-5 print:bg-white print:shadow-none print:rounded-none print:p-8`}>
      {/* Header */}
      <div className={`flex items-start gap-6 pb-4 mb-4 ${styles.header} -m-12 mb-4 p-12 rounded-t-lg print:bg-white print:text-gray-900 print:border-b-2 print:border-gray-800`}>
        {formData.photo && (
          <img
            src={formData.photo}
            alt={formData.fullName}
            className="w-20 h-20 rounded-full object-cover border-4 border-white/30 print:w-16 print:h-16 print:border-2 print:border-gray-300"
          />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1 print:text-2xl print:text-gray-900">
            {formData.fullName}
          </h1>
          <p className="text-lg font-medium mb-2 print:text-base print:text-gray-700">{formData.desiredRole}</p>
          <div className="flex items-center gap-2 text-sm print:text-xs print:text-gray-600">
            <Mail className="w-4 h-4 print:hidden" />
            {formData.email}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Professional Summary */}
        <div className="space-y-1">
          <h2 className={`${styles.title} ${styles.section} pb-1 print:text-base print:font-bold print:text-gray-900 print:uppercase print:border-b print:border-gray-300`}>
            Professional Summary
          </h2>
          <p className={`text-sm leading-relaxed ${styles.text} print:text-xs print:text-gray-700`}>
            Results-driven {formData.role} with proven expertise in {formData.technicalSkills.slice(0, 3).join(', ')}.
            Currently seeking opportunities as {formData.desiredRole} to leverage technical and strategic skills
            in driving innovation and excellence.
          </p>
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <h2 className={`${styles.title} ${styles.section} pb-1 print:text-base print:font-bold print:text-gray-900 print:uppercase print:border-b print:border-gray-300`}>
            Experience
          </h2>
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`font-semibold ${styles.text} print:text-sm print:text-gray-900`}>{formData.role}</h3>
                <p className={`text-sm ${styles.text} print:text-xs print:text-gray-700`}>{formData.company}</p>
              </div>
              <p className={`text-sm ${styles.text} print:text-xs print:text-gray-600`}>{formData.duration || 'Present'}</p>
            </div>
          </div>
        </div>

        {/* Technical Skills */}
        <div className="space-y-1">
          <h2 className={`${styles.title} ${styles.section} pb-1 print:text-base print:font-bold print:text-gray-900 print:uppercase print:border-b print:border-gray-300`}>
            Technical Skills
          </h2>
          <p className={`text-sm ${styles.text} print:text-xs print:text-gray-700`}>
            {formData.technicalSkills.join(', ')}
          </p>
        </div>

        {/* Core Competencies */}
        {formData.nonTechnicalSkills.length > 0 && (
          <div className="space-y-1">
            <h2 className={`${styles.title} ${styles.section} pb-1 print:text-base print:font-bold print:text-gray-900 print:uppercase print:border-b print:border-gray-300`}>
              Core Competencies
            </h2>
            <p className={`text-sm ${styles.text} print:text-xs print:text-gray-700`}>
              {formData.nonTechnicalSkills.join(', ')}
            </p>
          </div>
        )}

        {/* Education */}
        <div className="space-y-1">
          <h2 className={`${styles.title} ${styles.section} pb-1 print:text-base print:font-bold print:text-gray-900 print:uppercase print:border-b print:border-gray-300`}>
            Education
          </h2>
          <p className={`text-sm font-medium ${styles.text} capitalize print:text-xs print:text-gray-700`}>
            {formData.education.replace('-', ' ')}
          </p>
        </div>

        {/* Certifications */}
        {formData.certifications.length > 0 && (
          <div className="space-y-1">
            <h2 className={`${styles.title} ${styles.section} pb-1 print:text-base print:font-bold print:text-gray-900 print:uppercase print:border-b print:border-gray-300`}>
              Certifications
            </h2>
            <ul className={`list-disc list-inside text-sm ${styles.text} space-y-0.5 print:text-xs print:text-gray-700`}>
              {formData.certifications.map((cert, index) => (
                <li key={index}>{cert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Languages */}
        {formData.languages.length > 0 && (
          <div className="space-y-1">
            <h2 className={`${styles.title} ${styles.section} pb-1 print:text-base print:font-bold print:text-gray-900 print:uppercase print:border-b print:border-gray-300`}>
              Languages
            </h2>
            <p className={`text-sm ${styles.text} print:text-xs print:text-gray-700`}>{formData.languages.join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeCanvas;

