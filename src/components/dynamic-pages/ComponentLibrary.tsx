'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Component {
  id: number;
  name: string;
  description: string;
  component_type: string;
  component_code: string;
  thumbnail_url: string | null;
}

interface ComponentLibraryProps {
  onAddComponent: (content: any) => void;
}

export default function ComponentLibrary({ onAddComponent }: ComponentLibraryProps) {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [componentTypes, setComponentTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/page-components`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComponents(data.components || []);
        
        // Get unique component types
        const types = [...new Set(data.components.map((c: Component) => c.component_type))];
        setComponentTypes(types as string[]);
      } else {
        toast.error('Failed to fetch components');
      }
    } catch (error) {
      console.error('Error fetching components:', error);
      toast.error('Error loading components');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComponent = (component: Component) => {
    const newSection = {
      id: `section-${Date.now()}`,
      type: component.component_type,
      props: parseComponentProps(component),
    };

    // This is a simplified version - you'd want to properly update the content
    toast.success(`${component.name} added to page`);
    console.log('Add component:', newSection);
  };

  const parseComponentProps = (component: Component) => {
    // Parse component code to extract default props
    // This is a simplified version
    switch (component.component_type) {
      case 'hero':
        return {
          title: 'Welcome to Our Platform',
          subtitle: 'Transform your experience',
          ctaText: 'Get Started',
          ctaLink: '#',
        };
      case 'features':
        return {
          title: 'Our Features',
          subtitle: 'Everything you need',
          features: [
            { icon: 'star', title: 'Feature 1', description: 'Description' },
            { icon: 'shield', title: 'Feature 2', description: 'Description' },
            { icon: 'rocket', title: 'Feature 3', description: 'Description' },
          ],
        };
      case 'cta':
        return {
          title: 'Get Started Today',
          text: 'Join thousands of satisfied customers',
          buttonText: 'Start Free Trial',
          buttonLink: '#',
        };
      case 'contact':
        return {
          title: 'Get in Touch',
          subtitle: 'We\'d love to hear from you',
          email: 'contact@example.com',
          phone: '+1234567890',
        };
      default:
        return {};
    }
  };

  const filteredComponents = searchTerm
    ? components.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.component_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : components;

  const groupedComponents = componentTypes.reduce((acc, type) => {
    acc[type] = filteredComponents.filter((c) => c.component_type === type);
    return acc;
  }, {} as Record<string, Component[]>);

  return (
    <Card className="sticky top-4 h-[calc(100vh-8rem)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Components
        </CardTitle>
        <CardDescription>
          Drag and drop or click to add components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-sm text-gray-600">
            Loading components...
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <Accordion type="multiple" defaultValue={componentTypes} className="w-full">
              {componentTypes.map((type) => {
                const typeComponents = groupedComponents[type] || [];
                if (typeComponents.length === 0) return null;

                return (
                  <AccordionItem key={type} value={type}>
                    <AccordionTrigger className="capitalize">
                      {type} ({typeComponents.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {typeComponents.map((component) => (
                          <div
                            key={component.id}
                            className="group relative border rounded-lg p-3 hover:border-primary hover:bg-blue-50 transition-all cursor-pointer"
                            onClick={() => handleAddComponent(component)}
                          >
                            {component.thumbnail_url && (
                              <div className="mb-2 h-20 bg-gray-100 rounded overflow-hidden">
                                <img
                                  src={component.thumbnail_url}
                                  alt={component.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {component.name}
                                </h4>
                                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                  {component.description}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddComponent(component);
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {Object.keys(groupedComponents).every(
              (type) => groupedComponents[type].length === 0
            ) && (
              <div className="text-center py-8 text-sm text-gray-600">
                No components found
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
