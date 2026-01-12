'use client';

import React from 'react';
import { ArrowLeft, Layout, Users, Layers, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TemplateSelectorProps {
  onSelect: (template: { template_type: string; template_content: any }) => void;
  onCancel: () => void;
}

// 4 Fixed Page Templates
const fixedTemplates = [
  {
    id: 'template_a',
    name: 'Template A – Image ↔ Content Split',
    description: 'Single template with layout direction toggle. Perfect for about pages, service pages, or any content with a featured image.',
    icon: Layout,
    color: 'bg-blue-500',
    template_type: 'template_a',
    template_content: {
      layoutDirection: 'IMAGE_LEFT',
      mainImage: '',
      heading: 'Your Heading Here',
      richTextContent: 'Enter your rich text content here...',
      bulletPoints: [
        { text: 'First bullet point' },
        { text: 'Second bullet point' },
        { text: 'Third bullet point' },
      ],
      ctaText: '',
      ctaLink: '',
    },
    features: ['Layout Direction Toggle', 'Hero Image', 'Rich Text', 'Bullet Points', 'Optional CTA'],
  },
  {
    id: 'template_b',
    name: 'Template B – Clients Page + Blank Section',
    description: 'Showcase your clients with a logo grid and add any custom content in the blank section below.',
    icon: Users,
    color: 'bg-green-500',
    template_type: 'template_b',
    template_content: {
      clients: [
        { name: 'Client 1', logo: '', websiteUrl: '' },
        { name: 'Client 2', logo: '', websiteUrl: '' },
        { name: 'Client 3', logo: '', websiteUrl: '' },
      ],
      blankSection: {
        richText: 'Add any additional content here...',
      },
    },
    features: ['Client Logo Grid', 'Clickable URLs', 'Rich Text Section'],
  },
  {
    id: 'template_c',
    name: 'Template C – Banner Carousel + Content',
    description: 'Auto-playing banner carousel with captions, perfect for showcasing multiple images with text content below.',
    icon: Layers,
    color: 'bg-purple-500',
    template_type: 'template_c',
    template_content: {
      banners: [
        { image: '', caption: 'Banner 1 caption' },
        { image: '', caption: 'Banner 2 caption' },
        { image: '', caption: 'Banner 3 caption' },
      ],
      contentText: 'Add your content text here...',
    },
    features: ['Multiple Banners', 'Image Captions', 'Auto-play', 'Content Section'],
  },
  {
    id: 'template_d',
    name: 'Template D – Visual / Gallery Page',
    description: 'Beautiful masonry/grid gallery layout with lightbox modal for viewing full-size images.',
    icon: Image,
    color: 'bg-orange-500',
    template_type: 'template_d',
    template_content: {
      galleryImages: [
        { image: '', caption: '' },
        { image: '', caption: '' },
        { image: '', caption: '' },
        { image: '', caption: '' },
        { image: '', caption: '' },
        { image: '', caption: '' },
      ],
      descriptionText: 'Add a description for your gallery...',
    },
    features: ['Gallery Grid', 'Image Captions', 'Modal View', 'Description'],
  },
];

export default function TemplateSelector({ onSelect, onCancel }: TemplateSelectorProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button variant="ghost" onClick={onCancel} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Choose a Template</h1>
        <p className="text-gray-600 mt-2">
          Select one of the templates below to start building your page. Each template has specific fields tailored for different use cases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fixedTemplates.map((template) => {
          const IconComponent = template.icon;
          return (
            <Card
              key={template.id}
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
              onClick={() =>
                onSelect({
                  template_type: template.template_type,
                  template_content: template.template_content,
                })
              }
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${template.color} group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <Button className="w-full" variant="outline">
                  Select This Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
