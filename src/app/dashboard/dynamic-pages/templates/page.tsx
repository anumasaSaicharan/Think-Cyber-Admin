'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Eye, Layout, Users, Image, Layers, Plus } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Fixed template definitions
const templateDefinitions = [
  {
    id: 'template_a',
    name: 'Template A – Image ↔ Content Split',
    description: 'Single template with layout direction toggle. Image on one side, content on the other.',
    icon: Layout,
    color: 'bg-blue-500',
    features: ['Layout Direction Toggle', 'Hero Image', 'Rich Text', 'Bullet Points', 'CTA Button'],
  },
  {
    id: 'template_b',
    name: 'Template B – Clients Page + Blank Section',
    description: 'Used for clients showcase with logo grid and a customizable blank section.',
    icon: Users,
    color: 'bg-green-500',
    features: ['Client Logos Grid', 'Client URLs', 'Rich Text Section'],
  },
  {
    id: 'template_c',
    name: 'Template C – Banner Carousel + Content',
    description: 'Auto-playing banner carousel with captions and content text below.',
    icon: Layers,
    color: 'bg-purple-500',
    features: ['Multiple Banners', 'Image Captions', 'Auto-play Carousel', 'Content Section'],
  },
  {
    id: 'template_d',
    name: 'Template D – Visual / Gallery Page',
    description: 'Masonry/grid gallery layout with image modal and captions.',
    icon: Image,
    color: 'bg-orange-500',
    features: ['Gallery Grid', 'Image Captions', 'Modal View', 'Description Text'],
  },
];

// Template Preview Components
function TemplatePreview({ templateId }: { templateId: string }) {
  const baseClasses = "relative bg-white rounded-lg border overflow-hidden";
  const watermarkClasses = "absolute inset-0 flex items-center justify-center pointer-events-none";
  const watermarkText = "absolute text-4xl font-bold text-gray-100 transform -rotate-12 select-none";

  if (templateId === 'template_a') {
    return (
      <div className={`${baseClasses} h-40`}>
        <div className={watermarkClasses}>
          <span className={watermarkText}>PREVIEW</span>
        </div>
        <div className="relative z-10 h-full flex">
          {/* Image Side */}
          <div className="w-2/5 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <div className="w-16 h-12 bg-blue-300 rounded flex items-center justify-center">
              <Image className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          {/* Content Side */}
          <div className="w-3/5 p-3 flex flex-col justify-center">
            <div className="h-2 w-3/4 bg-gray-300 rounded mb-2"></div>
            <div className="h-1.5 w-full bg-gray-200 rounded mb-1"></div>
            <div className="h-1.5 w-5/6 bg-gray-200 rounded mb-2"></div>
            <div className="space-y-1 mb-2">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                <div className="h-1 w-2/3 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                <div className="h-1 w-1/2 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="h-4 w-16 bg-blue-400 rounded text-[6px] text-white flex items-center justify-center">
              CTA Button
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (templateId === 'template_b') {
    return (
      <div className={`${baseClasses} h-40`}>
        <div className={watermarkClasses}>
          <span className={watermarkText}>PREVIEW</span>
        </div>
        <div className="relative z-10 h-full p-3">
          {/* Client Logos Grid */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-green-50 to-green-100 rounded border border-green-200 flex items-center justify-center">
                <div className="w-4 h-4 bg-green-200 rounded"></div>
              </div>
            ))}
          </div>
          {/* Blank Section */}
          <div className="border-t border-dashed pt-2">
            <div className="h-1.5 w-1/3 bg-gray-300 rounded mb-1"></div>
            <div className="h-1 w-full bg-gray-200 rounded mb-0.5"></div>
            <div className="h-1 w-4/5 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (templateId === 'template_c') {
    return (
      <div className={`${baseClasses} h-40`}>
        <div className={watermarkClasses}>
          <span className={watermarkText}>PREVIEW</span>
        </div>
        <div className="relative z-10 h-full flex flex-col">
          {/* Banner Carousel */}
          <div className="h-20 bg-gradient-to-r from-purple-200 via-purple-100 to-purple-200 flex items-center justify-center relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white/50 rounded-full flex items-center justify-center text-[8px]">‹</div>
            <div className="text-center">
              <Layers className="h-6 w-6 text-purple-400 mx-auto mb-1" />
              <div className="text-[8px] text-purple-600">Banner Caption</div>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white/50 rounded-full flex items-center justify-center text-[8px]">›</div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
            </div>
          </div>
          {/* Content Section */}
          <div className="flex-1 p-3">
            <div className="h-1.5 w-1/4 bg-gray-300 rounded mb-2"></div>
            <div className="h-1 w-full bg-gray-200 rounded mb-0.5"></div>
            <div className="h-1 w-5/6 bg-gray-200 rounded mb-0.5"></div>
            <div className="h-1 w-3/4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (templateId === 'template_d') {
    return (
      <div className={`${baseClasses} h-40`}>
        <div className={watermarkClasses}>
          <span className={watermarkText}>PREVIEW</span>
        </div>
        <div className="relative z-10 h-full p-3">
          {/* Description */}
          <div className="mb-2">
            <div className="h-1.5 w-1/3 bg-gray-300 rounded mb-1"></div>
            <div className="h-1 w-2/3 bg-gray-200 rounded"></div>
          </div>
          {/* Gallery Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className={`bg-gradient-to-br from-orange-50 to-orange-100 rounded border border-orange-200 flex items-center justify-center ${i % 3 === 0 ? 'row-span-2 aspect-[1/2]' : 'aspect-square'}`}>
                <Image className="h-3 w-3 text-orange-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

interface DynamicPage {
  id: number;
  title: string;
  slug: string;
  template_type: string;
  is_active: boolean;
  created_at: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<DynamicPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiUrl) {
        console.warn('API URL not configured');
        setLoading(false);
        return;
      }
      const response = await fetch(`${apiUrl}/dynamic-pages`);
      if (response.ok) {
        const data = await response.json();
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePage = async (pageId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dynamic-pages/${pageId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        toast.success('Page deleted successfully');
        fetchPages();
      } else {
        toast.error('Failed to delete page');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Error deleting page');
    }
  };

  const getPagesByTemplate = (templateId: string) => {
    return pages.filter((page) => page.template_type === templateId);
  };

  return (
    <PageContainer scrollable>
      <div className="space-y-6">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Page Templates</h1>
            <p className="text-muted-foreground mt-1">
              View all available templates and manage pages created with each template.
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/dynamic-pages/edit/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Page
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {templateDefinitions.map((template) => {
            const IconComponent = template.icon;
            const templatePages = getPagesByTemplate(template.id);

            return (
              <Card key={template.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${template.color}`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {template.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Template Preview */}
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Preview:</p>
                    <TemplatePreview templateId={template.id} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm text-gray-700">
                        Pages using this template ({templatePages.length})
                      </h4>
                      <Button
                        size="sm"
                        onClick={() => router.push('/dashboard/dynamic-pages/edit/new')}
                      >
                        Create Page
                      </Button>
                    </div>

                    {loading ? (
                      <p className="text-sm text-gray-500">Loading...</p>
                    ) : templatePages.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        No pages created with this template yet.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {templatePages.map((page) => (
                          <div
                            key={page.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{page.title}</p>
                              <p className="text-xs text-gray-500">/{page.slug}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <Badge variant={page.is_active ? 'default' : 'secondary'}>
                                {page.is_active ? 'Active' : 'Draft'}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(`/dashboard/dynamic-pages/edit/${page.id}`)
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Page</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete &quot;{page.title}&quot;? This action
                                      cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeletePage(page.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
