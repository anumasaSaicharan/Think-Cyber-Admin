'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Loader2, Check } from 'lucide-react';
import { apiService } from '@/lib/api-service';
import { ap } from '@faker-js/faker/dist/airline-CLphikKp';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

interface SubscriptionPlan {
  id: number;
  name: string;
  plan_type: 'BUNDLE' | 'FLEXIBLE' | 'INDIVIDUAL' | 'FREE';
  features?: string;
  description?: string;
  status?: string;
}

interface Category {
  id?: number;
  name: string;
  description: string;
  price: number;
  priority?: number;
  status: 'Active' | 'Draft' | 'Inactive';
  subscription_plan_id: number; // MANDATORY
  plan_type?: 'BUNDLE' | 'FLEXIBLE' | 'INDIVIDUAL' | 'FREE'; // MANDATORY
  // Conditional pricing fields based on plan_type:
  // FREE: no pricing fields
  // INDIVIDUAL: no category pricing (topic prices handled separately)
  // BUNDLE: only bundle_price (final price)
  // FLEXIBLE: bundle_price + individual topic prices
  bundle_price?: number; // For BUNDLE & FLEXIBLE
  topic_prices?: Record<number, number>; // For FLEXIBLE & INDIVIDUAL (topic_id: price)
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
    priority: 0,
    status: 'Active',
    subscription_plan_id: 0,
    plan_type: undefined,
    bundle_price: 0,
    topic_prices: {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);

  // Helper function: Get visible pricing fields based on plan type
  const getPricingFieldsForPlanType = (planType?: string) => {
    switch (planType) {
      case 'FREE':
        return { showBundlePrice: false, showTopicPrices: false };
      case 'INDIVIDUAL':
        return { showBundlePrice: false, showTopicPrices: true };
      case 'BUNDLE':
        return { showBundlePrice: true, showTopicPrices: false };
      case 'FLEXIBLE':
        return { showBundlePrice: true, showTopicPrices: true };
      default:
        return { showBundlePrice: false, showTopicPrices: false };
    }
  };

  // Helper function: Get plan type from selected plan
  const getSelectedPlanType = (): string | undefined => {
    if (!formData.subscription_plan_id) return undefined;
    
    // First try to use stored plan_type
    if (formData.plan_type) {
      return formData.plan_type;
    }
    
    // Fallback to lookup from plans array
    const selectedPlan = subscriptionPlans.find(p => p.id === formData.subscription_plan_id);
    if (selectedPlan) {
      console.log('Found plan:', selectedPlan.name, 'Type:', selectedPlan.plan_type);
      return selectedPlan.plan_type;
    }
    
    console.warn('Plan not found. ID:', formData.subscription_plan_id, 'Available plans:', subscriptionPlans);
    return undefined;
  };

  // Fetch subscription plans when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionPlans();
    }
  }, [isOpen]);

  // Helper function: Map plan name to plan_type
  const getPlanTypeFromName = (planName: string): 'BUNDLE' | 'FLEXIBLE' | 'INDIVIDUAL' | 'FREE' => {
    const name = planName.toLowerCase();
    if (name.includes('bundle')) return 'BUNDLE';
    if (name.includes('flexible')) return 'FLEXIBLE';
    if (name.includes('individual') || name.includes('single')) return 'INDIVIDUAL';
    if (name.includes('free')) return 'FREE';
    // Default fallback
    return 'FLEXIBLE';
  };

  const fetchSubscriptionPlans = async () => {
    try {
      setPlansLoading(true);
      const response = await apiService.get<any>(
            API_ENDPOINTS.SUBSCRIPTION_PLANS.ACTIVE
          );
      
      let plansData = [];
      
      if (response.success && Array.isArray(response.data)) {
        console.log('Plans from API:', response.data);
        plansData = response.data;
      } else if (Array.isArray(response)) {
        // Handle case where API returns array directly
        console.log('Plans from API (direct array):', response);
        plansData = response;
      }
      
      // Map plans to include plan_type based on name
      const mappedPlans = plansData.map((plan: any) => ({
        ...plan,
        plan_type: plan.plan_type || getPlanTypeFromName(plan.name)
      }));
      
      console.log('Mapped plans with types:', mappedPlans);
      setSubscriptionPlans(mappedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setPlansLoading(false);
    }
  };

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
          priority: category.priority || 0,
          status: category.status || 'Active',
          subscription_plan_id: category.subscription_plan_id,
          plan_type: category.plan_type,
          bundle_price: category.bundle_price || 0,
          topic_prices: category.topic_prices || {}
        });
      } else {
        // Add mode
        setFormData({
          name: '',
          description: '',
          price: 0,
          priority: 0,
          status: 'Active',
          subscription_plan_id: 0,
          plan_type: undefined,
          bundle_price: 0,
          topic_prices: {}
        });
      }

      setErrors({});
    }
  }, [isOpen, category]);


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const planType = getSelectedPlanType();

    // Common validations
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

    if (!formData.subscription_plan_id) {
      newErrors.subscription_plan_id = 'Subscription plan is required';
    }

    // Plan-type specific validations
    if (planType === 'BUNDLE') {
      if (!formData.bundle_price || formData.bundle_price <= 0) {
        newErrors.bundle_price = 'Bundle price is required and must be greater than 0';
      }
    } else if (planType === 'FLEXIBLE') {
      if (!formData.bundle_price || formData.bundle_price <= 0) {
        newErrors.bundle_price = 'Bundle price is required and must be greater than 0';
      }
    }
    // FREE: No pricing validation needed
    // INDIVIDUAL: No category pricing validation needed (topic prices handled separately)

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
      const planType = getSelectedPlanType();

      // Build payload excluding legacy price field
      const payload = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        priority: formData.priority || 0,
        subscription_plan_id: formData.subscription_plan_id,
        plan_type: planType,
      } as any;
      
      // Only include bundle_price if BUNDLE or FLEXIBLE
      if (planType === 'BUNDLE' || planType === 'FLEXIBLE') {
        payload.bundle_price = formData.bundle_price || 0;
      }
      
      // Only include topic_prices if INDIVIDUAL or FLEXIBLE
      if (planType === 'INDIVIDUAL' || planType === 'FLEXIBLE') {
        payload.topic_prices = formData.topic_prices || {};
      }
      
      await onSave(payload);
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
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
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

        {/* Price (Legacy field - kept for compatibility) */}
        {false && (
          <div className="space-y-2">
            <Label htmlFor="category-price">Price ₹ (Legacy)</Label>
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
            <p className="text-xs text-gray-500">Use Bundle Price or Topic Prices instead</p>
          </div>
        )}
  
        {/* Subscription Plan Selection */}
        <div className="space-y-4 border-t pt-4">
          <div>
            <Label className="text-base font-semibold mb-3 block">📦 Select Feature Plan</Label>
            <p className="text-sm text-gray-500 mb-3">Choose a plan type to configure purchase options</p>
          </div>

          {plansLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="ml-2">Loading plans...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    formData.subscription_plan_id === plan.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      subscription_plan_id: plan.id,
                      plan_type: plan.plan_type  // IMPORTANT: Also capture plan_type
                    }))
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                      formData.subscription_plan_id === plan.id
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.subscription_plan_id === plan.id && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{plan.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          plan.plan_type === 'BUNDLE' ? 'bg-orange-100 text-orange-700' :
                          plan.plan_type === 'FLEXIBLE' ? 'bg-blue-100 text-blue-700' :
                          plan.plan_type === 'INDIVIDUAL' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {plan.plan_type}
                        </span>
                      </div>
                      {plan.features && (
                        <p className="text-xs text-gray-600">{plan.features.split(',')[0]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plan Pricing Details - Conditional based on plan type */}
        {formData.subscription_plan_id && getSelectedPlanType() && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label className="text-base font-semibold mb-2 block">💰 Plan Pricing Details</Label>
              {getSelectedPlanType() === 'FREE' && (
                <p className="text-sm text-gray-600 mb-3">✅ This plan is free. No pricing required.</p>
              )}
              {getSelectedPlanType() === 'INDIVIDUAL' && (
                <p className="text-sm text-gray-600 mb-3">📌 Each topic has its own price (configure in topic settings).</p>
              )}
              {getSelectedPlanType() === 'BUNDLE' && (
                <p className="text-sm text-gray-600 mb-3">📦 Users purchase the entire category at one price.</p>
              )}
              {getSelectedPlanType() === 'FLEXIBLE' && (
                <p className="text-sm text-gray-600 mb-3">🎯 Users can buy individual topics OR the entire bundle.</p>
              )}
            </div>

            {/* Bundle Price - For BUNDLE & FLEXIBLE */}
            {(getSelectedPlanType() === 'BUNDLE' || getSelectedPlanType() === 'FLEXIBLE') && (
              <div className="space-y-2">
                <Label htmlFor="bundle-price">
                  Bundle Price ₹ *
                </Label>
                <Input
                  id="bundle-price"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.bundle_price || 0}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      setFormData((prev) => ({
                        ...prev,
                        bundle_price: value ? parseInt(value) : 0
                      }));
                    }
                  }}
                  placeholder="Enter bundle price"
                  className={errors.bundle_price ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.bundle_price && (
                  <p className="text-sm text-red-500">{errors.bundle_price}</p>
                )}
                <p className="text-xs text-gray-500">
                  {getSelectedPlanType() === 'BUNDLE'
                    ? 'Final price for the entire category'
                    : 'Price to unlock all topics in this category'}
                </p>
              </div>
            )}

            {/* Topic Prices Note - For INDIVIDUAL & FLEXIBLE */}
            {(getSelectedPlanType() === 'INDIVIDUAL' || getSelectedPlanType() === 'FLEXIBLE') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 mb-1">📚 Topic Pricing</p>
                <p className="text-xs text-blue-700">
                  {getSelectedPlanType() === 'INDIVIDUAL'
                    ? 'Set individual prices for each topic. Users purchase topics one by one.'
                    : 'Set individual prices for each topic. Users can buy topics separately or purchase this bundle.'}
                </p>
              </div>
            )}
          </div>
        )}

         {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="category-priority">Priority (Display Order) *</Label>
          <Input
            id="category-priority"
            type="number"
            min="0"
            step="1"
            value={formData.priority || 0}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d+$/.test(value)) {
                handleInputChange('priority', value ? parseInt(value) : 0);
              }
            }}
            placeholder="Enter priority (higher number = appears first)"
            className={errors.priority ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.priority && (
            <p className="text-sm text-red-500">{errors.priority}</p>
          )}
          <p className="text-xs text-gray-500">Higher priority number displays first in the category list</p>
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
        <div className="flex justify-end space-x-2 pt-4 border-t">
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
