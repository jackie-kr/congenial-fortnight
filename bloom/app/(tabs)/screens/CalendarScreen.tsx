// screens/CalendarScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { RouteProp } from '@react-navigation/native';
import { UserPreferences, HrtEntry, HrtEntries } from '../types';

interface CalendarScreenProps {
  route: RouteProp<{
    Calendar: {
      userPreferences: UserPreferences;
      saveUserPreferences: (prefs: UserPreferences) => void;
    };
  }, 'Calendar'>;
}

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selectedColor: string;
  };
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ route }) => {
  const { userPreferences, saveUserPreferences } = route.params;
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [hrtEntries, setHrtEntries] = useState<HrtEntries>({});
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [entryType, setEntryType] = useState<'hrt' | 'milestone'>('hrt');
  const [entryNotes, setEntryNotes] = useState<string>('');
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  useEffect(() => {
    loadHrtEntries();
    scheduleReminders();
  }, []);

  useEffect(() => {
    updateMarkedDates();
  }, [hrtEntries]);

  const loadHrtEntries = async (): Promise<void> => {
    try {
      const saved = await AsyncStorage.getItem('hrtEntries');
      if (saved) {
        setHrtEntries(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading HRT entries:', error);
    }
  };

  const saveHrtEntries = async (entries: HrtEntries): Promise<void> => {
    try {
      await AsyncStorage.setItem('hrtEntries', JSON.stringify(entries));
      setHrtEntries(entries);
    } catch (error) {
      console.log('Error saving HRT entries:', error);
    }
  };

  const updateMarkedDates = (): void => {
    const marked: MarkedDates = {};
    Object.keys(hrtEntries).forEach(date => {
      const entry = hrtEntries[date];
      let color = '#6B46C1'; // Default purple
      
      if (entry.type === 'hrt') {
        color = '#10B981'; // Green for HRT
      } else if (entry.type === 'milestone') {
        color = '#F59E0B'; // Gold for milestones
      }
      
      marked[date] = {
        marked: true,
        dotColor: color,
        selectedColor: color,
      };
    });
    setMarkedDates(marked);
  };

  const scheduleReminders = async (): Promise<void> => {
    // Schedule daily HRT reminders
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    const reminderTime = userPreferences?.reminderTime || '09:00';
    const [hours, minutes] = reminderTime.split(':');
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 HRT Reminder',
        body: 'Time for your hormone therapy! You\'re doing amazing! 🌟',
      },
      trigger: {
        seconds: parseInt(hours) * 3600 + parseInt(minutes) * 60,
        repeats: true,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL
      },
    });
  };

  const addEntry = (): void => {
    if (!selectedDate) {
      Alert.alert('Please select a date first');
      return;
    }

    const newEntry: HrtEntry = {
      type: entryType,
      notes: entryNotes,
      timestamp: new Date().toISOString(),
    };

    const newEntries: HrtEntries = {
      ...hrtEntries,
      [selectedDate]: newEntry
    };

    saveHrtEntries(newEntries);
    setModalVisible(false);
    setEntryNotes('');
    
    // Show positive feedback
    Alert.alert('Great job! 🎉', 'Your progress has been recorded!');
  };

  const onDayPress = (day: DateData): void => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const getMotivationalMessage = (): string => {
    const messages = [
      "Every step forward is progress! 🌟",
      "You're becoming more yourself every day! 💖",
      "Your journey is valid and beautiful! 🦋",
      "Consistency is key - you're doing amazing! ✨",
      "Each day brings you closer to your goals! 🌈"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.motivationBox}>
        <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
      </View>

      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: '#6B46C1',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#6B46C1',
          arrowColor: '#6B46C1',
        }}
      />

      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text>HRT Taken</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text>Milestone</Text>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add Entry for {selectedDate}
            </Text>

            <View style={styles.entryTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.entryTypeButton,
                  entryType === 'hrt' && styles.selectedEntryType
                ]}
                onPress={() => setEntryType('hrt')}
              >
                <Text style={styles.entryTypeText}>HRT Taken</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.entryTypeButton,
                  entryType === 'milestone' && styles.selectedEntryType
                ]}
                onPress={() => setEntryType('milestone')}
              >
                <Text style={styles.entryTypeText}>Milestone</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)"
              value={entryNotes}
              onChangeText={setEntryNotes}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addEntry}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  motivationBox: {
    backgroundColor: '#6B46C1',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  motivationText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  legendContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  entryTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  entryTypeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedEntryType: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  entryTypeText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#374151',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#6B46C1',
  },
  saveButtonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default CalendarScreen;