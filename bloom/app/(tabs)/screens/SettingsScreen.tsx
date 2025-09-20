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
    Settings: {
      userPreferences: UserPreferences;
      saveUserPreferences: (prefs: UserPreferences) => void;
    };
  }, 'Settings'>;
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

  const [customPronoun, setCustomPronoun] = useState<string>('');

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

  const handlePronounSelect = (pronoun: PronounOption): void => {
    if (pronoun === 'custom') {
      setCustomPronoun('');
    } else {
      updatePreference('pronouns', pronoun);
      updateEditingState('pronouns', false);
    }
  };

  const handleCustomPronounSave = (): void => {
    if (customPronoun.trim()) {
      updatePreference('pronouns', customPronoun.trim());
      updateEditingState('pronouns', false);
      setCustomPronoun('');
    }
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
            </TouchableOpacity>
          }
        />
        
        {isEditing.pronouns && (
          <View style={styles.editingContainer}>
            <View style={styles.optionsContainer}>
              {pronounOptions.map((pronoun) => (
                <PronounOptionButton
                  key={pronoun}
                  pronoun={pronoun}
                  isSelected={localPreferences.pronouns === pronoun}
                  onPress={handlePronounSelect}
                />
              ))}
            </View>
            
            {localPreferences.pronouns === 'custom' || 
             (pronounOptions.find(p => p === localPreferences.pronouns) === undefined && 
              localPreferences.pronouns !== '') ? (
              <View style={styles.customPronounInput}>
                <TextInput
                  style={styles.textInput}
                  value={customPronoun || localPreferences.pronouns}
                  onChangeText={setCustomPronoun}
                  placeholder="Enter custom pronouns"
                  onSubmitEditing={handleCustomPronounSave}
                />
              </View>
            ) : null}
          </View>
        )}

        <SettingRow
          icon="flag"
          title="Goals"
          subtitle={`${localPreferences.goals.length} selected`}
          rightComponent={
            <TouchableOpacity
              onPress={() => updateEditingState('goals', !isEditing.goals)}
            >
              <Ionicons name="create-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          }
        />
        
        {isEditing.goals && (
          <View style={styles.goalsContainer}>
            {goalOptions.map((goal) => (
              <GoalOption
                key={goal}
                goal={goal}
                isSelected={localPreferences.goals.includes(goal)}
                onToggle={toggleGoal}
              />
            ))}
          </View>
        )}
      </SettingSection>

      <SettingSection title="🔔 Notifications">
        <SettingRow
          icon="notifications"
          title="Push Notifications"
          subtitle="Get reminders and updates"
          rightComponent={
            <View style={styles.switchContainer}>
              <Switch
                value={localPreferences.notifications}
                onValueChange={(value) => updatePreference('notifications', value)}
                trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
                thumbColor={localPreferences.notifications ? '#6B46C1' : '#F3F4F6'}
              />
            </View>
          }
        />

        <SettingRow
          icon="time"
          title="Reminder Time"
          subtitle={localPreferences.reminderTime}
          rightComponent={
            <TouchableOpacity 
              style={styles.timePickerButton}
              onPress={() => updateEditingState('reminderTime', !isEditing.reminderTime)}
            >
              <Text style={styles.timePickerText}>Change</Text>
            </TouchableOpacity>
          }
        />

        <SettingRow
          icon="chatbubble-ellipses"
          title="Motivational Messages"
          subtitle="Daily encouragement and tips"
          rightComponent={
            <View style={styles.switchContainer}>
              <Switch
                value={localPreferences.motivationalMessages}
                onValueChange={(value) => updatePreference('motivationalMessages', value)}
                trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
                thumbColor={localPreferences.motivationalMessages ? '#6B46C1' : '#F3F4F6'}
              />
            </View>
          }
        />
      </SettingSection>

      <SettingSection title="🛡️ Privacy">
        <SettingRow
          icon="eye-off"
          title="Stealth Mode"
          subtitle="Hide app icon and notifications"
          rightComponent={
            <View style={styles.switchContainer}>
              <Switch
                value={localPreferences.stealthMode}
                onValueChange={(value) => updatePreference('stealthMode', value)}
                trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
                thumbColor={localPreferences.stealthMode ? '#6B46C1' : '#F3F4F6'}
              />
            </View>
          }
        />
      </SettingSection>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6B46C1',
    backgroundColor: '#ffffff',
  },
  selectedOption: {
    backgroundColor: '#6B46C1',
  },
  optionText: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6B46C1',
    backgroundColor: '#ffffff',
  },
  selectedGoal: {
    backgroundColor: '#6B46C1',
  },
  goalText: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '500',
    flex: 1,
  },
  selectedGoalText: {
    color: '#ffffff',
  },
  editingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  goalsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#6B46C1',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    marginLeft: 8,
  },
  timePickerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    marginLeft: 8,
  },
  timePickerText: {
    color: '#6B46C1',
    fontSize: 14,
    fontWeight: '500',
  },
  customPronounInput: {
    marginHorizontal: 20,
    marginVertical: 8,
  }
});

export default SettingsScreen;

    // <ScrollView style={styles.container}>
    //   <View style={styles.header}>
    //     <Text style={styles.headerTitle}>Settings</Text>
    //     <Text style={styles.headerSubtitle}>Customize your Bloom experience</Text>
    //   </View>

    //   <SettingSection title="🏳️‍⚧️ Identity">
    //     <SettingRow
    //       icon="person"
    //       title="Pronouns"
    //       subtitle={localPreferences.pronouns || "Not set"}
    //       rightComponent={
    //         <TouchableOpacity
    //           onPress={() => updateEditingState('pronouns', !isEditing.pronouns)}
    //         >
    //           <Ionicons name="create-outline" size={20} color="#6B7280" />