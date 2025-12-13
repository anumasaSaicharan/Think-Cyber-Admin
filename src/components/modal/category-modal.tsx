'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Loader2 } from 'lucide-react';

interface Category {
  id?: number;
  name: string;
  description: string;
  price: number;
  displayOrder: number;
  status: 'Active' | 'Draft' | 'Inactive';
}


interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => Promise<void>;
  category?: Category | null;
  loading?: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  loading = false
}) => {
  const [formData, setFormData] = useState<Category>({
    name: '',
    description: '',
    price: 0,
    displayOrder: 0,
    status: 'Active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        // Edit mode
        setFormData({
          id: category.id,
          name: category.name || '',
          description: category.description || '',
          price: category.price || 0,
          displayOrder: category.displayOrder || 0,
          status: category.status || 'Active',
        });
      } else {
        // Add mode
        setFormData({
          name: '',
          description: '',
          price: 0,
          displayOrder: 0,
          status: 'Active',
        });
      }

      setErrors({});
    }
  }, [isOpen, category]);


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Category name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (formData.displayOrder < 0 || !Number.isInteger(Number(formData.displayOrder))) {
      newErrors.displayOrder = 'Display order must be a non-negative integer';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof Category, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      // You can add toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal
      title={category ? 'Edit Category' : 'Add New Category'}
      description={category ? 'Update the category information below.' : 'Create a new category to organize your topics.'}
      isOpen={isOpen}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Name */}
        <div className="space-y-2">
          <Label htmlFor="category-name">Category Name *</Label>
          <Input
            id="category-name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter category name"
            className={errors.name ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="category-description">Description *</Label>
          <Textarea
            id="category-description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter category description"
            className={`min-h-[80px] ${errors.description ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="category-price">Price ₹ *</Label>
          <Input
            id="category-price"
            type="number"
            min="0"
            step="1"
            value={formData.price}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d+$/.test(value)) {
                handleInputChange('price', value);
              }
            }}
            placeholder="Enter price"
            className={errors.price ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price}</p>
          )}
        </div>

        {/* Display Order */}
        <div className="space-y-2">
          <Label htmlFor="category-display-order">Display Order *</Label>
          <Input
            id="category-display-order"
            type="number"
            min="0"
            step="1"
            value={formData.displayOrder}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d+$/.test(value)) {
                handleInputChange('displayOrder', value);
              }
            }}
            placeholder="0"
            className={errors.displayOrder ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.displayOrder && (
            <p className="text-sm text-red-500">{errors.displayOrder}</p>
          )}
        </div>


        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="category-status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange('status', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-500">{errors.status}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              category ? 'Update Category' : 'Create Category'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
