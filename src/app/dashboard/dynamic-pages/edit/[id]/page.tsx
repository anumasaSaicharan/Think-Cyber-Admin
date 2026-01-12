'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Upload, Trash2, Plus, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageContainer from '@/components/layout/page-container';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import TemplateSelector from '@/components/dynamic-pages/TemplateSelector';

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
    template_type: '',
    content: {},
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dynamic-pages/${pageId}`
      );

      if (response.ok) {
        const data = await response.json();
        setPageData({
          title: data.page.title,
          slug: data.page.slug,
          template_type: data.page.template_type,
          content: data.page.content || {},
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
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/dynamic-pages/${pageId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/dynamic-pages`;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const updateContent = (path: string[], value: any) => {
    setPageData((prev) => {
      const newContent = JSON.parse(JSON.stringify(prev.content));
      let current: any = newContent;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return { ...prev, content: newContent };
    });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/image`,
        { method: 'POST', body: formData }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success('Image uploaded successfully');
        return data.data?.url || data.url;
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to upload image');
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
      return null;
    }
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

  const templateNames: Record<string, string> = {
    template_a: 'Template A – Image ↔ Content Split',
    template_b: 'Template B – Clients Page + Blank Section',
    template_c: 'Template C – Banner Carousel + Content',
    template_d: 'Template D – Visual / Gallery Page',
  };

  return (
    <PageContainer scrollable>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/dynamic-pages')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEdit ? 'Edit Page' : 'Create New Page'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {templateNames[pageData.template_type] || pageData.template_type}
                </p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-primary">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Page'}
            </Button>
          </div>

          {/* Page Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t">
            <div>
              <Label htmlFor="title">Page Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={pageData.title}
                onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                placeholder="Enter page title"
              />
            </div>
            <div>
              <Label htmlFor="slug">URL Slug <span className="text-red-500">*</span></Label>
              <Input
                id="slug"
                value={pageData.slug}
                onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
                placeholder="page-url-slug"
              />
              <p className="text-xs text-gray-500 mt-1">URL: /{pageData.slug || 'your-page-slug'}</p>
            </div>
            <div className="flex items-center gap-6 pt-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={pageData.is_active}
                  onCheckedChange={(checked) => setPageData({ ...pageData, is_active: checked })}
                />
                <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show_in_navbar"
                  checked={pageData.show_in_navbar}
                  onCheckedChange={(checked) => setPageData({ ...pageData, show_in_navbar: checked })}
                />
                <Label htmlFor="show_in_navbar" className="cursor-pointer">Show in Navbar</Label>
              </div>
            </div>
          </div>

          {pageData.show_in_navbar && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t mt-4">
              <div>
                <Label htmlFor="navbar_label">Navbar Label</Label>
                <Input
                  id="navbar_label"
                  value={pageData.navbar_label}
                  onChange={(e) => setPageData({ ...pageData, navbar_label: e.target.value })}
                  placeholder="Menu label"
                />
              </div>
              <div>
                <Label htmlFor="navbar_position">Navbar Position</Label>
                <Input
                  id="navbar_position"
                  type="number"
                  value={pageData.navbar_position}
                  onChange={(e) => setPageData({ ...pageData, navbar_position: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Template Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Page Content</CardTitle>
            <CardDescription>Edit the content for your page</CardDescription>
          </CardHeader>
          <CardContent>
            {pageData.template_type === 'template_a' && (
              <TemplateAEditor content={pageData.content} updateContent={updateContent} uploadImage={uploadImage} />
            )}
            {pageData.template_type === 'template_b' && (
              <TemplateBEditor content={pageData.content} updateContent={updateContent} uploadImage={uploadImage} />
            )}
            {pageData.template_type === 'template_c' && (
              <TemplateCEditor content={pageData.content} updateContent={updateContent} uploadImage={uploadImage} />
            )}
            {pageData.template_type === 'template_d' && (
              <TemplateDEditor content={pageData.content} updateContent={updateContent} uploadImage={uploadImage} />
            )}
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Optimize your page for search engines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={pageData.meta_title}
                onChange={(e) => setPageData({ ...pageData, meta_title: e.target.value })}
                placeholder="SEO title"
              />
            </div>
            <div>
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={pageData.meta_description}
                onChange={(e) => setPageData({ ...pageData, meta_description: e.target.value })}
                placeholder="Brief description for search engines"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="meta_keywords">Meta Keywords</Label>
              <Input
                id="meta_keywords"
                value={pageData.meta_keywords}
                onChange={(e) => setPageData({ ...pageData, meta_keywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

// ==================== TEMPLATE A EDITOR ====================
function TemplateAEditor({
  content,
  updateContent,
  uploadImage,
}: {
  content: any;
  updateContent: (path: string[], value: any) => void;
  uploadImage: (file: File) => Promise<string | null>;
}) {
  const imageRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize rows if not present
  const rows = content.rows || [];

  const addRow = () => {
    const newRow = {
      id: Date.now(),
      layoutDirection: 'IMAGE_LEFT',
      heading: '',
      headingColor: '#000000',
      subheading: '',
      subheadingColor: '#666666',
      image: '',
      content: '',
      bulletPoints: [],
      ctaText: '',
      ctaLink: '',
    };
    updateContent(['rows'], [...rows, newRow]);
  };

  const removeRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    updateContent(['rows'], newRows);
  };

  const updateRow = (index: number, field: string, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    updateContent(['rows'], newRows);
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadImage(file);
      if (url) updateRow(index, 'image', url);
    }
  };

  const addBulletPoint = (rowIndex: number) => {
    const bullets = rows[rowIndex]?.bulletPoints || [];
    updateRow(rowIndex, 'bulletPoints', [...bullets, '']);
  };

  const removeBulletPoint = (rowIndex: number, bulletIndex: number) => {
    const bullets = [...(rows[rowIndex]?.bulletPoints || [])];
    bullets.splice(bulletIndex, 1);
    updateRow(rowIndex, 'bulletPoints', bullets);
  };

  const updateBulletPoint = (rowIndex: number, bulletIndex: number, value: string) => {
    const bullets = [...(rows[rowIndex]?.bulletPoints || [])];
    bullets[bulletIndex] = value;
    updateRow(rowIndex, 'bulletPoints', bullets);
  };

  return (
    <div className="space-y-6">
      {/* Add Row Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Content Rows</h3>
          <p className="text-sm text-gray-500">Add multiple image-content sections to your page</p>
        </div>
        <Button onClick={addRow}>
          <Plus className="h-4 w-4 mr-2" /> Add Row
        </Button>
      </div>

      {rows.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-4">No content rows yet. Click "Add Row" to get started.</p>
          <Button variant="outline" onClick={addRow}>
            <Plus className="h-4 w-4 mr-2" /> Add Your First Row
          </Button>
        </div>
      )}

      {/* Rows */}
      {rows.map((row: any, rowIndex: number) => (
        <div key={row.id || rowIndex} className="border rounded-lg overflow-hidden bg-white shadow-sm">
          {/* Row Header */}
          <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b">
            <span className="font-medium">Row {rowIndex + 1}</span>
            <div className="flex items-center gap-3">
              {/* Layout Direction Dropdown */}
              <Select
                value={row.layoutDirection || 'IMAGE_LEFT'}
                onValueChange={(value) => updateRow(rowIndex, 'layoutDirection', value)}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMAGE_LEFT">📷 Image Left | Content Right</SelectItem>
                  <SelectItem value="IMAGE_RIGHT">Content Left | Image Right 📷</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeRow(rowIndex)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Heading & Subheading with Color Pickers */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label>Heading</Label>
                  <Input
                    value={row.heading || ''}
                    onChange={(e) => updateRow(rowIndex, 'heading', e.target.value)}
                    placeholder="Main heading text"
                    style={{ color: row.headingColor || '#000000' }}
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <input
                    type="color"
                    value={row.headingColor || '#000000'}
                    onChange={(e) => updateRow(rowIndex, 'headingColor', e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label>Subheading</Label>
                  <Input
                    value={row.subheading || ''}
                    onChange={(e) => updateRow(rowIndex, 'subheading', e.target.value)}
                    placeholder="Subheading text"
                    style={{ color: row.subheadingColor || '#666666' }}
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <input
                    type="color"
                    value={row.subheadingColor || '#666666'}
                    onChange={(e) => updateRow(rowIndex, 'subheadingColor', e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Two Equal Cards - Image and Content */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${row.layoutDirection === 'IMAGE_RIGHT' ? 'lg:flex-row-reverse' : ''}`}>
            {/* Image Card */}
            <div className={`p-6 border-b lg:border-b-0 ${row.layoutDirection === 'IMAGE_RIGHT' ? 'lg:order-2 lg:border-l' : 'lg:border-r'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-700">📷 Image</h4>
                {row.image && (
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => updateRow(rowIndex, 'image', '')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {row.image ? (
                <div className="relative">
                  <img 
                    src={row.image} 
                    alt="Uploaded" 
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button 
                      variant="secondary" 
                      onClick={() => imageRefs.current[rowIndex]?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" /> Replace Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => imageRefs.current[rowIndex]?.click()}
                >
                  <Upload className="h-10 w-10 text-gray-400 mb-3" />
                  <span className="text-gray-500 font-medium">Click to upload image</span>
                  <span className="text-gray-400 text-sm mt-1">PNG, JPG, GIF up to 10MB</span>
                </div>
              )}
              <input
                ref={(el) => { imageRefs.current[rowIndex] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(rowIndex, e)}
              />
            </div>

            {/* Content Card */}
            <div className={`p-6 ${row.layoutDirection === 'IMAGE_RIGHT' ? 'lg:order-1' : ''}`}>
              <h4 className="font-medium text-gray-700 mb-4">📝 Content</h4>
              
              <div className="space-y-4">
                {/* Rich Text Content */}
                <div>
                  <Label>Body Text</Label>
                  <Textarea
                    value={row.content || ''}
                    onChange={(e) => updateRow(rowIndex, 'content', e.target.value)}
                    placeholder="Enter your content here..."
                    rows={4}
                  />
                </div>

                {/* Bullet Points */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Bullet Points</Label>
                    <Button variant="ghost" size="sm" onClick={() => addBulletPoint(rowIndex)}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(row.bulletPoints || []).map((bullet: string, bulletIndex: number) => (
                      <div key={bulletIndex} className="flex items-center gap-2">
                        <span className="text-blue-500">•</span>
                        <Input
                          value={bullet}
                          onChange={(e) => updateBulletPoint(rowIndex, bulletIndex, e.target.value)}
                          placeholder="Bullet point text"
                          className="flex-1"
                        />
                        <Button variant="ghost" size="sm" onClick={() => removeBulletPoint(rowIndex, bulletIndex)} className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div>
                    <Label>CTA Button Text</Label>
                    <Input
                      value={row.ctaText || ''}
                      onChange={(e) => updateRow(rowIndex, 'ctaText', e.target.value)}
                      placeholder="Learn More"
                    />
                  </div>
                  <div>
                    <Label>CTA Link</Label>
                    <Input
                      value={row.ctaLink || ''}
                      onChange={(e) => updateRow(rowIndex, 'ctaLink', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {rows.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={addRow}>
            <Plus className="h-4 w-4 mr-2" /> Add Another Row
          </Button>
        </div>
      )}
    </div>
  );
}

// ==================== TEMPLATE B EDITOR ====================
function TemplateBEditor({
  content,
  updateContent,
  uploadImage,
}: {
  content: any;
  updateContent: (path: string[], value: any) => void;
  uploadImage: (file: File) => Promise<string | null>;
}) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addClient = () => {
    const clients = content.clients || [];
    updateContent(['clients'], [...clients, { name: '', logo: '', websiteUrl: '' }]);
  };

  const removeClient = (index: number) => {
    const clients = [...(content.clients || [])];
    clients.splice(index, 1);
    updateContent(['clients'], clients);
  };

  const updateClient = (index: number, field: string, value: string) => {
    const clients = [...(content.clients || [])];
    clients[index] = { ...clients[index], [field]: value };
    updateContent(['clients'], clients);
  };

  const handleLogoUpload = async (index: number, file: File) => {
    const url = await uploadImage(file);
    if (url) updateClient(index, 'logo', url);
  };

  return (
    <div className="space-y-6">
      {/* Clients */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Clients</h3>
          <Button variant="outline" size="sm" onClick={addClient}>
            <Plus className="h-4 w-4 mr-2" /> Add Client
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(content.clients || []).map((client: any, index: number) => (
            <div key={index} className="p-4 bg-white rounded-lg border">
              <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                {client.logo ? (
                  <img src={client.logo} alt={client.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-gray-400 text-sm">No logo</span>
                )}
              </div>
              <input
                ref={(el) => { fileInputRefs.current[index] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(index, file);
                }}
              />
              <div className="flex gap-2 mb-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => fileInputRefs.current[index]?.click()}>
                  <Upload className="h-4 w-4 mr-2" /> Logo
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeClient(index)} className="text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Input
                  value={client.name || ''}
                  onChange={(e) => updateClient(index, 'name', e.target.value)}
                  placeholder="Client name"
                />
                <Input
                  value={client.websiteUrl || ''}
                  onChange={(e) => updateClient(index, 'websiteUrl', e.target.value)}
                  placeholder="Website URL (optional)"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blank Section */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Blank Section</h3>
        <div>
          <Label>Rich Text Content</Label>
          <Textarea
            value={content.blankSection?.richText || ''}
            onChange={(e) => updateContent(['blankSection', 'richText'], e.target.value)}
            placeholder="Add any additional content..."
            rows={8}
          />
        </div>
      </div>
    </div>
  );
}

// ==================== TEMPLATE C EDITOR ====================
function TemplateCEditor({
  content,
  updateContent,
  uploadImage,
}: {
  content: any;
  updateContent: (path: string[], value: any) => void;
  uploadImage: (file: File) => Promise<string | null>;
}) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addBanner = () => {
    const banners = content.banners || [];
    updateContent(['banners'], [...banners, { image: '', caption: '' }]);
  };

  const removeBanner = (index: number) => {
    const banners = [...(content.banners || [])];
    banners.splice(index, 1);
    updateContent(['banners'], banners);
  };

  const updateBanner = (index: number, field: string, value: string) => {
    const banners = [...(content.banners || [])];
    banners[index] = { ...banners[index], [field]: value };
    updateContent(['banners'], banners);
  };

  const handleBannerUpload = async (index: number, file: File) => {
    const url = await uploadImage(file);
    if (url) updateBanner(index, 'image', url);
  };

  return (
    <div className="space-y-6">
      {/* Banner Upload Guidelines */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Banner Image Guidelines:</strong> Recommended size 1920 × 600 px | Aspect Ratio 16:5 | Max 2 MB | Formats: JPG, PNG, WebP
        </AlertDescription>
      </Alert>

      {/* Banners */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Banner Images (Carousel)</h3>
          <Button variant="outline" size="sm" onClick={addBanner}>
            <Plus className="h-4 w-4 mr-2" /> Add Banner
          </Button>
        </div>
        <div className="space-y-4">
          {(content.banners || []).map((banner: any, index: number) => (
            <div key={index} className="p-4 bg-white rounded-lg border">
              <div className="flex gap-4">
                <div className="w-64 h-20 bg-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                  {banner.image ? (
                    <img src={banner.image} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-sm">No image</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={(el) => { fileInputRefs.current[index] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBannerUpload(index, file);
                    }}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => fileInputRefs.current[index]?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Upload
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeBanner(index)} className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={banner.caption || ''}
                    onChange={(e) => updateBanner(index, 'caption', e.target.value)}
                    placeholder="Banner caption text"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Text */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Content Text</h3>
        <Textarea
          value={content.contentText || ''}
          onChange={(e) => updateContent(['contentText'], e.target.value)}
          placeholder="Add content text below the banner..."
          rows={6}
        />
      </div>
    </div>
  );
}

// ==================== TEMPLATE D EDITOR ====================
function TemplateDEditor({
  content,
  updateContent,
  uploadImage,
}: {
  content: any;
  updateContent: (path: string[], value: any) => void;
  uploadImage: (file: File) => Promise<string | null>;
}) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addGalleryImage = () => {
    const images = content.galleryImages || [];
    updateContent(['galleryImages'], [...images, { image: '', caption: '' }]);
  };

  const removeGalleryImage = (index: number) => {
    const images = [...(content.galleryImages || [])];
    images.splice(index, 1);
    updateContent(['galleryImages'], images);
  };

  const updateGalleryImage = (index: number, field: string, value: string) => {
    const images = [...(content.galleryImages || [])];
    images[index] = { ...images[index], [field]: value };
    updateContent(['galleryImages'], images);
  };

  const handleImageUpload = async (index: number, file: File) => {
    const url = await uploadImage(file);
    if (url) updateGalleryImage(index, 'image', url);
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Gallery Description</h3>
        <Textarea
          value={content.descriptionText || ''}
          onChange={(e) => updateContent(['descriptionText'], e.target.value)}
          placeholder="Add a description for your gallery..."
          rows={4}
        />
      </div>

      {/* Gallery Images */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Gallery Images</h3>
          <Button variant="outline" size="sm" onClick={addGalleryImage}>
            <Plus className="h-4 w-4 mr-2" /> Add Image
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(content.galleryImages || []).map((item: any, index: number) => (
            <div key={index} className="p-3 bg-white rounded-lg border">
              <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.caption || `Image ${index + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs">No image</span>
                )}
              </div>
              <input
                ref={(el) => { fileInputRefs.current[index] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(index, file);
                }}
              />
              <div className="flex gap-1 mb-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => fileInputRefs.current[index]?.click()}>
                  <Upload className="h-3 w-3 mr-1" /> Upload
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeGalleryImage(index)} className="text-red-500 px-2">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Input
                value={item.caption || ''}
                onChange={(e) => updateGalleryImage(index, 'caption', e.target.value)}
                placeholder="Caption"
                className="text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
