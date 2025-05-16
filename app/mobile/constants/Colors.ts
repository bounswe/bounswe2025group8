/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';
const pink = '#E8618C';

export const Colors = {
  light: {
    text: '#11181C',
    textMuted: '#687076',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#6C63FF', // A nice purple
    secondary: '#FF6584', // A nice pink
    accent: '#4CAF50', // A nice green
    gray: '#f0f0f0',
    lightGray: '#f9f9f9',
    darkGray: '#333',
    pink: '#FFC0CB',
    lightPink: '#FFD1DC',
    purple: '#E6E6FA',
    lightPurple: '#F3F2FF',
    card: '#FFFFFF',
    cardUnread: '#F3F2FF',
    border: '#E0E0E0',
    error: '#D32F2F', // Standard red for errors
    // Status & Urgency Colors - Light Theme
    statusHighBackground: '#FFEBEE', // Light Red
    statusHighText: '#D32F2F',
    statusMediumBackground: '#FFF8E1', // Light Amber
    statusMediumText: '#FFA000',
    statusLowBackground: '#E8F5E9', // Light Green
    statusLowText: '#388E3C',
    statusCompletedBackground: '#E3F2FD', // Light Blue
    statusCompletedText: '#1976D2',
    statusCancelledBackground: '#F5F5F5', // Light Grey
    statusCancelledText: '#757575',
    statusExpiredBackground: '#ECEFF1', // Blue Grey Lighten-5
    statusExpiredText: '#546E7A',
    statusAssignedBackground: '#E1F5FE', // Light Cyan
    statusAssignedText: '#0288D1',
    statusInProgressBackground: '#FFF3E0', // Light Orange
    statusInProgressText: '#F57C00',
    statusPostedBackground: '#E8EAF6', // Indigo Lighten-5
    statusPostedText: '#3949AB',
    statusGenericBackground: '#F5F5F5', // Light Grey for default/other statuses
    statusGenericText: '#757575',
    statusPastBackground: '#F5F5F5', // Added for Past status
    statusPastText: '#757575',       // Added for Past status
    statusPastBorder: '#E0E0E0',     // Added for Past status

    urgencyHighBackground: '#FFCDD2', // Light Pink/Red
    urgencyHighText: '#D32F2F',
    urgencyMediumBackground: '#FFE0B2', // Light Orange
    urgencyMediumText: '#F57C00',
    urgencyLowBackground: '#C8E6C9', // Light Green
    urgencyLowText: '#388E3C',

    labelDefaultBackground: '#E0E0E0', // Default background for labels if specific not found
    labelDefaultText: '#333333', // Default text color for labels
    labelDefaultBorder: '#E0E0E0', // Added default border for labels
    
    // Specific for RequestCard status/urgency colors (if different from generic ones)
    // Example: 
    // requestCardStatusOpenBg: '#e6ffee', 
    // requestCardStatusOpenText: '#008000',

  },
  dark: {
    text: '#ECEDEE',
    textMuted: '#9A9FA5',
    background: '#121212', // Darker background for true dark mode
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#7F77FF', // Slightly lighter purple for dark mode
    secondary: '#FF87A1', // Slightly lighter pink
    accent: '#66BB6A', // Slightly lighter green
    gray: '#2c2c2e', // Dark gray
    lightGray: '#1c1c1e', // Very dark gray, for subtle backgrounds
    darkGray: '#eaeaea', // Light gray for text on dark backgrounds
    pink: '#FFC0CB', // Pink might need adjustment based on background
    lightPink: '#FFD1DC', // Same here
    purple: '#5A5499', // Darker purple for cards or elements
    lightPurple: '#2A284D',
    card: '#1E1E1E', // Dark card color
    cardUnread: '#2A284D', // Slightly different for unread items
    border: '#3A3A3C', // Dark border color
    error: '#EF5350', // Lighter/brighter red for dark backgrounds
    // Status & Urgency Colors - Dark Theme
    statusHighBackground: '#4E3436', // Darker Red
    statusHighText: '#FF8A80', // Light Red text
    statusMediumBackground: '#544B3E', // Darker Amber
    statusMediumText: '#FFD180', // Light Amber text
    statusLowBackground: '#3E4B3F', // Darker Green
    statusLowText: '#A5D6A7', // Light Green text
    statusCompletedBackground: '#3A4C5A', // Darker Blue
    statusCompletedText: '#82B1FF', // Light Blue text
    statusCancelledBackground: '#424242', // Darker Grey
    statusCancelledText: '#BDBDBD', // Light Grey text
    statusExpiredBackground: '#424547', // Darker Blue Grey
    statusExpiredText: '#B0BEC5',
    statusAssignedBackground: '#364F5A', // Darker Cyan
    statusAssignedText: '#80D8FF',
    statusInProgressBackground: '#544A3E', // Darker Orange
    statusInProgressText: '#FFAB40',
    statusPostedBackground: '#3F4358', // Darker Indigo
    statusPostedText: '#9FA8DA',
    statusGenericBackground: '#424242', // Darker Grey for default/other statuses
    statusGenericText: '#BDBDBD',
    statusPastBackground: '#424242', // Added for Past status (dark)
    statusPastText: '#BDBDBD',       // Added for Past status (dark)
    statusPastBorder: '#3A3A3C',     // Added for Past status (dark)
    
    urgencyHighBackground: '#D32F2F', // Darker Pink/Red
    urgencyHighText: '#FFCDD2',
    urgencyMediumBackground: '#F57C00', // Darker Orange
    urgencyMediumText: '#FFE0B2',
    urgencyLowBackground: '#388E3C', // Darker Green
    urgencyLowText: '#C8E6C9',

    labelDefaultBackground: '#383838',
    labelDefaultText: '#F5F5F5',
    labelDefaultBorder: '#3A3A3C', // Added default border for labels (dark theme)
  },
};
