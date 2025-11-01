// Import category images from assets
import groceryShoppingImg from '../assets/category-images/GROCERY_SHOPPING.avif';
import tutoringImg from '../assets/category-images/TUTORING.avif';
import homeRepairImg from '../assets/category-images/HOME_REPAIR.avif';
import movingHelpImg from '../assets/category-images/MOVING_HELP.webp';
import houseCleaningImg from '../assets/category-images/HOUSE_CLEANING.avif';
import homeCleaningImg from '../assets/category-images/HOME_CLEANING.avif';
import technicalSupportImg from '../assets/category-images/TECHNICAL_SUPPORT.avif';
import professionalAdviceImg from '../assets/category-images/PROFESSIONAL_ADVICE.avif';
import elderlyCareImg from '../assets/category-images/ELDERLY_CARE.jpg';
import educationImg from '../assets/category-images/EDUCATION.avif';
import healthcareImg from '../assets/category-images/HEALTHCARE.avif';
import homeMaintenanceImg from '../assets/category-images/HOME_MAINTENANCE.avif';
import otherImg from '../assets/category-images/OTHER.avif';

export const DEFAULT_CATEGORY_IMAGE = otherImg;

export const categoryMapping = {
  GROCERY_SHOPPING: 'Grocery Shopping',
  TUTORING: 'Tutoring',
  HOME_REPAIR: 'Home Repair',
  MOVING_HELP: 'Moving Help',
  HOUSE_CLEANING: 'House Cleaning',
  OTHER: 'Other Services',
  HOME_CLEANING: 'Home Cleaning',
  TECHNICAL_SUPPORT: 'Technical Support',
  PROFESSIONAL_ADVICE: 'Professional Advice',
  ELDERLY_CARE: 'Elderly Care',
  EDUCATION: 'Education',
  HEALTHCARE: 'Healthcare',
  HOME_MAINTENANCE: 'Home Maintenance',

};

export const categoryImages = {
  GROCERY_SHOPPING: groceryShoppingImg,
  TUTORING: tutoringImg,
  HOME_REPAIR: homeRepairImg,
  MOVING_HELP: movingHelpImg,
  HOUSE_CLEANING: houseCleaningImg,
  HOME_CLEANING: homeCleaningImg,
  TECHNICAL_SUPPORT: technicalSupportImg,
  PROFESSIONAL_ADVICE: professionalAdviceImg,
  ELDERLY_CARE: elderlyCareImg,
  EDUCATION: educationImg,
  HEALTHCARE: healthcareImg,
  HOME_MAINTENANCE: homeMaintenanceImg,
  OTHER: otherImg,
};

/**
 * Get image URL for a category
 * @param {string} categoryValue - The category value/key (e.g., 'HOME_CLEANING')
 * @returns {string} - The image URL for the category or the default image URL if not found
 */
export const getCategoryImage = (categoryValue) => {
  return categoryImages[categoryValue] || DEFAULT_CATEGORY_IMAGE;
};