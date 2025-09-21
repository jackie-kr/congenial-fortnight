// App.tsx - Main application component
import React, { useState, useEffect, JSX } from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { storage } from '../../components/fallback-storage';

// Import screens
import CalendarScreen from './screens/CalendarScreen';
import JournalScreen from './screens/JournalScreen';
import ResourcesScreen from './screens/ResourcesScreen';
import SettingsScreen from './screens/SettingsScreen';

// Types
export interface UserPreferences {
  pronouns: string;
  goals: string[];
  reminderTime: string;
  notifications: boolean;
  stealthMode: boolean;
  motivationalMessages: boolean;
  customPronouns?: string;
}

type TabParamList = {
  Calendar: { userPreferences: UserPreferences; saveUserPreferences: (prefs: UserPreferences) => void };
  Journal: { userPreferences: UserPreferences };
  Resources: undefined;
  Settings: { userPreferences: UserPreferences; saveUserPreferences: (prefs: UserPreferences) => void };
};

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false
  }),
});

const Tab = createBottomTabNavigator<TabParamList>();

// const storage = new FallbackStorage();

export default function App(): JSX.Element {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    pronouns: '',
    goals: [],
    reminderTime: '09:00',
    notifications: true,
    stealthMode: false,
    motivationalMessages: true,
  });

  useEffect(() => {
    // Load user preferences on app start
    loadUserPreferences();
    
    // Request notification permissions
    requestNotificationPermissions();
  }, []);

  const loadUserPreferences = async (): Promise<void> => {
    try {
      const saved = await storage.getItem('userPreferences');
      if (saved) {
        setUserPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading preferences:', error);
    }
  };

  const saveUserPreferences = async (newPreferences: UserPreferences): Promise<void> => {
    try {
      await storage.setItem('userPreferences', JSON.stringify(newPreferences));
      setUserPreferences(newPreferences);
    } catch (error) {
      console.log('Error saving preferences:', error);
    }
  };

  const requestNotificationPermissions = async (): Promise<void> => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission denied');
    }
  };

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              switch (route.name) {
                case 'Calendar':
                  iconName = focused ? 'calendar' : 'calendar-outline';
                  break;
                case 'Journal':
                  iconName = focused ? 'book' : 'book-outline';
                  break;
                case 'Resources':
                  iconName = focused ? 'library' : 'library-outline';
                  break;
                case 'Settings':
                  iconName = focused ? 'settings' : 'settings-outline';
                  break;
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#6B46C1',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#6B46C1',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Calendar" 
            component={CalendarScreen}
            initialParams={{ userPreferences, saveUserPreferences }}
          />
          <Tab.Screen 
            name="Journal" 
            component={JournalScreen}
            initialParams={{ userPreferences }}
          />
          <Tab.Screen 
            name="Resources" 
            component={ResourcesScreen}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen}
            initialParams={{ userPreferences, saveUserPreferences }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}