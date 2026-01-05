import { Assessment, RoutineStep, SeasonalAdjustment } from "@shared/schema";

export interface SkincareRecommendation {
  morningSteps: RoutineStep[];
  eveningSteps: RoutineStep[];
  seasonalAdjustments: SeasonalAdjustment;
}

export const SKIN_TYPES = [
  {
    value: 'oily',
    label: 'Oily',
    description: 'Shiny T-zone, enlarged pores, prone to breakouts',
    icon: 'fas fa-tint'
  },
  {
    value: 'dry',
    label: 'Dry',
    description: 'Tight feeling, flaky patches, minimal oil production',
    icon: 'fas fa-sun'
  },
  {
    value: 'combination',
    label: 'Combination',
    description: 'Oily T-zone with dry cheeks and temples',
    icon: 'fas fa-balance-scale'
  },
  {
    value: 'sensitive',
    label: 'Sensitive',
    description: 'Reactive to products, redness, irritation-prone',
    icon: 'fas fa-exclamation-triangle'
  }
];

export const SKIN_CONCERNS = [
  { value: 'acne', label: 'Acne & Breakouts' },
  { value: 'aging', label: 'Fine Lines & Aging' },
  { value: 'dark-spots', label: 'Dark Spots & Pigmentation' },
  { value: 'pores', label: 'Large Pores' },
  { value: 'dullness', label: 'Dull Complexion' },
  { value: 'redness', label: 'Redness & Irritation' },
  { value: 'dryness', label: 'Dryness & Dehydration' },
  { value: 'oiliness', label: 'Excess Oil Production' }
];

export const AGE_RANGES = [
  { value: '18-25', label: '18-25' },
  { value: '26-35', label: '26-35' },
  { value: '36-45', label: '36-45' },
  { value: '46-55', label: '46-55' },
  { value: '55+', label: '55+' }
];

export const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget-Friendly ($0-50/month)' },
  { value: 'mid-range', label: 'Mid-Range ($50-150/month)' },
  { value: 'premium', label: 'Premium ($150+/month)' },
  { value: 'home-remedies', label: 'I prefer home remedies' }
];

export const TIME_PREFERENCES = [
  {
    value: 'quick',
    label: 'Quick (5-10 min)',
    description: 'Minimal steps for busy lifestyles',
    icon: 'fas fa-clock'
  },
  {
    value: 'moderate',
    label: 'Moderate (10-20 min)',
    description: 'Balanced routine with key steps',
    icon: 'fas fa-hourglass-half'
  },
  {
    value: 'extensive',
    label: 'Extensive (20+ min)',
    description: 'Complete routine with all steps',
    icon: 'fas fa-spa'
  }
];

export const SEASONS = [
  {
    value: 'spring',
    label: 'Spring',
    description: 'Light cleansing, gentle exfoliation',
    icon: 'fas fa-seedling',
    color: '#90EE90'
  },
  {
    value: 'summer',
    label: 'Summer',
    description: 'Extra SPF, oil control, hydration',
    icon: 'fas fa-sun',
    color: '#FFD700'
  },
  {
    value: 'fall',
    label: 'Fall',
    description: 'Repair damage, prepare for dryness',
    icon: 'fas fa-leaf',
    color: '#DAA520'
  },
  {
    value: 'winter',
    label: 'Winter',
    description: 'Deep hydration, barrier repair',
    icon: 'fas fa-snowflake',
    color: '#87CEEB'
  }
];

export function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

export function validateAssessment(assessment: Partial<Assessment>): string[] {
  const errors: string[] = [];
  
  if (!assessment.skinType) {
    errors.push('Please select your skin type');
  }
  
  if (!assessment.concerns || assessment.concerns.length === 0) {
    errors.push('Please select at least one skin concern');
  }
  
  if (!assessment.ageRange) {
    errors.push('Please select your age range');
  }
  
  if (!assessment.budget) {
    errors.push('Please select your budget preference');
  }
  
  if (!assessment.timeAvailable) {
    errors.push('Please select your time preference');
  }
  
  return errors;
}

export function getIngredientSafetyLevel(ingredient: string, userAllergies: string[] = []): 'safe' | 'caution' | 'warning' {
  const allergens = userAllergies.map(a => a.toLowerCase());
  const ingredientLower = ingredient.toLowerCase();
  
  // Check for direct allergies
  if (allergens.includes(ingredientLower)) {
    return 'warning';
  }
  
  // Common irritants
  const irritants = ['fragrance', 'alcohol denat', 'essential oils', 'citrus extracts'];
  if (irritants.some(irritant => ingredientLower.includes(irritant))) {
    return 'caution';
  }
  
  // Strong actives that need caution
  const strongActives = ['retinol', 'tretinoin', 'glycolic acid', 'lactic acid'];
  if (strongActives.some(active => ingredientLower.includes(active))) {
    return 'caution';
  }
  
  return 'safe';
}

export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

export function generateStarRating(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + 
         (hasHalfStar ? '☆' : '') + 
         '☆'.repeat(emptyStars);
}
