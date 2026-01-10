'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Eye, Layers, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import PageBuilderCanvas from '@/components/dynamic-pages/PageBuilderCanvas';
import TemplateSelector from '@/components/dynamic-pages/TemplateSelector';
import ComponentLibrary from '@/components/dynamic-pages/ComponentLibrary';

interface PageData {
  title: string;
  slug: string;
  template_type: string;
  content: any;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  is_active: boolean;
  show_in_navbar: boolean;
  navbar_position: number;
  navbar_label: string;
}

export default function PageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params?.id as string;
  const isEdit = pageId !== 'new';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(!isEdit);
  const [pageData, setPageData] = useState<PageData>({
    title: '',
    slug: '',
    template_type: 'blank',
    content: { sections: [] },
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_active: false,
    show_in_navbar: false,
    navbar_position: 0,
    navbar_label: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchPage();
    }
  }, [pageId]);

  useEffect(() => {
    // Auto-generate slug from title
    if (!isEdit && pageData.title) {
      const slug = pageData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setPageData((prev) => ({ ...prev, slug, navbar_label: pageData.title }));
    }
  }, [pageData.title, isEdit]);

  const fetchPage = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dynamic-pages/${pageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPageData({
          title: data.page.title,
          slug: data.page.slug,
          template_type: data.page.template_type,
          content: data.page.content || { sections: [] },
          meta_title: data.page.meta_title || '',
          meta_description: data.page.meta_description || '',
          meta_keywords: data.page.meta_keywords || '',
          is_active: data.page.is_active,
          show_in_navbar: data.page.show_in_navbar,
          navbar_position: data.page.navbar_position || 0,
          navbar_label: data.page.navbar_label || data.page.title,
        });
      } else {
        toast.error('Failed to fetch page');
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      toast.error('Error loading page');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!pageData.title || !pageData.slug) {
      toast.error('Title and slug are required');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/dynamic-pages/${pageId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/dynamic-pages`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pageData),
      });

      if (response.ok) {
        toast.success(`Page ${isEdit ? 'updated' : 'created'} successfully`);
        router.push('/dashboard/dynamic-pages');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save page');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Error saving page');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setPageData((prev) => ({
      ...prev,
      template_type: template.template_type,
      content: template.template_content,
    }));
    setShowTemplateSelector(false);
  };

  const handleContentChange = (newContent: any) => {
    setPageData((prev) => ({ ...prev, content: newContent }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (showTemplateSelector) {
    return (
      <TemplateSelector
        onSelect={handleTemplateSelect}
        onCancel={() => {
          if (isEdit) {
            setShowTemplateSelector(false);
          } else {
            router.push('/dashboard/dynamic-pages');
          }
        }}
      />
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/dynamic-pages')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? 'Edit Page' : 'Create New Page'}
            </h1>
            <p className="text-sm text-gray-600">
              {isEdit ? `Editing: ${pageData.title}` : 'Design your page with drag & drop'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowTemplateSelector(true)}
          >
            <Layers className="h-4 w-4 mr-2" />
            Change Template
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Page'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Page Settings */}
        <div className="col-span-3">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Page Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Page Title *</Label>
                <Input
                  id="title"
                  value={pageData.title}
                  onChange={(e) =>
                    setPageData({ ...pageData, title: e.target.value })
                  }
                  placeholder="Enter page title"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={pageData.slug}
                  onChange={(e) =>
                    setPageData({ ...pageData, slug: e.target.value })
                  }
                  placeholder="page-url-slug"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /{pageData.slug}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active
                  </Label>
                  <Switch
                    id="is_active"
                    checked={pageData.is_active}
                    onCheckedChange={(checked) =>
                      setPageData({ ...pageData, is_active: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show_in_navbar" className="cursor-pointer">
                    Show in Navbar
                  </Label>
                  <Switch
                    id="show_in_navbar"
                    checked={pageData.show_in_navbar}
                    onCheckedChange={(checked) =>
                      setPageData({ ...pageData, show_in_navbar: checked })
                    }
                  />
                </div>
              </div>

              {pageData.show_in_navbar && (
                <>
                  <div>
                    <Label htmlFor="navbar_label">Navbar Label</Label>
                    <Input
                      id="navbar_label"
                      value={pageData.navbar_label}
                      onChange={(e) =>
                        setPageData({ ...pageData, navbar_label: e.target.value })
                      }
                      placeholder="Menu label"
                    />
                  </div>

                  <div>
                    <Label htmlFor="navbar_position">Navbar Position</Label>
                    <Input
                      id="navbar_position"
                      type="number"
                      value={pageData.navbar_position}
                      onChange={(e) =>
                        setPageData({
                          ...pageData,
                          navbar_position: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower numbers appear first
                    </p>
                  </div>
                </>
              )}

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">SEO Settings</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={pageData.meta_title}
                      onChange={(e) =>
                        setPageData({ ...pageData, meta_title: e.target.value })
                      }
                      placeholder="SEO title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={pageData.meta_description}
                      onChange={(e) =>
                        setPageData({
                          ...pageData,
                          meta_description: e.target.value,
                        })
                      }
                      placeholder="SEO description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_keywords">Meta Keywords</Label>
                    <Input
                      id="meta_keywords"
                      value={pageData.meta_keywords}
                      onChange={(e) =>
                        setPageData({
                          ...pageData,
                          meta_keywords: e.target.value,
                        })
                      }
                      placeholder="keyword1, keyword2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center - Page Builder Canvas */}
        <div className="col-span-6">
          <PageBuilderCanvas
            content={pageData.content}
            onChange={handleContentChange}
          />
        </div>

        {/* Right Sidebar - Component Library */}
        <div className="col-span-3">
          <ComponentLibrary onAddComponent={handleContentChange} />
        </div>
      </div>
    </div>
  );
}
