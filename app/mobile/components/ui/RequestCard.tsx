import React from 'react';
import { View, Text, /*Image,*/ StyleSheet, useColorScheme, TouchableOpacity } from 'react-native'; // Commented out Image
import { useTheme } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export interface RequestCardProps {
  title?: any; // Loosen type for debugging, parent should still aim for string
  distance?: string;
  time?: string;
  // imageUrl: string | number; // Removed imageUrl
  category?: string;
  urgencyLevel?: string; // e.g., "High", "Medium", "Low", "Past"
  status?: string; // e.g., "Completed", "Accepted", "Pending", "Rejected", or a rating string for "Past"
  onPress?: () => void;
}

const RequestCard: React.FC<RequestCardProps> = (props) => {
  let displayTitle: string;

  if (typeof props.title === 'string' && props.title.trim() !== '') {
    displayTitle = props.title;
  } else {
    // Log if title is not a valid string, then use a default
    console.warn('[RequestCard] Invalid or missing title prop. Received:', props.title, '(type:', typeof props.title, '). Using default.');
    displayTitle = "Default Card Title";
  }

  const { colors } = useTheme(); // colors from @react-navigation/native theme
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light']; // Our comprehensive theme colors

  // Helper function to get status/urgency specific colors from themeColors
  const getLabelColors = (type: string, property: 'Background' | 'Text' | 'Border') => {
    const sType = String(type || ''); // Ensure type is a string
    const capitalizedType = sType.charAt(0).toUpperCase() + sType.slice(1);
    const key = `status${capitalizedType}${property}` as keyof typeof themeColors;
    
    const sUrgencyLevel = String(props.urgencyLevel || ''); // Ensure urgencyLevel is a string for fallback logic
    const effectiveType = sUrgencyLevel === 'Past' && property !== 'Text' ? 'Past' : capitalizedType;
    const fallbackKeyBase = `status${sUrgencyLevel === 'Past' ? 'Past' : effectiveType}`;

    return themeColors[key] || themeColors[`${fallbackKeyBase}${property}` as keyof typeof themeColors] || 
           (property === 'Text' ? themeColors.text : 
            property === 'Background' ? 'transparent' : themeColors.border);
  };

  // Determine colors for Urgency Label
  const urgencyLabelTextColor = getLabelColors(props.urgencyLevel || '', 'Text');
  const urgencyLabelBackgroundColor = getLabelColors(props.urgencyLevel || '', 'Background');
  const urgencyLabelBorderColor = getLabelColors(props.urgencyLevel || '', 'Border');

  // Determine colors for Status Label
  // If urgency is 'Past', status is a rating. We use 'Past' styling for its label.
  const sStatus = String(props.status || ''); // Ensure status is a string
  const sUrgencyLevelString = String(props.urgencyLevel || ''); // Ensure urgencyLevel is a string for comparison

  const statusTypeForColor = sUrgencyLevelString === 'Past' ? 'Past' : sStatus;
  const statusLabelTextColor = getLabelColors(statusTypeForColor, 'Text');
  const statusLabelBackgroundColor = getLabelColors(statusTypeForColor, 'Background');
  const statusLabelBorderColor = getLabelColors(statusTypeForColor, 'Border');


  return (
    <View style={[styles.cardContainer, { backgroundColor: themeColors.card }]}> {/* Use themeColors.card */}
      <View style={styles.topContainer}>
        {/* Image component removed */}
        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>{displayTitle}</Text>
          <Text style={[styles.distanceTimeText, { color: themeColors.textMuted }]} numberOfLines={1}>{`${String(props.distance || '')} • ${String(props.time || '')}`}</Text>
          <Text 
            style={[
                styles.categoryLabel,
                { color: themeColors.primary, backgroundColor: themeColors.lightPurple }
            ]}
            numberOfLines={1}
          >
            {String(props.category || 'Unknown')}
          </Text>
        </View>
        <TouchableOpacity onPress={props.onPress} disabled={!props.onPress}>
          <Ionicons name="chevron-forward-outline" size={25} color={themeColors.primary} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.bottomContainer}>
        {/* Urgency Label */}
        <Text
          style={[
            styles.label,
            {
              color: urgencyLabelTextColor,
              backgroundColor: urgencyLabelBackgroundColor,
              borderColor: urgencyLabelBorderColor,
              borderWidth: 1,
            },
          ]}
        >
          {String(props.urgencyLevel || '') === 'Past' ? String(props.urgencyLevel || '') : `${String(props.urgencyLevel || '')} Urgency`}
        </Text>

        {/* Status Label */}
        {/* Only show status label if urgency is not 'Past'. If 'Past', the status is the rating shown in urgency. */}
        {String(props.urgencyLevel || '') !== 'Past' && (
            <Text
            style={[
                styles.label,
                {
                color: statusLabelTextColor,
                backgroundColor: statusLabelBackgroundColor,
                borderColor: statusLabelBorderColor,
                borderWidth: 1,
                },
            ]}
            >
            {typeof props.status === 'object' ? JSON.stringify(props.status) : String(props.status || '')} 
            </Text>
        )}
        {/* If urgency is 'Past', display the rating (status prop) with specific styling */}
        {String(props.urgencyLevel || '') === 'Past' && (
             <Text
             style={[
               styles.label,
               {
                 color: getLabelColors('Past', 'Text'), 
                 backgroundColor: getLabelColors('Past', 'Background'), 
                 borderColor: getLabelColors('Past', 'Border'), 
                 borderWidth: 1,
               },
             ]}
           >
             {`☆ ${String(props.status || '')}`} {/* Assuming status is the rating string when urgency is Past */}
           </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'column',
    borderRadius: 12, // Slightly smaller radius
    width: '90%',
    alignSelf: 'center', // Center card
    marginBottom: 16,
    shadowColor: '#000', // Basic shadow for depth, consider theme-specific shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12, // Added for symmetric vertical padding
  },
  // cardImage style removed
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    // marginRight: 40, // Stays commented out or removed
  },
  title: {
    fontWeight: '600',
    fontSize: 16, // Slightly larger title
    marginBottom: 2,
  },
  distanceTimeText: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 4, // Adjusted spacing
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8, // Add horizontal padding
    alignSelf: 'flex-start', // Ensure it only takes needed width
    overflow: 'hidden', // For numberOfLines to work with padding
    marginTop: 2,
  },
  icon: {
    marginLeft: 8, // Add some space before icon
  },
  bottomContainer: {
    flexDirection: 'row',
    // alignItems: 'center', // Not always needed if labels have same height
    // justifyContent: 'center', // Changed to flex-start
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    marginTop: 8, // Increased top margin for separation
    marginBottom: 12,
  },
  label: {
    textAlign: 'center',
    paddingVertical: 4, // Increased padding
    paddingHorizontal: 10, // Increased padding
    marginRight: 8,
    fontSize: 12,
    fontWeight: '500', // Slightly bolder
    borderRadius: 6,
    // width: 120, // Removed fixed width to allow dynamic sizing
    overflow: 'hidden', // Ensure text within rounded corners
  },
  // urgencyText: { // This style was unused
  //   fontSize: 12,
  //   fontWeight: '500',
  // },
  cardContainerError: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: 'pink',
    borderColor: 'red',
    borderWidth: 1,
    width: '90%',
    alignSelf: 'center',
  },
  titleText: {
    fontSize: 16,
    color: '#000',
  }
});

export default RequestCard; 