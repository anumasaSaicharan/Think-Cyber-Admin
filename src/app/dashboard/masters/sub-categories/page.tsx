'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  Loader2,
  RefreshCw,
  Layers
} from 'lucide-react';
import { SubCategoryModal } from '@/components/modal/subcategory-modal';
import { DeleteSubCategoryModal } from '@/components/modal/delete-subcategory-modal';
import { toast } from '@/lib/toast';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  topicsCount: number;
  displayOrder: number;
  status: 'Active' | 'Draft' | 'Inactive';
  createdAt: string;
  updatedAt?: string;
}

interface Stats {
  total: number;
  active: number;
  draft: number;
  inactive: number;
  totalTopics: number;
  averageTopicsPerSubCategory: string;
  categoriesUsed: number;
}

export default function SubCategoriesPage() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    draft: 0,
    inactive: 0,
    totalTopics: 0,
    averageTopicsPerSubCategory: '0',
    categoriesUsed: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategory | null>(null);
  const [subCategoryToDelete, setSubCategoryToDelete] =
    useState<SubCategory | null>(null);

  // Fetch sub-categories from API
  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.categoryId = categoryFilter;

      const result = await apiService.get(API_ENDPOINTS.SUBCATEGORIES.BASE, {
        params
      });

      if (result.success && result.data) {

        // Helper to find category name (requires categories to be loaded or derived from somewhere else)
        // Since we fetch categories independently, we can use that state if available, 
        // OR we can rely on the fact that we need to lookup.
        // Issue: categories state might not be set when this runs.
        // Ideally we should process this when both are ready? 
        // For now, simpler map and allow categoryName to be populated dynamically or 
        // if the API returns category_id, map it.

        const mappedSubCategories = result.data.map((sub: any) => ({
          ...sub,
          categoryId: sub.category_id,
          topicsCount: sub.topics_count,
          displayOrder: sub.display_order,
          createdAt: sub.created_at,
          updatedAt: sub.updated_at,
          categoryName: categories.find(c => c.id === sub.category_id)?.name || 'Unknown'
        }));

        setSubCategories(mappedSubCategories as SubCategory[]);

        // Handle stats and categories from API response
        const apiResult = result as any;
        const statsData = apiResult.stats || {
          total: 0,
          active: 0,
          draft: 0,
          inactive: 0,
          totalTopics: 0,
          averageTopicsPerSubcategory: '0',
          categoriesUsed: 0
        };

        // Map the API response field name to our interface
        setStats({
          total: statsData.total,
          active: statsData.active,
          draft: statsData.draft,
          inactive: statsData.inactive,
          totalTopics: statsData.totalTopics,
          averageTopicsPerSubCategory:
            statsData.averageTopicsPerSubcategory || '0',
          categoriesUsed: statsData.categoriesUsed
        });


      } else {
        toast.error('Failed to fetch sub-categories. Please try again.');
        console.error('Failed to fetch sub-categories:', result.error);
      }
    } catch (error) {
      toast.error('Network error. Please check your connection.');
      console.error('Error fetching sub-categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const result = await apiService.get(API_ENDPOINTS.CATEGORIES.BASE);
      if (result.success && result.data) {
        setCategories(result.data as Category[]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Create or update sub-category
  const handleSaveSubCategory = async (
    subCategoryData: Omit<
      SubCategory,
      'id' | 'categoryName' | 'topicsCount' | 'createdAt' | 'updatedAt'
    >
  ) => {
    try {
      if (selectedSubCategory) {
        // Update existing sub-category
        // Update existing sub-category
        const apiPayload = {
          ...subCategoryData,
          category_id: subCategoryData.categoryId,
          display_order: subCategoryData.displayOrder
        };

        const result = await apiService.put(
          API_ENDPOINTS.SUBCATEGORIES.BY_ID(selectedSubCategory.id),
          apiPayload
        );

        if (result.success) {
          await fetchSubCategories(); // Refresh the list
          setIsEditModalOpen(false);
          setSelectedSubCategory(null);
          toast.success('Sub-category updated successfully');
        } else {
          toast.error(result.error || 'Failed to update sub-category');
          throw new Error(result.error);
        }
      } else {
        // Create new sub-category
        // Create new sub-category
        const apiPayload = {
          ...subCategoryData,
          category_id: subCategoryData.categoryId,
          display_order: subCategoryData.displayOrder
        };

        const result = await apiService.post(
          API_ENDPOINTS.SUBCATEGORIES.BASE,
          apiPayload
        );

        if (result.success) {
          await fetchSubCategories(); // Refresh the list
          setIsAddModalOpen(false);
          toast.success('Sub-category created successfully');
        } else {
          toast.error(result.error || 'Failed to create sub-category');
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error('Error saving sub-category:', error);
      throw error; // Re-throw to handle in modal
    }
  };

  // Delete sub-category
  const handleDeleteSubCategory = async () => {
    if (!subCategoryToDelete) return;

    try {
      const result = await apiService.delete(
        API_ENDPOINTS.SUBCATEGORIES.BY_ID(subCategoryToDelete.id)
      );

      if (result.success) {
        await fetchSubCategories(); // Refresh the list
        setIsDeleteModalOpen(false);
        setSubCategoryToDelete(null);
        toast.success('Sub-category deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete sub-category');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting sub-category:', error);
      throw error; // Re-throw to handle in modal
    }
  };

  // Handle edit button click
  const handleEditClick = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setIsEditModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (subCategory: SubCategory) => {
    setSubCategoryToDelete(subCategory);
    setIsDeleteModalOpen(true);
  };

  // Load sub-categories on component mount and when filters change
  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchSubCategories();
      },
      searchTerm ? 300 : 0
    ); // Debounce search, no delay for initial load

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, categoryFilter]);

  // Initial load of categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageContainer>
      <div className='space-y-4'>
        <Breadcrumbs />

        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Sub-Categories Management
            </h1>
            <p className='text-muted-foreground'>
              Manage sub-categories within main categories for better
              organization
            </p>
          </div>
          <div className='flex space-x-2'>
            <Button
              variant='outline'
              onClick={fetchSubCategories}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Add Sub-Category
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Sub-Categories
              </CardTitle>
              <Layers className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {loading ? '-' : stats.total}
              </div>
              <p className='text-muted-foreground text-xs'>
                Across {stats.categoriesUsed} categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Sub-Categories
              </CardTitle>
              <Layers className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {loading ? '-' : stats.active}
              </div>
              <p className='text-muted-foreground text-xs'>
                {loading || stats.total === 0
                  ? '-'
                  : Math.round((stats.active / stats.total) * 100)}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Topics
              </CardTitle>
              <Layers className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {loading ? '-' : stats.totalTopics}
              </div>
              <p className='text-muted-foreground text-xs'>
                In all sub-categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Avg Topics/Sub-Category
              </CardTitle>
              <Layers className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {loading ? '-' : stats.averageTopicsPerSubCategory}
              </div>
              <p className='text-muted-foreground text-xs'>Well organized</p>
            </CardContent>
          </Card>
        </div>

        {/* Sub-Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>All Sub-Categories</CardTitle>
            <CardDescription>
              Manage and organize your topic sub-categories
            </CardDescription>
            <div className='flex flex-col gap-4 sm:flex-row'>
              <div className='relative max-w-sm flex-1'>
                <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
                <Input
                  placeholder='Search sub-categories...'
                  className='pl-8'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className='flex gap-2'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-40'>
                    <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='Active'>Active</SelectItem>
                    <SelectItem value='Draft'>Draft</SelectItem>
                    <SelectItem value='Inactive'>Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className='w-48'>
                    <SelectValue placeholder='Filter by category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
                <span className='text-muted-foreground ml-2'>
                  Loading sub-categories...
                </span>
              </div>
            ) : subCategories.length === 0 ? (
              <div className='py-8 text-center'>
                <Layers className='text-muted-foreground mx-auto h-12 w-12' />
                <p className='text-muted-foreground mt-2'>
                  {searchTerm ||
                    statusFilter !== 'all' ||
                    categoryFilter !== 'all'
                    ? 'No sub-categories found matching your filters.'
                    : 'No sub-categories found. Create your first sub-category!'}
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {subCategories.map((subCategory) => (
                  <div
                    key={subCategory.id}
                    className='flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent'
                  >
                    <div className='flex items-center space-x-4'>
                      <div className='rounded-lg bg-purple-100 p-2'>
                        <Layers className='h-6 w-6 text-purple-600' />
                      </div>
                      <div>
                        <p className='font-medium'>{subCategory.name}</p>
                        <p className='text-muted-foreground text-sm'>
                          {subCategory.description}
                        </p>
                        <div className='mt-1 flex items-center gap-2'>
                          <p className='text-muted-foreground text-xs'>
                            Category: {categories.find(c => c.id === subCategory.categoryId)?.name || subCategory.categoryName || 'Loading...'}
                          </p>
                          <span className='text-muted-foreground text-xs'>
                            •
                          </span>
                          <p className='text-muted-foreground text-xs'>
                            Created: {subCategory.createdAt ? new Date(subCategory.createdAt).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-right'>
                        <p className='text-sm font-medium'>
                          {subCategory.topicsCount} topics
                        </p>
                        <Badge className={getStatusColor(subCategory.status)}>
                          {subCategory.status}
                        </Badge>
                      </div>
                      <div className='flex space-x-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEditClick(subCategory)}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDeleteClick(subCategory)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <SubCategoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveSubCategory}
          subCategory={null}
          categories={categories}
        />

        <SubCategoryModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSubCategory(null);
          }}
          onSave={handleSaveSubCategory}
          subCategory={selectedSubCategory}
          categories={categories}
        />

        <DeleteSubCategoryModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSubCategoryToDelete(null);
          }}
          onConfirm={handleDeleteSubCategory}
          subCategoryName={subCategoryToDelete?.name || ''}
          parentCategoryName={subCategoryToDelete?.categoryName || ''}
          topicsCount={subCategoryToDelete?.topicsCount || 0}
        />
      </div>
    </PageContainer>
  );
}
