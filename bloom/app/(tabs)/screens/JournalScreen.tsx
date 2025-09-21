// screens/JournalScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { UserPreferences, JournalEntry } from '../types';
import { storage } from '../../../components/fallback-storage';

interface JournalScreenProps {
  route: RouteProp<{
    Journal: {
      userPreferences: UserPreferences;
    };
  }, 'Journal'>;
}

interface NewJournalEntry {
  mood: number;
  gratitude: string;
  progress: string;
  challenges: string;
  goals: string;
}

interface MoodEmojis {
  [key: number]: string;
}

const JournalScreen: React.FC<JournalScreenProps> = ({ route }) => {
  const { userPreferences } = route.params || {};
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState<NewJournalEntry>({
    mood: 5,
    gratitude: '',
    progress: '',
    challenges: '',
    goals: '',
  });
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [entryToDelete, setEntryToDelete] = useState<string>('');

  const journalPrompts: string[] = [
    "What did you like about yourself today?",
    "What progress are you most proud of?",
    "What made you feel affirmed today?",
    "What challenge did you overcome?",
    "How did you practice self-care?",
    "What goal are you working towards?",
    "What made you smile today?",
    "How did you show yourself compassion?",
    "What step toward your authentic self did you take?",
    "How did you honor your feelings today?",
    "What brought you joy in your journey?",
    "How did you celebrate being you?"
  ];

  const moodEmojis: MoodEmojis = {
    1: '😭', 2: '😔', 3: '😐', 4: '🙂', 5: '😊',
    6: '😄', 7: '🤩', 8: '✨', 9: '🌟', 10: '🎉'
  };

  useEffect(() => {
    loadJournalEntries();
  }, []);

  const loadJournalEntries = async (): Promise<void> => {
    try {
      const saved = await storage.getItem('journalEntries');
      if (saved) {
        setJournalEntries(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading journal entries:', error);
    }
  };

  const saveJournalEntries = async (entries: JournalEntry[]): Promise<void> => {
    try {
      await storage.setItem('journalEntries', JSON.stringify(entries));
      setJournalEntries(entries);
    } catch (error) {
      console.log('Error saving journal entries:', error);
    }
  };

  const addJournalEntry = (): void => {
    if (!newEntry.gratitude && !newEntry.progress && !newEntry.challenges && !newEntry.goals) {
      // Use custom alert instead of Alert.alert
      setDeleteModalVisible(true);
      return;
    }

    const entry: JournalEntry = {
      ...newEntry,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    const updatedEntries = [entry, ...journalEntries];
    saveJournalEntries(updatedEntries);
    
    // Reset form
    setNewEntry({
      mood: 5,
      gratitude: '',
      progress: '',
      challenges: '',
      goals: '',
    });
    
    setModalVisible(false);
    console.log('Journal entry saved successfully');
  };

  const deleteEntry = (entryId: string): void => {
    console.log('deleteEntry called with ID:', entryId);
    setEntryToDelete(entryId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async (): Promise<void> => {
    console.log('Delete confirmed, removing entry:', entryToDelete);
    try {
      const updatedEntries = journalEntries.filter(entry => entry.id !== entryToDelete);
      console.log('Entries after filter:', updatedEntries.length);
      
      await storage.setItem('journalEntries', JSON.stringify(updatedEntries));
      setJournalEntries(updatedEntries);
      console.log('Entry deleted successfully');
      
      setDeleteModalVisible(false);
      setEntryToDelete('');
    } catch (error) {
      console.log('Error deleting entry:', error);
    }
  };

  const updateEntryField = (field: keyof NewJournalEntry, value: string | number): void => {
    setNewEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const MoodSelector: React.FC = () => (
    <View style={styles.moodContainer}>
      <Text style={styles.sectionTitle}>How are you feeling? (1-10)</Text>
      <View style={styles.moodGrid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
          <TouchableOpacity
            key={mood}
            style={[
              styles.moodButton,
              newEntry.mood === mood && styles.selectedMood
            ]}
            onPress={() => updateEntryField('mood', mood)}
          >
            <Text style={styles.moodEmoji}>{moodEmojis[mood]}</Text>
            <Text style={[
              styles.moodNumber,
              newEntry.mood === mood && styles.selectedMoodText
            ]}>{mood}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getRandomPrompt = (): string => {
    return journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEntryStats = () => {
    if (journalEntries.length === 0) return null;
    
    const totalMood = journalEntries.reduce((sum, entry) => sum + entry.mood, 0);
    const averageMood = Math.round((totalMood / journalEntries.length) * 10) / 10;
    const streakDays = getJournalingStreak();
    
    return { averageMood, totalEntries: journalEntries.length, streakDays };
  };

  const getJournalingStreak = (): number => {
    if (journalEntries.length === 0) return 0;
    
    const sortedEntries = [...journalEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else if (daysDiff === i + 1 && i === 0) {
        // Allow for yesterday if it's the first entry
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  interface EntryCardProps {
    entry: JournalEntry;
  }

  const EntryCard: React.FC<EntryCardProps> = ({ entry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
        <View style={styles.entryHeaderRight}>
          <Text style={styles.entryMood}>
            {moodEmojis[entry.mood]} {entry.mood}/10
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              console.log('Delete button pressed for entry:', entry.id);
              deleteEntry(entry.id);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      {entry.gratitude && (
        <View style={styles.entrySection}>
          <Text style={styles.entrySectionTitle}>💝 Gratitude</Text>
          <Text style={styles.entrySectionText}>{entry.gratitude}</Text>
        </View>
      )}
      
      {entry.progress && (
        <View style={styles.entrySection}>
          <Text style={styles.entrySectionTitle}>🎯 Progress</Text>
          <Text style={styles.entrySectionText}>{entry.progress}</Text>
        </View>
      )}
      
      {entry.challenges && (
        <View style={styles.entrySection}>
          <Text style={styles.entrySectionTitle}>💪 Challenges</Text>
          <Text style={styles.entrySectionText}>{entry.challenges}</Text>
        </View>
      )}
      
      {entry.goals && (
        <View style={styles.entrySection}>
          <Text style={styles.entrySectionTitle}>🌟 Goals</Text>
          <Text style={styles.entrySectionText}>{entry.goals}</Text>
        </View>
      )}
    </View>
  );

  const stats = getEntryStats();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Journey 🌱</Text>
          <Text style={styles.promptText}>"{getRandomPrompt()}"</Text>
          
          {stats && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalEntries}</Text>
                <Text style={styles.statLabel}>Reflections</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.averageMood}</Text>
                <Text style={styles.statLabel}>Avg Mood</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.streakDays}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>New Reflection</Text>
        </TouchableOpacity>

        {journalEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Start your first reflection to begin tracking your beautiful journey! ✨
            </Text>
          </View>
        ) : (
          journalEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                // Reset form when closing
                setNewEntry({
                  mood: 5,
                  gratitude: '',
                  progress: '',
                  challenges: '',
                  goals: '',
                });
              }}
            >
              <Ionicons name="close" size={24} color="#6B46C1" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Reflection</Text>
          </View>

          <MoodSelector />

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>💝 What are you grateful for today?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="I'm grateful for..."
              placeholderTextColor="#9CA3AF"
              value={newEntry.gratitude}
              onChangeText={(text) => updateEntryField('gratitude', text)}
              multiline
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>🎯 What progress did you make?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Today I made progress by..."
              placeholderTextColor="#9CA3AF"
              value={newEntry.progress}
              onChangeText={(text) => updateEntryField('progress', text)}
              multiline
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>💪 Any challenges you faced?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="I worked through..."
              placeholderTextColor="#9CA3AF"
              value={newEntry.challenges}
              onChangeText={(text) => updateEntryField('challenges', text)}
              multiline
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>🌟 What are your goals?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="I'm working towards..."
              placeholderTextColor="#9CA3AF"
              value={newEntry.goals}
              onChangeText={(text) => updateEntryField('goals', text)}
              multiline
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={addJournalEntry}>
            <Text style={styles.saveButtonText}>Save Reflection</Text>
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Delete Reflection</Text>
            <Text style={styles.deleteModalText}>
              Are you sure you want to delete this reflection? This action cannot be undone.
            </Text>
            
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setEntryToDelete('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteConfirmButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#6B46C1',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  promptText: {
    color: '#E5E7EB',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#E5E7EB',
    fontSize: 12,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#6B46C1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  entryCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  entryMood: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#FEE2E2',
    marginLeft: 8,
  },
  entrySection: {
    marginVertical: 8,
  },
  entrySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  entrySectionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  moodContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: '18%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  selectedMood: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  moodEmoji: {
    fontSize: 16,
  },
  moodNumber: {
    fontSize: 10,
    fontWeight: '500',
    color: '#374151',
  },
  selectedMoodText: {
    color: '#ffffff',
  },
  inputSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  saveButton: {
    backgroundColor: '#6B46C1',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  deleteModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  deleteModalContent: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteConfirmButton: {
    backgroundColor: '#EF4444',
  },
  deleteConfirmButtonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: '600',
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
});

export default JournalScreen;