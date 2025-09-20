// screens/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { UserPreferences } from '../types';

interface SettingsScreenProps {
  route: RouteProp<{
    params: {
      userPreferences: UserPreferences;
      saveUserPreferences: (prefs: UserPreferences) => void;
    };
  }, 'params'>;
}

interface EditingState {
  pronouns: boolean;
  goals: boolean;
  reminderTime: boolean;
}

type PronounOption = 'she/her' | 'he/him' | 'they/them' | 'xe/xir' | 'ze/zir' | 'custom';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ route }) => {
  const { userPreferences, saveUserPreferences } = route.params || {};
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(userPreferences || {
    pronouns: '',
    goals: [],
    reminderTime: '09:00',
    notifications: true,
    stealthMode: false,
    motivationalMessages: true,
  });

  const [isEditing, setIsEditing] = useState<EditingState>({
    pronouns: false,
    goals: false,
    reminderTime: false,
  });

  const pronounOptions: PronounOption[] = [
    'she/her', 'he/him', 'they/them', 'xe/xir', 'ze/zir', 'custom'
  ];

  const goalOptions: string[] = [
    'Start HRT',
    'Find therapist',
    'Legal name change',
    'Voice training',
    'Social transition',
    'Medical transition',
    'Build support network',
    'Self-acceptance',
  ];

  const handleSave = (): void => {
    if (saveUserPreferences) {
      saveUserPreferences(localPreferences);
      Alert.alert('Settings Saved! ✨', 'Your preferences have been updated');
    }
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ): void => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateEditingState = (key: keyof EditingState, value: boolean): void => {
    setIsEditing(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleGoal = (goal: string): void => {
    const updatedGoals = localPreferences.goals.includes(goal)
      ? localPreferences.goals.filter(g => g !== goal)
      : [...localPreferences.goals, goal];
    
    updatePreference('goals', updatedGoals);
  };

  interface SettingSectionProps {
    title: string;
    children: React.ReactNode;
  }

  const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  interface SettingRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }

  const SettingRow: React.FC<SettingRowProps> = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent 
  }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color="#6B46C1" style={styles.settingIcon} />
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  interface PronounOptionButtonProps {
    pronoun: PronounOption;
    isSelected: boolean;
    onPress: (pronoun: PronounOption) => void;
  }

  const PronounOptionButton: React.FC<PronounOptionButtonProps> = ({ 
    pronoun, 
    isSelected, 
    onPress 
  }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        isSelected && styles.selectedOption
      ]}
      onPress={() => onPress(pronoun)}
    >
      <Text style={[
        styles.optionText,
        isSelected && styles.selectedOptionText
      ]}>
        {pronoun}
      </Text>
    </TouchableOpacity>
  );

  interface GoalOptionProps {
    goal: string;
    isSelected: boolean;
    onToggle: (goal: string) => void;
  }

  const GoalOption: React.FC<GoalOptionProps> = ({ goal, isSelected, onToggle }) => (
    <TouchableOpacity
      style={[
        styles.goalOption,
        isSelected && styles.selectedGoal
      ]}
      onPress={() => onToggle(goal)}
    >
      <Text style={[
        styles.goalText,
        isSelected && styles.selectedGoalText
      ]}>
        {goal}
      </Text>
      {isSelected && (
        <Ionicons name="checkmark" size={16} color="#ffffff" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your Bloom experience</Text>
      </View>

      <SettingSection title="🏳️‍⚧️ Identity">
        <SettingRow
          icon="person"
          title="Pronouns"
          subtitle={localPreferences.pronouns || "Not set"}
          rightComponent={
            <TouchableOpacity
              onPress={() => updateEditingState('pronouns', !isEditing.pronouns)}
            >
              <Ionicons name="create-outline" size={20} color="#6B7280" />