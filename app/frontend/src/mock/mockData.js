/**
 * Mock Data for Neighborhood Assistance Board Application Demo
 * 
 * This file contains realistic mock data for demonstration purposes.
 * In a production environment, this data would be fetched from the backend API.
 */

import { v4 as uuidv4 } from 'uuid';

// Mock User Data
export const mockUsers = [
  {
    id: 1,
    email: 'sarah.johnson@example.com',
    name: 'Sarah',
    surname: 'Johnson',
    username: 'sarahj',
    phoneNumber: '+1 (555) 123-4567',
    location: '123 Oak Street, Denver, CO 80202',
    avatar: 'https://i.pravatar.cc/300?img=1',
    rating: 4.8,
    completedTaskCount: 23,
    role: 'user',
  },
  {
    id: 2,
    email: 'michael.chen@example.com',
    name: 'Michael',
    surname: 'Chen',
    username: 'mikechen',
    phoneNumber: '+1 (555) 234-5678',
    location: '456 Maple Avenue, Denver, CO 80203',
    avatar: 'https://i.pravatar.cc/300?img=3',
    rating: 4.6,
    completedTaskCount: 17,
    role: 'user',
  },
  {
    id: 3,
    email: 'emma.rodriguez@example.com',
    name: 'Emma',
    surname: 'Rodriguez',
    username: 'emmar',
    phoneNumber: '+1 (555) 345-6789',
    location: '789 Pine Street, Denver, CO 80204',
    avatar: 'https://i.pravatar.cc/300?img=5',
    rating: 4.9,
    completedTaskCount: 31,
    role: 'user',
  },
  {
    id: 4,
    email: 'david.patel@example.com',
    name: 'David',
    surname: 'Patel',
    username: 'davidp',
    phoneNumber: '+1 (555) 456-7890',
    location: '321 Cedar Road, Denver, CO 80205',
    avatar: 'https://i.pravatar.cc/300?img=8',
    rating: 4.5,
    completedTaskCount: 12,
    role: 'user',
  },
  {
    id: 5,
    email: 'olivia.kim@example.com',
    name: 'Olivia',
    surname: 'Kim',
    username: 'oliviak',
    phoneNumber: '+1 (555) 567-8901',
    location: '654 Birch Lane, Denver, CO 80206',
    avatar: 'https://i.pravatar.cc/300?img=9',
    rating: 4.7,
    completedTaskCount: 24,
    role: 'user',
  },
  {
    id: 6,
    email: 'admin@example.com',
    name: 'Admin',
    surname: 'User',
    username: 'admin',
    phoneNumber: '+1 (555) 987-6543',
    location: '100 Admin Plaza, Denver, CO 80209',
    avatar: 'https://i.pravatar.cc/300?img=12',
    rating: 5.0,
    completedTaskCount: 0,
    role: 'admin',
  },
];

// Mock Task Categories
export const taskCategories = [
  'GROCERY_SHOPPING',
  'TUTORING',
  'HOME_REPAIR',
  'MOVING_HELP',
  'HOUSE_CLEANING',
  'OTHER',
];

// Convert backend category codes to display names and icons
export const categoryMapping = {
  GROCERY_SHOPPING: { 
    name: 'Grocery Shopping', 
    icon: 'ShoppingCart',
    description: 'Help with shopping for groceries and essentials',
    image: '/category-images/grocery-shopping.jpg'
  },
  TUTORING: { 
    name: 'Tutoring', 
    icon: 'School',
    description: 'Educational assistance and learning support',
    image: '/category-images/tutoring.jpg'
  },
  HOME_REPAIR: { 
    name: 'Home Repair', 
    icon: 'Handyman',
    description: 'Assistance with fixing household issues',
    image: '/category-images/home-repair.jpg'
  },
  MOVING_HELP: { 
    name: 'Moving Help', 
    icon: 'LocalShipping',
    description: 'Support with relocation and moving items',
    image: '/category-images/moving-help.jpg'
  },
  HOUSE_CLEANING: { 
    name: 'House Cleaning', 
    icon: 'CleaningServices',
    description: 'Help with cleaning and organizing homes',
    image: '/category-images/house-cleaning.jpg'
  },
  OTHER: { 
    name: 'Other Assistance', 
    icon: 'MoreHoriz',
    description: 'Miscellaneous neighborhood support services',
    image: '/category-images/other.jpg'
  },
};

// Mock Task Status Types
export const taskStatusTypes = [
  'POSTED',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
];

// Helper function to generate random date in the future (0-14 days)
const futureDate = (daysOffset = 14) => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + Math.floor(Math.random() * daysOffset));
  
  // Format time 
  const hours = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
  const minutes = Math.random() > 0.5 ? '00' : '30';
  futureDate.setHours(hours, minutes === '00' ? 0 : 30, 0);
  
  return futureDate;
};

// Helper function to generate a past date (0-14 days ago)
const pastDate = (daysOffset = 14) => {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - Math.floor(Math.random() * daysOffset));
  return pastDate;
};

// Mock Task Data
export const mockTasks = [
  {
    id: 101,
    title: 'Need help with weekly grocery shopping',
    description: 'I\'m looking for someone to help me with my grocery shopping. I need various items from the local supermarket, including fresh produce, dairy, and some household essentials. I can provide a detailed list. This would be very helpful as I\'m recovering from a recent surgery and have limited mobility.',
    category: 'GROCERY_SHOPPING',
    location: '123 Oak Street, Denver, CO 80202',
    deadline: futureDate(7),
    requirements: 'Must have own transportation. Should be able to carry up to 20 pounds of groceries.',
    urgencyLevel: 2,
    volunteerNumber: 1,
    status: 'POSTED',
    isRecurring: false,
    createdAt: pastDate(2),
    updatedAt: pastDate(2),
    creatorId: 1,
    assigneeId: null,
    phoneNumber: '+1 (555) 123-4567',
    tags: ['grocery', 'shopping', 'assistance'],
  },
  {
    id: 102,
    title: 'Math tutoring for high school student',
    description: 'Looking for a volunteer to help my son with Algebra II and pre-calculus. He\'s struggling with some concepts and could use extra help. Ideally, we\'d meet once a week for about an hour. We can provide all necessary materials and textbooks.',
    category: 'TUTORING',
    location: '456 Maple Avenue, Denver, CO 80203',
    deadline: futureDate(10),
    requirements: 'Experience with high school math, patient and good at explaining concepts. Previous tutoring experience preferred.',
    urgencyLevel: 1,
    volunteerNumber: 1,
    status: 'POSTED',
    isRecurring: true,
    createdAt: pastDate(5),
    updatedAt: pastDate(5),
    creatorId: 2,
    assigneeId: null,
    phoneNumber: '+1 (555) 234-5678',
    tags: ['education', 'math', 'tutoring'],
  },
  {
    id: 103,
    title: 'Help fixing kitchen sink leak',
    description: 'I have a leaking kitchen sink that needs repair. The leak is coming from underneath, possibly from the pipes. I have some basic tools but might need additional supplies depending on the issue. Any help would be greatly appreciated!',
    category: 'HOME_REPAIR',
    location: '789 Pine Street, Denver, CO 80204',
    deadline: futureDate(3),
    requirements: 'Basic plumbing knowledge. Should bring own tools if possible.',
    urgencyLevel: 3,
    volunteerNumber: 1,
    status: 'ASSIGNED',
    isRecurring: false,
    createdAt: pastDate(1),
    updatedAt: pastDate(0.5),
    creatorId: 3,
    assigneeId: 4,
    phoneNumber: '+1 (555) 345-6789',
    tags: ['repair', 'plumbing', 'home'],
  },
  {
    id: 104,
    title: 'Moving boxes from storage unit to new apartment',
    description: 'I recently moved to a new apartment and need help transporting about 10 medium-sized boxes from my storage unit to my new place. The storage unit is about 2 miles from my new apartment. I can help load/unload but need someone with a vehicle.',
    category: 'MOVING_HELP',
    location: '321 Cedar Road, Denver, CO 80205',
    deadline: futureDate(5),
    requirements: 'Must have a car, truck, or van that can fit several boxes. Ability to lift up to 30 pounds.',
    urgencyLevel: 2,
    volunteerNumber: 2,
    status: 'IN_PROGRESS',
    isRecurring: false,
    createdAt: pastDate(3),
    updatedAt: pastDate(1),
    creatorId: 4,
    assigneeId: 5,
    phoneNumber: '+1 (555) 456-7890',
    tags: ['moving', 'transportation', 'boxes'],
  },
  {
    id: 105,
    title: 'Deep clean kitchen and bathroom',
    description: 'I need help with deep cleaning my kitchen and bathroom. Both spaces need thorough cleaning including floors, countertops, appliances in the kitchen, and bathtub/shower in the bathroom. I have all necessary cleaning supplies.',
    category: 'HOUSE_CLEANING',
    location: '654 Birch Lane, Denver, CO 80206',
    deadline: futureDate(6),
    requirements: 'Experience with house cleaning preferred. Should be thorough and detail-oriented.',
    urgencyLevel: 1,
    volunteerNumber: 1,
    status: 'POSTED',
    isRecurring: false,
    createdAt: pastDate(4),
    updatedAt: pastDate(4),
    creatorId: 5,
    assigneeId: null,
    phoneNumber: '+1 (555) 567-8901',
    tags: ['cleaning', 'home', 'housekeeping'],
  },
  {
    id: 106,
    title: 'Dog walking for one week',
    description: 'I\'ll be away for a business trip and need someone to walk my friendly golden retriever once daily for a week. Walking time is flexible but preferably in the afternoon. My dog is well-trained and gets along well with people.',
    category: 'OTHER',
    location: '987 Elm Boulevard, Denver, CO 80207',
    deadline: futureDate(14),
    requirements: 'Must be comfortable with dogs and have some experience handling them. Responsible and punctual.',
    urgencyLevel: 2,
    volunteerNumber: 1,
    status: 'COMPLETED',
    isRecurring: false,
    createdAt: pastDate(7),
    updatedAt: pastDate(1),
    creatorId: 1,
    assigneeId: 3,
    phoneNumber: '+1 (555) 123-4567',
    tags: ['pets', 'dog walking', 'animal care'],
  },
  {
    id: 107,
    title: 'Yard work and garden maintenance',
    description: 'Looking for help with basic yard work including mowing the lawn, weeding the garden, and trimming some bushes. The yard is approximately 1/4 acre. Work can be done over one or two days, depending on volunteer\'s availability.',
    category: 'OTHER',
    location: '876 Spruce Street, Denver, CO 80208',
    deadline: futureDate(10),
    requirements: 'Some experience with yard work helpful. Must be able to use lawn mower and garden tools safely.',
    urgencyLevel: 1,
    volunteerNumber: 1,
    status: 'CANCELLED',
    isRecurring: false,
    createdAt: pastDate(6),
    updatedAt: pastDate(2),
    creatorId: 2,
    assigneeId: null,
    phoneNumber: '+1 (555) 234-5678',
    tags: ['gardening', 'yard work', 'outdoor'],
  },
  {
    id: 108,
    title: 'Assistance setting up new computer',
    description: 'I recently purchased a new laptop and need help setting it up. This includes transferring files from my old computer, installing essential software, and configuring email and other basic settings. I\'m not very tech-savvy so patient explanation would be appreciated.',
    category: 'OTHER',
    location: '543 Willow Drive, Denver, CO 80209',
    deadline: futureDate(4),
    requirements: 'Good knowledge of computers and software installation. Experience helping beginners with technology.',
    urgencyLevel: 1,
    volunteerNumber: 1,
    status: 'POSTED',
    isRecurring: false,
    createdAt: pastDate(3),
    updatedAt: pastDate(3),
    creatorId: 3,
    assigneeId: null,
    phoneNumber: '+1 (555) 345-6789',
    tags: ['technology', 'computer setup', 'technical assistance'],
  },
  {
    id: 109,
    title: 'Urgent: Ride to medical appointment',
    description: 'I need a ride to a medical appointment tomorrow morning. The appointment is at Denver Medical Center at 10:00 AM and should last about an hour. I would need a ride both ways. I can walk short distances but need assistance getting in and out of vehicles.',
    category: 'OTHER',
    location: '432 Aspen Court, Denver, CO 80210',
    deadline: futureDate(1),
    requirements: 'Must have a reliable vehicle and be punctual. Some patience and assistance with mobility needed.',
    urgencyLevel: 3,
    volunteerNumber: 1,
    status: 'ASSIGNED',
    isRecurring: false,
    createdAt: pastDate(0.5),
    updatedAt: pastDate(0.2),
    creatorId: 4,
    assigneeId: 1,
    phoneNumber: '+1 (555) 456-7890',
    tags: ['transportation', 'medical', 'urgent'],
  },
  {
    id: 110,
    title: 'Reading buddy for elderly neighbor',
    description: 'My elderly neighbor would love someone to visit once a week to read to her or discuss books. She loves mystery novels and historical fiction. This would be a wonderful opportunity to brighten someone\'s day and share a love of reading.',
    category: 'OTHER',
    location: '321 Sycamore Street, Denver, CO 80211',
    deadline: futureDate(14),
    requirements: 'Good reading skills, patient and compassionate demeanor. Commitment to regular weekly visits preferred.',
    urgencyLevel: 1,
    volunteerNumber: 1,
    status: 'POSTED',
    isRecurring: true,
    createdAt: pastDate(10),
    updatedAt: pastDate(10),
    creatorId: 5,
    assigneeId: null,
    phoneNumber: '+1 (555) 567-8901',
    tags: ['reading', 'elderly', 'companionship'],
  }
];

// Mock Volunteer Data (applications for tasks)
export const mockVolunteers = [
  {
    id: 201,
    userId: 4,
    taskId: 103,
    volunteeredAt: pastDate(0.7),
    status: 'ACCEPTED',
  },
  {
    id: 202,
    userId: 2,
    taskId: 103,
    volunteeredAt: pastDate(0.8),
    status: 'REJECTED',
  },
  {
    id: 203,
    userId: 5,
    taskId: 104,
    volunteeredAt: pastDate(1.5),
    status: 'ACCEPTED',
  },
  {
    id: 204,
    userId: 3,
    taskId: 106,
    volunteeredAt: pastDate(6),
    status: 'ACCEPTED',
  },
  {
    id: 205,
    userId: 1,
    taskId: 109,
    volunteeredAt: pastDate(0.3),
    status: 'ACCEPTED',
  },
  {
    id: 206,
    userId: 2,
    taskId: 101,
    volunteeredAt: pastDate(0.2),
    status: 'PENDING',
  },
  {
    id: 207,
    userId: 3,
    taskId: 102,
    volunteeredAt: pastDate(1),
    status: 'PENDING',
  },
  {
    id: 208,
    userId: 4,
    taskId: 105,
    volunteeredAt: pastDate(0.5),
    status: 'PENDING',
  },
  {
    id: 209,
    userId: 5,
    taskId: 108,
    volunteeredAt: pastDate(0.4),
    status: 'PENDING',
  },
  {
    id: 210,
    userId: 1,
    taskId: 110,
    volunteeredAt: pastDate(2),
    status: 'PENDING',
  },
];

// Mock Review Data
export const mockReviews = [
  {
    id: 301,
    score: 5.0,
    comment: 'Excellent help with the plumbing issue! David was knowledgeable, efficient, and fixed the problem quickly. Highly recommend!',
    timestamp: pastDate(0.3),
    reviewerId: 3, // Emma (task creator)
    revieweeId: 4, // David (volunteer)
    taskId: 103,
  },
  {
    id: 302,
    score: 4.8,
    comment: 'Emma was very clear about what needed to be done and had all the necessary tools ready. Great experience helping with this repair.',
    timestamp: pastDate(0.3),
    reviewerId: 4, // David (volunteer)
    revieweeId: 3, // Emma (task creator)
    taskId: 103,
  },
  {
    id: 303,
    score: 4.7,
    comment: 'Olivia was super helpful with the moving process. Made everything much easier and was very careful with all my belongings.',
    timestamp: pastDate(0.5),
    reviewerId: 4, // David (task creator)
    revieweeId: 5, // Olivia (volunteer)
    taskId: 104,
  },
  {
    id: 304,
    score: 4.9,
    comment: 'Great experience helping David move. He was organized and appreciative of the help. Would definitely volunteer for him again!',
    timestamp: pastDate(0.5),
    reviewerId: 5, // Olivia (volunteer)
    revieweeId: 4, // David (task creator)
    taskId: 104,
  },
  {
    id: 305,
    score: 5.0,
    comment: 'Emma took fantastic care of my dog while I was away. Sent updates and photos daily. My pup was happy and well-exercised!',
    timestamp: pastDate(0.2),
    reviewerId: 1, // Sarah (task creator)
    revieweeId: 3, // Emma (volunteer)
    taskId: 106,
  },
  {
    id: 306,
    score: 4.9,
    comment: 'Loved walking Sarah\'s friendly dog. She provided clear instructions and everything I needed. The dog was a joy to walk!',
    timestamp: pastDate(0.2),
    reviewerId: 3, // Emma (volunteer)
    revieweeId: 1, // Sarah (task creator)
    taskId: 106,
  },
];

// Mock Notification Data
export const mockNotifications = [
  {
    id: 401,
    content: 'David Patel has volunteered for your task: Help fixing kitchen sink leak',
    timestamp: pastDate(0.7),
    type: 'VOLUNTEER_APPLIED',
    isRead: true,
    userId: 3, // Emma (task creator)
    relatedTaskId: 103,
  },
  {
    id: 402,
    content: 'Michael Chen has volunteered for your task: Help fixing kitchen sink leak',
    timestamp: pastDate(0.8),
    type: 'VOLUNTEER_APPLIED',
    isRead: true,
    userId: 3, // Emma (task creator)
    relatedTaskId: 103,
  },
  {
    id: 403,
    content: 'You have been assigned to task: Help fixing kitchen sink leak',
    timestamp: pastDate(0.7),
    type: 'TASK_ASSIGNED',
    isRead: true,
    userId: 4, // David (volunteer)
    relatedTaskId: 103,
  },
  {
    id: 404,
    content: 'Your volunteer application for task "Help fixing kitchen sink leak" was not selected',
    timestamp: pastDate(0.7),
    type: 'VOLUNTEER_REJECTED',
    isRead: false,
    userId: 2, // Michael (rejected volunteer)
    relatedTaskId: 103,
  },
  {
    id: 405,
    content: 'Olivia Kim has volunteered for your task: Moving boxes from storage unit to new apartment',
    timestamp: pastDate(1.5),
    type: 'VOLUNTEER_APPLIED',
    isRead: true,
    userId: 4, // David (task creator)
    relatedTaskId: 104,
  },
  {
    id: 406,
    content: 'You have been assigned to task: Moving boxes from storage unit to new apartment',
    timestamp: pastDate(1.5),
    type: 'TASK_ASSIGNED',
    isRead: true,
    userId: 5, // Olivia (volunteer)
    relatedTaskId: 104,
  },
  {
    id: 407,
    content: 'Task "Moving boxes from storage unit to new apartment" is now in progress',
    timestamp: pastDate(1),
    type: 'TASK_IN_PROGRESS',
    isRead: true,
    userId: 4, // David (task creator)
    relatedTaskId: 104,
  },
  {
    id: 408,
    content: 'Emma Rodriguez has volunteered for your task: Dog walking for one week',
    timestamp: pastDate(6),
    type: 'VOLUNTEER_APPLIED',
    isRead: true,
    userId: 1, // Sarah (task creator)
    relatedTaskId: 106,
  },
  {
    id: 409,
    content: 'You have been assigned to task: Dog walking for one week',
    timestamp: pastDate(6),
    type: 'TASK_ASSIGNED',
    isRead: true,
    userId: 3, // Emma (volunteer)
    relatedTaskId: 106,
  },
  {
    id: 410,
    content: 'Task "Dog walking for one week" has been marked as completed',
    timestamp: pastDate(1),
    type: 'TASK_COMPLETED',
    isRead: true,
    userId: 1, // Sarah (task creator)
    relatedTaskId: 106,
  },
  {
    id: 411,
    content: 'Task "Dog walking for one week" has been marked as completed',
    timestamp: pastDate(1),
    type: 'TASK_COMPLETED',
    isRead: true,
    userId: 3, // Emma (volunteer)
    relatedTaskId: 106,
  },
  {
    id: 412,
    content: 'You have received a 5-star review from Sarah Johnson for task "Dog walking for one week"',
    timestamp: pastDate(0.2),
    type: 'NEW_REVIEW',
    isRead: false,
    userId: 3, // Emma (reviewed)
    relatedTaskId: 106,
  },
  {
    id: 413,
    content: 'You have received a 4.9-star review from Emma Rodriguez for task "Dog walking for one week"',
    timestamp: pastDate(0.2),
    type: 'NEW_REVIEW',
    isRead: false,
    userId: 1, // Sarah (reviewed)
    relatedTaskId: 106,
  },
  {
    id: 414,
    content: 'Michael Chen has volunteered for your task: Need help with weekly grocery shopping',
    timestamp: pastDate(0.2),
    type: 'VOLUNTEER_APPLIED',
    isRead: false,
    userId: 1, // Sarah (task creator)
    relatedTaskId: 101,
  },
  {
    id: 415,
    content: 'Sarah Johnson has volunteered for your task: Urgent: Ride to medical appointment',
    timestamp: pastDate(0.3),
    type: 'VOLUNTEER_APPLIED',
    isRead: true,
    userId: 4, // David (task creator)
    relatedTaskId: 109,
  },
  {
    id: 416,
    content: 'You have been assigned to task: Urgent: Ride to medical appointment',
    timestamp: pastDate(0.3),
    type: 'TASK_ASSIGNED',
    isRead: false,
    userId: 1, // Sarah (volunteer)
    relatedTaskId: 109,
  },
  {
    id: 417,
    content: 'Task "Yard work and garden maintenance" has been cancelled by the creator',
    timestamp: pastDate(2),
    type: 'TASK_CANCELLED',
    isRead: true,
    userId: 2, // Michael (task creator)
    relatedTaskId: 107,
  },
  {
    id: 418,
    content: 'Emma Rodriguez has volunteered for your task: Math tutoring for high school student',
    timestamp: pastDate(1),
    type: 'VOLUNTEER_APPLIED',
    isRead: false,
    userId: 2, // Michael (task creator)
    relatedTaskId: 102,
  },
  {
    id: 419,
    content: 'David Patel has volunteered for your task: Deep clean kitchen and bathroom',
    timestamp: pastDate(0.5),
    type: 'VOLUNTEER_APPLIED',
    isRead: false,
    userId: 5, // Olivia (task creator)
    relatedTaskId: 105,
  },
  {
    id: 420,
    content: 'Olivia Kim has volunteered for your task: Assistance setting up new computer',
    timestamp: pastDate(0.4),
    type: 'VOLUNTEER_APPLIED',
    isRead: false,
    userId: 3, // Emma (task creator)
    relatedTaskId: 108,
  },
  {
    id: 421,
    content: 'Sarah Johnson has volunteered for your task: Reading buddy for elderly neighbor',
    timestamp: pastDate(2),
    type: 'VOLUNTEER_APPLIED',
    isRead: false,
    userId: 5, // Olivia (task creator)
    relatedTaskId: 110,
  },
];

// Mock Statistics
export const mockStatistics = {
  totalUsers: 215,
  totalTasks: 173,
  completedTasks: 97,
  activeVolunteers: 128,
  categoryCounts: {
    GROCERY_SHOPPING: 32,
    TUTORING: 28,
    HOME_REPAIR: 40,
    MOVING_HELP: 21,
    HOUSE_CLEANING: 35,
    OTHER: 17,
  },
  monthlyTasks: [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 15 },
    { month: 'Mar', count: 18 },
    { month: 'Apr', count: 22 },
    { month: 'May', count: 27 },
    { month: 'Jun', count: 33 },
    { month: 'Jul', count: 30 },
    { month: 'Aug', count: 25 },
    { month: 'Sep', count: 20 },
    { month: 'Oct', count: 17 },
    { month: 'Nov', count: 14 },
    { month: 'Dec', count: 10 },
  ],
};

// MOCK DATA SERVICE

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock service for tasks
 */
export const mockTaskService = {
  // Get all tasks with optional filtering
  async getTasks({ page = 1, limit = 10, status, category, creator, search }) {
    await delay(300); // Simulate network delay
    
    let filteredTasks = [...mockTasks];
    
    // Apply filters
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    if (category) {
      filteredTasks = filteredTasks.filter(task => task.category === category);
    }
    
    if (creator) {
      filteredTasks = filteredTasks.filter(task => task.creatorId === creator);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) || 
        task.description.toLowerCase().includes(searchLower) ||
        task.location.toLowerCase().includes(searchLower)
      );
    }
    
    // Calculate pagination
    const total = filteredTasks.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    
    return {
      tasks: paginatedTasks,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      }
    };
  },
  
  // Get a single task by ID
  async getTaskById(taskId) {
    await delay(300);
    const task = mockTasks.find(task => task.id === Number(taskId));
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Enhance task with creator and assignee details
    const enhancedTask = {
      ...task,
      creator: mockUsers.find(user => user.id === task.creatorId),
      assignee: task.assigneeId ? mockUsers.find(user => user.id === task.assigneeId) : null,
    };
    
    return enhancedTask;
  },
  
  // Create a new task
  async createTask(taskData, userId) {
    await delay(400);
    
    const newTask = {
      id: mockTasks.length + 101,
      ...taskData,
      status: 'POSTED',
      isRecurring: taskData.isRecurring || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      creatorId: userId,
      assigneeId: null,
    };
    
    mockTasks.push(newTask);
    return newTask;
  },
  
  // Update an existing task
  async updateTask(taskId, taskData) {
    await delay(400);
    
    const taskIndex = mockTasks.findIndex(task => task.id === Number(taskId));
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...mockTasks[taskIndex],
      ...taskData,
      updatedAt: new Date(),
    };
    
    mockTasks[taskIndex] = updatedTask;
    return updatedTask;
  },
  
  // Delete a task (or mark it as cancelled)
  async deleteTask(taskId) {
    await delay(300);
    
    const taskIndex = mockTasks.findIndex(task => task.id === Number(taskId));
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    // Actually delete or mark as cancelled
    const task = mockTasks[taskIndex];
    task.status = 'CANCELLED';
    task.updatedAt = new Date();
    
    return { success: true, message: 'Task cancelled successfully' };
  }
};

/**
 * Mock service for users
 */
export const mockUserService = {
  // Get a user by ID
  async getUserById(userId) {
    await delay(300);
    const user = mockUsers.find(user => user.id === Number(userId));
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  },
  
  // Get user profile with tasks and reviews
  async getUserProfile(userId) {
    await delay(500);
    const user = await this.getUserById(userId);
    
    // Get tasks created by user
    const createdTasks = mockTasks.filter(task => task.creatorId === user.id);
    
    // Get tasks assigned to user
    const assignedTasks = mockTasks.filter(task => task.assigneeId === user.id);
    
    // Get reviews received by user
    const receivedReviews = mockReviews.filter(review => review.revieweeId === user.id);
    
    // Calculate average rating from reviews
    let averageRating = 0;
    if (receivedReviews.length > 0) {
      averageRating = receivedReviews.reduce((sum, review) => sum + review.score, 0) / receivedReviews.length;
    }
    
    return {
      ...user,
      rating: averageRating || user.rating, // Use calculated rating or default
      createdTasks,
      assignedTasks,
      receivedReviews,
    };
  },
  
  // Update user profile
  async updateUserProfile(userId, userData) {
    await delay(400);
    
    const userIndex = mockUsers.findIndex(user => user.id === Number(userId));
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...mockUsers[userIndex],
      ...userData,
      // Don't allow updating certain fields
      id: mockUsers[userIndex].id,
      role: mockUsers[userIndex].role,
    };
    
    mockUsers[userIndex] = updatedUser;
    return updatedUser;
  }
};

/**
 * Mock service for volunteers
 */
export const mockVolunteerService = {
  // Get volunteers for a task
  async getTaskVolunteers(taskId, { page = 1, limit = 10, status }) {
    await delay(300);
    
    let filteredVolunteers = mockVolunteers.filter(volunteer => volunteer.taskId === Number(taskId));
    
    // Apply status filter if provided
    if (status) {
      filteredVolunteers = filteredVolunteers.filter(volunteer => volunteer.status === status);
    }
    
    // Enhance volunteers with user details
    const enhancedVolunteers = filteredVolunteers.map(volunteer => ({
      ...volunteer,
      user: mockUsers.find(user => user.id === volunteer.userId),
    }));
    
    // Paginate results
    const total = enhancedVolunteers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVolunteers = enhancedVolunteers.slice(startIndex, endIndex);
    
    return {
      volunteers: paginatedVolunteers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      }
    };
  },
  
  // Volunteer for a task
  async volunteerForTask(userId, taskId) {
    await delay(400);
    
    const task = mockTasks.find(task => task.id === Number(taskId));
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Check if task is still open for volunteers
    if (task.status !== 'POSTED') {
      throw new Error('This task is not accepting volunteers');
    }
    
    // Check if user is already volunteering
    const existingVolunteer = mockVolunteers.find(
      v => v.userId === Number(userId) && v.taskId === Number(taskId)
    );
    
    if (existingVolunteer) {
      return existingVolunteer;
    }
    
    // Create new volunteer entry
    const newVolunteer = {
      id: mockVolunteers.length + 201,
      userId: Number(userId),
      taskId: Number(taskId),
      volunteeredAt: new Date(),
      status: 'PENDING',
    };
    
    mockVolunteers.push(newVolunteer);
    
    // Create notification for task creator
    const creator = mockUsers.find(user => user.id === task.creatorId);
    const volunteer = mockUsers.find(user => user.id === userId);
    
    const notification = {
      id: mockNotifications.length + 401,
      content: `${volunteer.name} ${volunteer.surname} has volunteered for your task: ${task.title}`,
      timestamp: new Date(),
      type: 'VOLUNTEER_APPLIED',
      isRead: false,
      userId: creator.id,
      relatedTaskId: task.id,
    };
    
    mockNotifications.push(notification);
    
    return newVolunteer;
  },
  
  // Update volunteer status (accept or reject)
  async updateVolunteerStatus(volunteerId, status) {
    await delay(400);
    
    const volunteerIndex = mockVolunteers.findIndex(
      volunteer => volunteer.id === Number(volunteerId)
    );
    
    if (volunteerIndex === -1) {
      throw new Error('Volunteer not found');
    }
    
    const volunteer = mockVolunteers[volunteerIndex];
    
    if (status === 'ACCEPTED') {
      // Update volunteer status
      volunteer.status = status;
      
      // Update task status and assignee
      const taskIndex = mockTasks.findIndex(task => task.id === volunteer.taskId);
      if (taskIndex !== -1) {
        mockTasks[taskIndex].status = 'ASSIGNED';
        mockTasks[taskIndex].assigneeId = volunteer.userId;
      }
      
      // Reject all other pending volunteers for this task
      mockVolunteers.forEach(v => {
        if (v.taskId === volunteer.taskId && v.id !== volunteer.id && v.status === 'PENDING') {
          v.status = 'REJECTED';
          
          // Create rejection notification
          const rejectedNotification = {
            id: mockNotifications.length + 401,
            content: `Your volunteer application for task "${mockTasks[taskIndex].title}" was not selected`,
            timestamp: new Date(),
            type: 'VOLUNTEER_REJECTED',
            isRead: false,
            userId: v.userId,
            relatedTaskId: volunteer.taskId,
          };
          
          mockNotifications.push(rejectedNotification);
        }
      });
      
      // Create notification for accepted volunteer
      const volunteerUser = mockUsers.find(user => user.id === volunteer.userId);
      const task = mockTasks.find(task => task.id === volunteer.taskId);
      
      const acceptedNotification = {
        id: mockNotifications.length + 401,
        content: `You have been assigned to task: ${task.title}`,
        timestamp: new Date(),
        type: 'TASK_ASSIGNED',
        isRead: false,
        userId: volunteerUser.id,
        relatedTaskId: task.id,
      };
      
      mockNotifications.push(acceptedNotification);
    } else if (status === 'REJECTED') {
      // Update volunteer status
      volunteer.status = status;
      
      // Create rejection notification
      const volunteerUser = mockUsers.find(user => user.id === volunteer.userId);
      const task = mockTasks.find(task => task.id === volunteer.taskId);
      
      const rejectedNotification = {
        id: mockNotifications.length + 401,
        content: `Your volunteer application for task "${task.title}" was not selected`,
        timestamp: new Date(),
        type: 'VOLUNTEER_REJECTED',
        isRead: false,
        userId: volunteerUser.id,
        relatedTaskId: task.id,
      };
      
      mockNotifications.push(rejectedNotification);
    }
    
    return mockVolunteers[volunteerIndex];
  },
  
  // Get tasks a user has volunteered for
  async getUserVolunteeredTasks(userId, { page = 1, limit = 10, status }) {
    await delay(300);
    
    let filteredVolunteers = mockVolunteers.filter(
      volunteer => volunteer.userId === Number(userId)
    );
    
    // Apply status filter if provided
    if (status) {
      filteredVolunteers = filteredVolunteers.filter(
        volunteer => volunteer.status === status
      );
    }
    
    // Enhance volunteers with task details
    const enhancedVolunteers = filteredVolunteers.map(volunteer => {
      const task = mockTasks.find(task => task.id === volunteer.taskId);
      const creator = mockUsers.find(user => user.id === task.creatorId);
      
      return {
        ...volunteer,
        task: {
          ...task,
          creator,
        }
      };
    });
    
    // Paginate results
    const total = enhancedVolunteers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVolunteers = enhancedVolunteers.slice(startIndex, endIndex);
    
    return {
      volunteeredTasks: paginatedVolunteers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      }
    };
  }
};

/**
 * Mock service for notifications
 */
export const mockNotificationService = {
  // Get user notifications
  async getUserNotifications(userId, { page = 1, limit = 10, isRead }) {
    await delay(300);
    
    let filteredNotifications = mockNotifications.filter(
      notification => notification.userId === Number(userId)
    );
    
    // Apply isRead filter if provided
    if (isRead !== undefined) {
      filteredNotifications = filteredNotifications.filter(
        notification => notification.isRead === isRead
      );
    }
    
    // Sort by timestamp (newest first)
    filteredNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Enhance notifications with related task details if available
    const enhancedNotifications = filteredNotifications.map(notification => {
      const enhancedNotification = { ...notification };
      
      if (notification.relatedTaskId) {
        enhancedNotification.relatedTask = mockTasks.find(
          task => task.id === notification.relatedTaskId
        );
      }
      
      return enhancedNotification;
    });
    
    // Paginate results
    const total = enhancedNotifications.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = enhancedNotifications.slice(startIndex, endIndex);
    
    return {
      notifications: paginatedNotifications,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      }
    };
  },
  
  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    await delay(200);
    
    const notificationIndex = mockNotifications.findIndex(
      notification => notification.id === Number(notificationId)
    );
    
    if (notificationIndex === -1) {
      throw new Error('Notification not found');
    }
    
    mockNotifications[notificationIndex].isRead = true;
    
    return mockNotifications[notificationIndex];
  },
  
  // Mark all notifications as read
  async markAllNotificationsAsRead(userId) {
    await delay(300);
    
    mockNotifications.forEach(notification => {
      if (notification.userId === Number(userId)) {
        notification.isRead = true;
      }
    });
    
    return { success: true, message: 'All notifications marked as read' };
  }
};

/**
 * Mock service for reviews
 */
export const mockReviewService = {
  // Get reviews for a user
  async getUserReviews(userId, { page = 1, limit = 10 }) {
    await delay(300);
    
    const userReviews = mockReviews.filter(
      review => review.revieweeId === Number(userId)
    );
    
    // Enhance reviews with reviewer and task details
    const enhancedReviews = userReviews.map(review => {
      const reviewer = mockUsers.find(user => user.id === review.reviewerId);
      const task = mockTasks.find(task => task.id === review.taskId);
      
      return {
        ...review,
        reviewer,
        task,
      };
    });
    
    // Sort by timestamp (newest first)
    enhancedReviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Paginate results
    const total = enhancedReviews.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = enhancedReviews.slice(startIndex, endIndex);
    
    return {
      reviews: paginatedReviews,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      }
    };
  },
  
  // Get reviews for a task
  async getTaskReviews(taskId) {
    await delay(300);
    
    const taskReviews = mockReviews.filter(
      review => review.taskId === Number(taskId)
    );
    
    // Enhance reviews with reviewer and reviewee details
    const enhancedReviews = taskReviews.map(review => {
      const reviewer = mockUsers.find(user => user.id === review.reviewerId);
      const reviewee = mockUsers.find(user => user.id === review.revieweeId);
      
      return {
        ...review,
        reviewer,
        reviewee,
      };
    });
    
    return enhancedReviews;
  },
  
  // Create a new review
  async createReview(reviewData) {
    await delay(400);
    
    const { reviewerId, revieweeId, taskId, score, comment } = reviewData;
    
    // Check if review already exists
    const existingReview = mockReviews.find(
      review => 
        review.reviewerId === Number(reviewerId) &&
        review.revieweeId === Number(revieweeId) &&
        review.taskId === Number(taskId)
    );
    
    if (existingReview) {
      throw new Error('You have already reviewed this user for this task');
    }
    
    // Create new review
    const newReview = {
      id: mockReviews.length + 301,
      score,
      comment,
      timestamp: new Date(),
      reviewerId: Number(reviewerId),
      revieweeId: Number(revieweeId),
      taskId: Number(taskId),
    };
    
    mockReviews.push(newReview);
    
    // Create notification for reviewee
    const reviewer = mockUsers.find(user => user.id === Number(reviewerId));
    const task = mockTasks.find(task => task.id === Number(taskId));
    
    const notification = {
      id: mockNotifications.length + 401,
      content: `You have received a ${score}-star review from ${reviewer.name} ${reviewer.surname} for task "${task.title}"`,
      timestamp: new Date(),
      type: 'NEW_REVIEW',
      isRead: false,
      userId: Number(revieweeId),
      relatedTaskId: Number(taskId),
    };
    
    mockNotifications.push(notification);
    
    // Update user rating
    const userIndex = mockUsers.findIndex(user => user.id === Number(revieweeId));
    if (userIndex !== -1) {
      const user = mockUsers[userIndex];
      const userReviews = mockReviews.filter(review => review.revieweeId === user.id);
      const averageRating = userReviews.reduce((sum, review) => sum + review.score, 0) / userReviews.length;
      mockUsers[userIndex].rating = Math.round(averageRating * 10) / 10; // Round to 1 decimal place
    }
    
    return newReview;
  }
};

/**
 * Mock service for categories
 */
export const mockCategoryService = {
  // Get all categories
  async getAllCategories() {
    await delay(200);
    
    return Object.keys(categoryMapping).map(key => ({
      id: key,
      name: categoryMapping[key].name,
      icon: categoryMapping[key].icon,
      description: categoryMapping[key].description,
      image: categoryMapping[key].image
    }));
  },
  
  // Get tasks by category
  async getTasksByCategory(categoryId, { page = 1, limit = 10 }) {
    await delay(300);
    
    const filteredTasks = mockTasks.filter(
      task => task.category === categoryId && task.status === 'POSTED'
    );
    
    // Paginate results
    const total = filteredTasks.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    
    // Enhance tasks with creator details
    const enhancedTasks = paginatedTasks.map(task => ({
      ...task,
      creator: mockUsers.find(user => user.id === task.creatorId),
    }));
    
    return {
      tasks: enhancedTasks,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      }
    };
  }
};

// Export mockServices object
export const mockServices = {
  tasks: mockTaskService,
  users: mockUserService,
  volunteers: mockVolunteerService,
  notifications: mockNotificationService,
  reviews: mockReviewService,
  categories: mockCategoryService,
};

export default mockServices;
