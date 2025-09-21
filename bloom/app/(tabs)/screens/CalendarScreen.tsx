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
import * as Notifications from 'expo-notifications';
import { RouteProp } from '@react-navigation/native';
import { UserPreferences, HrtEntry, HrtEntries } from '../types';
import { storage } from '../../../components/fallback-storage';
// FallbackStorage class - same as in App.tsx


// Initialize storage instance
// const storage = new FallbackStorage();

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
      const saved = await storage.getItem('hrtEntries');
      if (saved) {
        setHrtEntries(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading HRT entries:', error);
    }
  };

  const saveHrtEntries = async (entries: HrtEntries): Promise<void> => {
    try {
      await storage.setItem('hrtEntries', JSON.stringify(entries));
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
    try {
      // Schedule daily HRT reminders
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      if (!userPreferences?.notifications) {
        return; // Skip if notifications are disabled
      }
      
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
    } catch (error) {
      console.log('Error scheduling reminders:', error);
    }
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

  const deleteEntry = (dateKey: string): void => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newEntries = { ...hrtEntries };
            delete newEntries[dateKey];
            saveHrtEntries(newEntries);
          },
        },
      ]
    );
  };

  const onDayPress = (day: DateData): void => {
    setSelectedDate(day.dateString);
    
    // If there's already an entry for this date, show options to view/edit/delete
    if (hrtEntries[day.dateString]) {
      const existingEntry = hrtEntries[day.dateString];
      Alert.alert(
        `Entry for ${day.dateString}`,
        `Type: ${existingEntry.type}\nNotes: ${existingEntry.notes || 'No notes'}\nTime: ${new Date(existingEntry.timestamp).toLocaleTimeString()}`,
        [
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteEntry(day.dateString),
          },
          {
            text: 'Edit',
            onPress: () => {
              setEntryType(existingEntry.type);
              setEntryNotes(existingEntry.notes || '');
              setModalVisible(true);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      // No existing entry, show modal to add new entry
      setModalVisible(true);
    }
  };

  const [motivationalMessage, setMotivationalMessage] = useState<string>('');

  const getRandomMotivationalMessage = (): string => {
    const messages = [
      "Every step forward is progress! 🌟",
      "You're becoming more yourself every day! 💖",
      "Your journey is valid and beautiful! 🦋",
      "Consistency is key - you're doing amazing! ✨",
      "Each day brings you closer to your goals! 🌈",
      "Your courage inspires others! 💪",
      "Celebrate every small victory! 🎉",
      "You are worthy of love and happiness! 💕"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Set motivational message once when component mounts
  useEffect(() => {
    setMotivationalMessage(getRandomMotivationalMessage());
  }, []);
  const getStreakCount = (): number => {
    const sortedDates = Object.keys(hrtEntries)
      .filter(date => hrtEntries[date].type === 'hrt')
      .sort()
      .reverse();
    
    if (sortedDates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const entryDate = new Date(sortedDates[i]);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (i === 0 && daysDiff <= 1) {
        streak = 1;
      } else if (daysDiff === i + 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.motivationBox}>
        <Text style={styles.motivationText}>{motivationalMessage}</Text>
        {getStreakCount() > 0 && (
          <Text style={styles.streakText}>
            🔥 {getStreakCount()} day streak!
          </Text>
        )}
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
        <Text style={styles.legendNote}>
          Tap on a date to add/view entries
        </Text>
        <View style={styles.entriesContainer}>
        <Text style={styles.entriesTitle}>Your Entries</Text>
        {Object.keys(hrtEntries).length === 0 ? (
            <Text style={styles.noEntries}>No entries yet. Tap a date to add one!</Text>
        ) : (
            Object.entries(hrtEntries)
            .sort(([a], [b]) => b.localeCompare(a)) // newest first
            .map(([date, entry]) => (
                <View key={date} style={styles.entryCard}>
                <Text style={styles.entryDate}>{date}</Text>
                <Text style={styles.entryType}>
                    {entry.type === 'hrt' ? '💊 HRT Taken' : '🎯 Milestone'}
                </Text>
                {entry.notes ? (
                    <Text style={styles.entryNotes}>{entry.notes}</Text>
                ) : (
                    <Text style={styles.entryNotesMuted}>No notes</Text>
                )}
                </View>
            ))
        )}
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
              {hrtEntries[selectedDate] ? 'Edit Entry' : 'Add Entry'} for {selectedDate}
            </Text>

            <View style={styles.entryTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.entryTypeButton,
                  entryType === 'hrt' && styles.selectedEntryType
                ]}
                onPress={() => setEntryType('hrt')}
              >
                <Text style={[
                  styles.entryTypeText,
                  entryType === 'hrt' && styles.selectedEntryTypeText
                ]}>
                  💊 HRT Taken
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.entryTypeButton,
                  entryType === 'milestone' && styles.selectedEntryType
                ]}
                onPress={() => setEntryType('milestone')}
              >
                <Text style={[
                  styles.entryTypeText,
                  entryType === 'milestone' && styles.selectedEntryTypeText
                ]}>
                  🎯 Milestone
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)"
              placeholderTextColor="#9CA3AF"
              value={entryNotes}
              onChangeText={setEntryNotes}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setEntryNotes('');
                  setEntryType('hrt');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addEntry}
              >
                <Text style={styles.saveButtonText}>
                  {hrtEntries[selectedDate] ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  entriesContainer: {
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
entriesTitle: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 8,
  color: '#374151',
},
noEntries: {
  fontSize: 14,
  color: '#6B7280',
  fontStyle: 'italic',
},
entryCard: {
  marginBottom: 12,
  paddingBottom: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
entryDate: {
  fontSize: 14,
  fontWeight: '600',
  color: '#111827',
},
entryType: {
  fontSize: 14,
  color: '#6B46C1',
  fontWeight: '500',
  marginTop: 2,
},
entryNotes: {
  fontSize: 14,
  color: '#374151',
  marginTop: 4,
},
entryNotesMuted: {
  fontSize: 14,
  color: '#9CA3AF',
  fontStyle: 'italic',
  marginTop: 4,
},
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  motivationBox: {
    backgroundColor: '#6B46C1',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  motivationText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  streakText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
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
    color: '#374151',
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
  legendNote: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#374151',
  },
  entryTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  entryTypeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#F9FAFB',
  },
  selectedEntryType: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  entryTypeText: {
    textAlign: 'center',
    fontWeight: '500',
    color: '#374151',
  },
  selectedEntryTypeText: {
    color: '#ffffff',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    backgroundColor: '#ffffff',
    fontSize: 16,
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
    borderWidth: 1,
    borderColor: '#D1D5DB',
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