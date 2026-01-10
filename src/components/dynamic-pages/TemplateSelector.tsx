'use client';

import React, { useState, useEffect } from 'react';
import { X, Grid3x3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

interface Template {
  id: number;
  name: string;
  description: string;
  thumbnail_url: string | null;
  template_type: string;
  template_content: any;
  category: string;
}

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
  onCancel: () => void;
}

export default function TemplateSelector({ onSelect, onCancel }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'landing', label: 'Landing Pages' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'content', label: 'Content Pages' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/page-templates`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        toast.error('Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Error loading templates');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Choose a Template
            </h1>
            <p className="text-gray-600 mt-2">
              Select a pre-designed template to start building your page
            </p>
          </div>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.value)}
              size="sm"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading templates...</div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <Grid3x3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            No templates available in this category
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden group"
              onClick={() => onSelect(template)}
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                {template.thumbnail_url ? (
                  <img
                    src={template.thumbnail_url}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <Sparkles className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{template.template_type}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <Button
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    size="sm"
                  >
                    Select Template
                  </Button>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
