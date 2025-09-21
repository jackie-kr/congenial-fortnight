// screens/SettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { UserPreferences } from '../types';
import { storage } from '../../../components/fallback-storage';

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
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>({
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

  const [customPronoun, setCustomPronoun] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

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

  // Load preferences from storage on component mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Auto-save whenever preferences change
  useEffect(() => {
    if (localPreferences.pronouns || localPreferences.goals.length > 0) {
      autoSave();
    }
  }, [localPreferences]);

  const loadPreferences = async (): Promise<void> => {
    try {
      const saved = await storage.getItem('userPreferences');
      if (saved) {
        const parsedPrefs = JSON.parse(saved);
        setLocalPreferences(parsedPrefs);
      } else if (userPreferences) {
        // Fallback to route params if no saved preferences
        setLocalPreferences(userPreferences);
      }
    } catch (error) {
      console.log('Error loading preferences:', error);
      if (userPreferences) {
        setLocalPreferences(userPreferences);
      }
    }
  };

  const autoSave = async (): Promise<void> => {
    setSaveStatus('saving');
    try {
      await storage.setItem('userPreferences', JSON.stringify(localPreferences));
      if (saveUserPreferences) {
        saveUserPreferences(localPreferences);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.log('Error auto-saving preferences:', error);
      setSaveStatus('idle');
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

  const handleTimeChange = (hours: number, minutes: number): void => {
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    updatePreference('reminderTime', timeString);
    updateEditingState('reminderTime', false);
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

  const TimePickerModal: React.FC = () => {
    const [hours, minutes] = localPreferences.reminderTime.split(':').map(Number);
    
    return (
      <View style={styles.timePickerContainer}>
        <Text style={styles.timePickerTitle}>Select Reminder Time</Text>
        <View style={styles.timePickerRow}>
          <View style={styles.timePickerColumn}>
            <Text style={styles.timePickerLabel}>Hours</Text>
            {[...Array(24)].map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.timeOption,
                  hours === i && styles.selectedTimeOption
                ]}
                onPress={() => handleTimeChange(i, minutes)}
              >
                <Text style={[
                  styles.timeOptionText,
                  hours === i && styles.selectedTimeOptionText
                ]}>
                  {i.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.timePickerColumn}>
            <Text style={styles.timePickerLabel}>Minutes</Text>
            {[0, 15, 30, 45].map((minute) => (
              <TouchableOpacity
                key={minute}
                style={[
                  styles.timeOption,
                  minutes === minute && styles.selectedTimeOption
                ]}
                onPress={() => handleTimeChange(hours, minute)}
              >
                <Text style={[
                  styles.timeOptionText,
                  minutes === minute && styles.selectedTimeOptionText
                ]}>
                  {minute.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const getSaveStatusText = (): string => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'saved': return 'Saved!';
      default: return '';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your Bloom experience</Text>
        {saveStatus !== 'idle' && (
          <Text style={[
            styles.saveStatus,
            saveStatus === 'saved' && styles.saveStatusSuccess
          ]}>
            {getSaveStatusText()}
          </Text>
        )}
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
            
            {(localPreferences.pronouns === 'custom' || 
             (!pronounOptions.includes(localPreferences.pronouns as PronounOption) && 
              localPreferences.pronouns !== '')) && (
              <View style={styles.customPronounInput}>
                <TextInput
                  style={styles.textInput}
                  value={customPronoun || localPreferences.pronouns}
                  onChangeText={setCustomPronoun}
                  placeholder="Enter custom pronouns"
                  onSubmitEditing={handleCustomPronounSave}
                />
              </View>
            )}
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

        {isEditing.reminderTime && <TimePickerModal />}

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

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

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
  saveStatus: {
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 8,
    fontWeight: '500',
  },
  saveStatusSuccess: {
    color: '#10B981',
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
  },
  timePickerContainer: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    marginVertical: 8,
  },
  timePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timePickerColumn: {
    flex: 1,
    marginHorizontal: 8,
  },
  timePickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  timeOption: {
    padding: 8,
    borderRadius: 6,
    marginVertical: 2,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedTimeOption: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  timeOptionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#374151',
  },
  selectedTimeOptionText: {
    color: '#ffffff',
  },
});

export default SettingsScreen;