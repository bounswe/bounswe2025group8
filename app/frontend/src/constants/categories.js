export const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&w=500&q=80';

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
  PLUMBING: 'Plumbing',
  ELDERLY_CARE: 'Elderly Care',
  EDUCATION: 'Education',
  HEALTHCARE: 'Healthcare',
  HEAVY_LIFTING: 'Heavy Lifting',
  HOME_MAINTENANCE: 'Home Maintenance',

};

export const categoryImages = {
  GROCERY_SHOPPING: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&w=500&q=80',
  TUTORING: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&w=500&q=80',
  HOME_REPAIR: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&w=500&q=80',
  MOVING_HELP: 'https://images.unsplash.com/photo-1601106690038-c5048829de1e?auto=format&w=500&q=80',
  HOUSE_CLEANING: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&w=500&q=80',
  HOME_CLEANING: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&w=500&q=80',
  TECHNICAL_SUPPORT: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&w=500&q=80',
  PROFESSIONAL_ADVICE: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&w=500&q=80',
  PLUMBING: 'https://images.unsplash.com/photo-1551807501-9875b7162802?auto=format&w=500&q=80',
  ELDERLY_CARE: 'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?auto=format&w=500&q=80',
  EDUCATION: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&w=500&q=80',
  HEALTHCARE: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&w=500&q=80',
  HEAVY_LIFTING: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&w=500&q=80',
  HOME_MAINTENANCE: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&w=500&q=80',
  OTHER: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&w=500&q=80',
};

/**
 * Get image URL for a category
 * @param {string} categoryValue - The category value/key (e.g., 'HOME_CLEANING')
 * @returns {string} - The image URL for the category or the default image URL if not found
 */
export const getCategoryImage = (categoryValue) => {
  return categoryImages[categoryValue] || DEFAULT_CATEGORY_IMAGE;
};