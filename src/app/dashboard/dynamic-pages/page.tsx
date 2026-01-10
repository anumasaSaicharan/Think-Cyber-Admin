'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DynamicPage {
  id: number;
  title: string;
  slug: string;
  template_type: string;
  is_active: boolean;
  show_in_navbar: boolean;
  navbar_label: string;
  navbar_position: number;
  created_at: string;
  updated_at: string;
  creator_name?: string;
}

export default function DynamicPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<DynamicPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPages, setFilteredPages] = useState<DynamicPage[]>([]);

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = pages.filter(
        (page) =>
          page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPages(filtered);
    } else {
      setFilteredPages(pages);
    }
  }, [searchTerm, pages]);

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dynamic-pages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPages(data.pages || []);
      } else {
        toast.error('Failed to fetch dynamic pages');
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Error loading pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dynamic-pages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  const toggleActive = async (page: DynamicPage) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dynamic-pages/${page.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_active: !page.is_active,
        }),
      });

      if (response.ok) {
        toast.success(`Page ${!page.is_active ? 'activated' : 'deactivated'}`);
        fetchPages();
      } else {
        toast.error('Failed to update page status');
      }
    } catch (error) {
      console.error('Error updating page:', error);
      toast.error('Error updating page status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Dynamic Pages</CardTitle>
              <CardDescription>
                Manage dynamic pages that appear in your client application
              </CardDescription>
            </div>
            <Button
              onClick={() => router.push('/dashboard/dynamic-pages/new')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Page
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search pages by title or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredPages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pages found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first page'}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/dashboard/dynamic-pages/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Page
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Navbar</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          /{page.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{page.template_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={page.is_active ? 'default' : 'secondary'}>
                          {page.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {page.show_in_navbar ? (
                          <Badge variant="default">Visible</Badge>
                        ) : (
                          <Badge variant="secondary">Hidden</Badge>
                        )}
                      </TableCell>
                      <TableCell>{page.navbar_position}</TableCell>
                      <TableCell>{page.creator_name || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(page)}
                            title={page.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {page.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/dynamic-pages/edit/${page.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(page.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
