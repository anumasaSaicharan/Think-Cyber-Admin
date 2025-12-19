/**
 * Plan Type Helpers for Frontend
 * UI Logic, Rendering decisions, and Frontend Validation
 */

export const PlanTypes = {
  FREE: 'FREE',
  INDIVIDUAL: 'INDIVIDUAL',
  BUNDLE: 'BUNDLE',
  FLEXIBLE: 'FLEXIBLE'
};

/**
 * Get visible pricing fields based on plan type
 * Determines which UI fields should be shown in the admin form
 */
export const getPricingFieldsForPlanType = (planType: string | undefined) => {
  switch (planType) {
    case PlanTypes.FREE:
      return {
        showBundlePrice: false,
        showTopicPrices: false,
        label: 'Free Plan',
        description: 'All topics are free. No pricing fields required.'
      };

    case PlanTypes.INDIVIDUAL:
      return {
        showBundlePrice: false,
        showTopicPrices: true,
        label: 'Individual Topics',
        description: 'Each topic has its own price. Users buy topics one by one.'
      };

    case PlanTypes.BUNDLE:
      return {
        showBundlePrice: true,
        showTopicPrices: false,
        label: 'Bundle Purchase',
        description: 'Users purchase the entire category at one price.'
      };

    case PlanTypes.FLEXIBLE:
      return {
        showBundlePrice: true,
        showTopicPrices: true,
        label: 'Flexible Purchase',
        description: 'Users can buy individual topics OR the entire bundle.'
      };

    default:
      return {
        showBundlePrice: false,
        showTopicPrices: false,
        label: 'Select a plan',
        description: ''
      };
  }
};

/**
 * Get CTA button text based on plan type
 */
export const getCTAButtonText = (planType: string | undefined, isEnrolled: boolean): string => {
  if (isEnrolled) {
    return 'View Course';
  }

  switch (planType) {
    case PlanTypes.FREE:
      return 'Start Learning';
    case PlanTypes.INDIVIDUAL:
      return 'Buy Topic';
    case PlanTypes.BUNDLE:
      return 'Buy Bundle';
    case PlanTypes.FLEXIBLE:
      return 'Choose Plan';
    default:
      return 'Explore';
  }
};

/**
 * Get color for plan type badge
 */
export const getPlanTypeBadgeColor = (planType: string | undefined) => {
  switch (planType) {
    case PlanTypes.FREE:
      return 'bg-green-100 text-green-700';
    case PlanTypes.INDIVIDUAL:
      return 'bg-purple-100 text-purple-700';
    case PlanTypes.BUNDLE:
      return 'bg-orange-100 text-orange-700';
    case PlanTypes.FLEXIBLE:
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Get icon emoji for plan type
 */
export const getPlanTypeIcon = (planType: string | undefined): string => {
  switch (planType) {
    case PlanTypes.FREE:
      return '🎁';
    case PlanTypes.INDIVIDUAL:
      return '📌';
    case PlanTypes.BUNDLE:
      return '📦';
    case PlanTypes.FLEXIBLE:
      return '🎯';
    default:
      return '📚';
  }
};

/**
 * Validate form data based on plan type (frontend)
 */
export const validateFormByPlanType = (formData: any, planType: string | undefined): Record<string, string> => {
  const errors: Record<string, string> = {};

  switch (planType) {
    case PlanTypes.BUNDLE:
      if (!formData.bundle_price || formData.bundle_price <= 0) {
        errors.bundle_price = 'Bundle price is required and must be greater than 0';
      }
      break;

    case PlanTypes.FLEXIBLE:
      if (!formData.bundle_price || formData.bundle_price <= 0) {
        errors.bundle_price = 'Bundle price is required and must be greater than 0';
      }
      break;

    case PlanTypes.FREE:
    case PlanTypes.INDIVIDUAL:
      // No pricing validation needed at category level
      break;
  }

  return errors;
};

/**
 * Calculate purchase options visible to user based on plan type
 */
export const getPurchaseOptions = (planType: string | undefined, categoryTopicCount: number) => {
  switch (planType) {
    case PlanTypes.FREE:
      return [{ type: 'free', label: 'Start Learning (Free)' }];

    case PlanTypes.INDIVIDUAL:
      return [{ type: 'individual', label: `Buy Topics (${categoryTopicCount} available)` }];

    case PlanTypes.BUNDLE:
      return [{ type: 'bundle', label: 'Buy Full Course' }];

    case PlanTypes.FLEXIBLE:
      return [
        { type: 'individual', label: `Buy Individual Topics (${categoryTopicCount} available)` },
        { type: 'bundle', label: 'Buy Full Bundle' }
      ];

    default:
      return [];
  }
};

/**
 * Check if user can see topic pricing
 */
export const canViewTopicPricing = (planType: string | undefined): boolean => {
  return planType === PlanTypes.INDIVIDUAL || planType === PlanTypes.FLEXIBLE;
};

/**
 * Check if user can select multiple topics
 */
export const canSelectMultipleTopics = (planType: string | undefined): boolean => {
  return planType === PlanTypes.INDIVIDUAL || planType === PlanTypes.FLEXIBLE;
};

/**
 * Check if user can select single topic only
 */
export const canSelectSingleTopicOnly = (planType: string | undefined): boolean => {
  return planType === PlanTypes.INDIVIDUAL;
};

/**
 * Format price display based on plan type
 */
export const formatPriceDisplay = (price: number | undefined, planType: string | undefined): string => {
  if (price === undefined || price === null) {
    return 'Free';
  }

  if (price === 0) {
    return 'Free';
  }

  return `₹${price.toLocaleString('en-IN')}`;
};

/**
 * Get topic lock status message
 */
export const getTopicLockMessage = (
  planType: string | undefined,
  isTopicPurchased: boolean,
  price: number | undefined,
  bundlePrice: number | undefined
): string => {
  if (isTopicPurchased) {
    return '✅ Purchased';
  }

  switch (planType) {
    case PlanTypes.FREE:
      return '🎁 Free';

    case PlanTypes.INDIVIDUAL:
      return `🔒 Buy for ${formatPriceDisplay(price, planType)}`;

    case PlanTypes.BUNDLE:
      return `🔒 Buy bundle for ${formatPriceDisplay(bundlePrice, planType)}`;

    case PlanTypes.FLEXIBLE:
      const messages = [];
      if (price) messages.push(`topic: ${formatPriceDisplay(price, planType)}`);
      if (bundlePrice) messages.push(`bundle: ${formatPriceDisplay(bundlePrice, planType)}`);
      return `🔒 ${messages.join(' or ')}`;

    default:
      return '🔒 Locked';
  }
};

/**
 * Should show individual topic prices in UI?
 */
export const shouldShowTopicPrices = (planType: string | undefined): boolean => {
  return planType === PlanTypes.INDIVIDUAL || planType === PlanTypes.FLEXIBLE;
};

/**
 * Should show bundle price in UI?
 */
export const shouldShowBundlePrice = (planType: string | undefined): boolean => {
  return planType === PlanTypes.BUNDLE || planType === PlanTypes.FLEXIBLE;
};

/**
 * Get comparison message for FLEXIBLE plans
 * Shows which is cheaper: individual topics or bundle
 */
export const getFlexiblePriceComparison = (individualTotal: number, bundlePrice: number): string => {
  const savings = Math.abs(bundlePrice - individualTotal);
  if (bundlePrice < individualTotal) {
    return `💰 Save ₹${savings} with bundle!`;
  } else if (individualTotal < bundlePrice) {
    return `💰 Save ₹${savings} with individual topics!`;
  }
  return 'Same price either way!';
};

/**
 * Get access control message for frontend display
 */
export const getAccessMessage = (
  hasAccess: boolean,
  planType: string | undefined,
  reason?: string
): string => {
  if (hasAccess) {
    return '✅ You have access';
  }

  switch (reason) {
    case 'NO_PURCHASE':
      switch (planType) {
        case PlanTypes.BUNDLE:
          return '🔒 Purchase the bundle to access';
        case PlanTypes.INDIVIDUAL:
          return '🔒 Purchase this topic to access';
        case PlanTypes.FLEXIBLE:
          return '🔒 Purchase this topic or bundle to access';
        default:
          return '🔒 Requires purchase';
      }

    case 'INVALID_ENROLLMENT':
      return '❌ Invalid enrollment';

    case 'FREE_TOPIC':
      return '✅ Free';

    default:
      return '🔒 Locked';
  }
};

/**
 * Show loading skeleton based on content type
 */
export const getLoadingSkeletonLines = (planType: string | undefined): number => {
  switch (planType) {
    case PlanTypes.FREE:
      return 3; // No pricing, minimal skeleton
    case PlanTypes.INDIVIDUAL:
      return 4; // Show topic count
    case PlanTypes.BUNDLE:
      return 4; // Show bundle price
    case PlanTypes.FLEXIBLE:
      return 5; // Show both bundle and topic prices
    default:
      return 3;
  }
};
