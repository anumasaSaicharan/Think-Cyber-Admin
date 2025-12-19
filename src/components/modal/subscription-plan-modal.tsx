'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Loader2 } from 'lucide-react';

interface SubscriptionPlan {
  id?: number;
  name: string;
  features: string;
  description: string;
  type: string;
  status: 'Active' | 'Draft' | 'Inactive';
}

interface SubscriptionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: SubscriptionPlan) => Promise<void>;
  plan?: SubscriptionPlan | null;
  loading?: boolean;
}

export const SubscriptionPlanModal: React.FC<SubscriptionPlanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  plan,
  loading = false
}) => {
  const [formData, setFormData] = useState<SubscriptionPlan>({
    name: '',
    features: '',
    description: '',
    type: '',
    status: 'Active'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or plan changes
  useEffect(() => {
    if (isOpen) {
      if (plan) {
        // Edit mode
        setFormData({
          id: plan.id,
          name: plan.name || '',
          features: plan.features || '',
          description: plan.description || '',
          type: plan.type || '',
          status: plan.status || 'Active',
        });
      } else {
        // Add mode
        setFormData({
          name: '',
          features: '',
          description: '',
          type: '',
          status: 'Active',
        });
      }

      setErrors({});
    }
  }, [isOpen, plan]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Plan name must be at least 3 characters';
    }

    if (!formData.features.trim()) {
      newErrors.features = 'Features are required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Type is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SubscriptionPlan, value: string | number) => {
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
      console.error('Error saving subscription plan:', error);
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
      title={plan ? 'Edit Features  Plan' : 'Add New Features  Plan'}
      description={plan ? 'Update the Features  plan information below.' : 'Create a new Features  plan for your users.'}
      isOpen={isOpen}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Plan Name */}
        <div className="space-y-2">
          <Label htmlFor="plan-name">Plan Name *</Label>
          <Input
            id="plan-name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Basic Plan, Professional Plan"
            className={errors.name ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2">
          <Label htmlFor="plan-features">Features *</Label>
          <Textarea
            id="plan-features"
            value={formData.features}
            onChange={(e) => handleInputChange('features', e.target.value)}
            placeholder="List features separated by comma or newline (e.g., Unlimited access, Priority support, Certificate)"
            className={`min-h-[80px] ${errors.features ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.features && (
            <p className="text-sm text-red-500">{errors.features}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="plan-description">Description *</Label>
          <Textarea
            id="plan-description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the plan briefly"
            className={`min-h-[60px] ${errors.description ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="plan-type">Type *</Label>
          <Input
            id="plan-type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            placeholder="e.g., Basic, Premium, Enterprise"
            className={errors.type ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.type && (
            <p className="text-sm text-red-500">{errors.type}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="plan-status">Status *</Label>
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
              plan ? 'Update Plan' : 'Create Plan'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
