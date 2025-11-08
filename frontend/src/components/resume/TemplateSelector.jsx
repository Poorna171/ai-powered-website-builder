import React from 'react';
import { Check } from 'lucide-react';

const templates = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Gradient accents, clean & contemporary',
    preview: 'bg-gradient-to-br from-sky-100 to-orange-100 border border-sky-300'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Elegant simplicity, monochrome focus',
    preview: 'bg-white border-2 border-gray-300'
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Professional authority, serif style',
    preview: 'bg-gradient-to-br from-gray-50 to-white shadow-md border border-gray-300'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold gradients, artistic flair',
    preview: 'bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 border-2 border-purple-300'
  }
];

const TemplateSelector = ({ selected, onSelect }) => {
  return (
    <div className="space-y-3">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template.id)}
          className={`w-full p-3 rounded-xl border-2 transition-all hover:scale-[1.02] ${
            selected === template.id
              ? 'border-sky-500 bg-sky-50 shadow-lg'
              : 'border-gray-200 hover:border-sky-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-16 h-20 rounded-lg shadow-sm ${template.preview}`} />
            <div className="flex-1 text-left">
              <div className="font-medium">{template.name}</div>
              <div className="text-xs text-gray-600">{template.description}</div>
            </div>
            {selected === template.id && (
              <Check className="w-5 h-5 text-sky-500" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default TemplateSelector;

