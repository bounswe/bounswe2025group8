import React from 'react';
import { SafeAreaView, ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import SearchBarWithResults, { Category, Request, Profile } from '../components/ui/SearchBarWithResults';

export default function SearchPage() {
  const router = useRouter();

  // Static data (should be shared or imported from a data file in a real app)
  const categories: Category[] = [
    { id: '1', title: 'House Cleaning', image: require('../assets/images/house_cleaning.png'), count: 21 },
    { id: '2', title: 'Healthcare',     image: require('../assets/images/healthcare.png'), count: 15 },
    { id: '3', title: 'Tutoring',       image: require('../assets/images/tutoring.png'), count: 12 },
    { id: '4', title: 'Shopping',       image: require('../assets/images/shopping.png'), count: 9  },
    { id: '5', title: 'Car Driver',     image: require('../assets/images/car_driver.png'), count: 8  },
    { id: '6', title: 'Home Repair',    image: require('../assets/images/home_repair.png'), count: 5  },
    { id: '7', title: 'Car Repair',     image: require('../assets/images/car_repair.png'), count: 3  },
  ];
  const requests: Request[] = [
    { id: 'a', title: 'Help for my math exam', urgency: 'Medium', meta: '550 m • 10 hours ago', category: 'Tutoring', image: require('../assets/images/help.png') },
    { id: 'b', title: 'Help me see a doctor', urgency: 'High', meta: '2 km • 3 hours ago', category: 'Healthcare', image: require('../assets/images/help.png') },
    { id: 'c', title: 'I need to clean my house', urgency: 'Low', meta: '750 m • 22 hours ago', category: 'House Cleaning', image: require('../assets/images/help.png') },
    { id: 'd', title: 'Grocery shopping', urgency: 'Medium', meta: '900 m • 18 hours ago', category: 'Shopping', image: require('../assets/images/help.png') },
    { id: 'e', title: 'Need help with yard work', urgency: 'Medium', meta: '2.5 km • 1 day ago', category: 'Uncategorized', image: require('../assets/images/help.png') },
    { id: 'f', title: 'I need to wash my car', urgency: 'Low', meta: '650 m • 2 days ago', category: 'Uncategorized', image: require('../assets/images/help.png') },
  ];
  const profiles: Profile[] = [
    { id: 'p1', name: 'John Doe' },
    { id: 'p2', name: 'Jane Smith' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 36 }}>
      <SearchBarWithResults
        categories={categories}
        requests={requests}
        profiles={profiles}
        onSelect={(item, tab) => {
          if (tab === 'Categories') router.push('/category/' + item.id as any);
          else if (tab === 'Requests') router.push('/request/' + item.id as any);
          else if (tab === 'Profiles') router.push('/profile/' + item.id as any);
        }}
      />
    </SafeAreaView>
  );
} 