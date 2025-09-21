// screens/JournalScreen.tsx - Updated with Feelings Wheel
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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
<<<<<<< Updated upstream
import { UserPreferences } from '../types';
import { 
  FeelingSelection, 
  FeelingsAnalytics,
  getCoreFeelingById,
  getSpecificFeelingById 
} from '../types/feelings';
import { FeelingsWheel } from '../components/FeelingsWheel';
import { FeelingsAnalyticsEngine } from '../utils/feelingsAnalytics';
import { AppStorage } from '../utils/storage'; // Using your chosen storage method
=======
import { UserPreferences, JournalEntry } from '../types';
import { storage } from '../../../components/fallback-storage';
>>>>>>> Stashed changes

interface JournalScreenProps {
  route: RouteProp<{
    Journal: {
      userPreferences: UserPreferences;
    };
  }, 'Journal'>;
}

interface JournalEntry {
  id: string;
  feelingSelection: FeelingSelection;
  gratitude: string;
  progress: string;
  challenges: string;
  goals: string;
  date: string;
}

interface NewJournalEntry {
  feelingSelection: FeelingSelection | null;
  gratitude: string;
  progress: string;
  challenges: string;
  goals: string;
}

const JournalScreen: React.FC<JournalScreenProps> = ({ route }) => {
  const { userPreferences } = route.params || {};
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState<NewJournalEntry>({
    feelingSelection: null,
    gratitude: '',
    progress: '',
    challenges: '',
    goals: '',
  });
  const [modalVisible, setModalVisible] = useState<boolean>(false);
<<<<<<< Updated upstream
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<FeelingsAnalytics | null>(null);
=======
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [entryToDelete, setEntryToDelete] = useState<string>('');
>>>>>>> Stashed changes

  const journalPrompts: string[] = [
    "What did you like about yourself today?",
    "What progress are you most proud of?",
    "What made you feel affirmed today?",
    "How did you show yourself compassion?",
    "What challenge did you overcome?",
    "What goal are you working towards?",
    "What made you smile today?",
<<<<<<< Updated upstream
    "How are you honoring your authentic self?"
=======
    "How did you show yourself compassion?",
    "What step toward your authentic self did you take?",
    "How did you honor your feelings today?",
    "What brought you joy in your journey?",
    "How did you celebrate being you?"
>>>>>>> Stashed changes
  ];

  useEffect(() => {
    loadJournalEntries();
  }, []);

  useEffect(() => {
    if (journalEntries.length > 0) {
      const feelingSelections = journalEntries.map(entry => entry.feelingSelection);
      const analyticsData = FeelingsAnalyticsEngine.analyzeFeelings(feelingSelections);
      setAnalytics(analyticsData);
    }
  }, [journalEntries]);

  const loadJournalEntries = async (): Promise<void> => {
    try {
<<<<<<< Updated upstream
      const saved = await AppStorage.getItem('journalEntries');
=======
      const saved = await storage.getItem('journalEntries');
>>>>>>> Stashed changes
      if (saved) {
        setJournalEntries(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading journal entries:', error);
    }
  };

  const saveJournalEntries = async (entries: JournalEntry[]): Promise<void> => {
    try {
<<<<<<< Updated upstream
      await AppStorage.setItem('journalEntries', JSON.stringify(entries));
=======
      await storage.setItem('journalEntries', JSON.stringify(entries));
>>>>>>> Stashed changes
      setJournalEntries(entries);
    } catch (error) {
      console.log('Error saving journal entries:', error);
    }
  };

  const addJournalEntry = (): void => {
<<<<<<< Updated upstream
    if (!newEntry.feelingSelection) {
      Alert.alert('Please select how you\'re feeling first');
      return;
    }

    if (!newEntry.gratitude && !newEntry.progress) {
      Alert.alert('Please write at least one reflection');
=======
    if (!newEntry.gratitude && !newEntry.progress && !newEntry.challenges && !newEntry.goals) {
      // Use custom alert instead of Alert.alert
      setDeleteModalVisible(true);
>>>>>>> Stashed changes
      return;
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      feelingSelection: newEntry.feelingSelection,
      gratitude: newEntry.gratitude,
      progress: newEntry.progress,
      challenges: newEntry.challenges,
      goals: newEntry.goals,
      date: new Date().toISOString(),
    };

    const updatedEntries = [entry, ...journalEntries];
    saveJournalEntries(updatedEntries);
    
    // Reset form
    setNewEntry({
      feelingSelection: null,
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

  const updateEntryField = (field: keyof Omit<NewJournalEntry, 'feelingSelection'>, value: string): void => {
    setNewEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

<<<<<<< Updated upstream
  const handleFeelingSelection = (selection: FeelingSelection): void => {
    setNewEntry(prev => ({
      ...prev,
      feelingSelection: selection
    }));
  };
=======
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
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  const AnalyticsSection: React.FC = () => {
    if (!analytics || journalEntries.length < 3) {
      return (
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>📊 Emotional Insights</Text>
          <Text style={styles.analyticsText}>
            Add more journal entries to see your emotional patterns and insights!
          </Text>
        </View>
      );
    }

    const insights = FeelingsAnalyticsEngine.getInsights(analytics);
    const recentMoodScore = FeelingsAnalyticsEngine.getRecentMoodScore(
      journalEntries.map(e => e.feelingSelection)
    );
    const emotionalDiversity = FeelingsAnalyticsEngine.getEmotionalDiversity(
      journalEntries.map(e => e.feelingSelection)
    );

    return (
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>📊 Your Emotional Journey</Text>
        
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{recentMoodScore}/10</Text>
            <Text style={styles.metricLabel}>Recent Mood</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{Math.round(emotionalDiversity * 100)}%</Text>
            <Text style={styles.metricLabel}>Emotional Range</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              {analytics.recentTrend === 'improving' ? '↗️' : 
               analytics.recentTrend === 'declining' ? '↘️' : '→'}
            </Text>
            <Text style={styles.metricLabel}>Trend</Text>
          </View>
        </View>

        {insights.map((insight, index) => (
          <Text key={index} style={styles.insightText}>• {insight}</Text>
        ))}

        <TouchableOpacity
          style={styles.detailedAnalyticsButton}
          onPress={() => setShowAnalytics(true)}
        >
          <Text style={styles.detailedAnalyticsButtonText}>View Detailed Analytics</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const DetailedAnalyticsModal: React.FC = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showAnalytics}
      onRequestClose={() => setShowAnalytics(false)}
    >
      <ScrollView style={styles.analyticsModal}>
        <View style={styles.analyticsHeader}>
          <TouchableOpacity
            style={styles.closeAnalyticsButton}
            onPress={() => setShowAnalytics(false)}
          >
            <Ionicons name="close" size={24} color="#6B46C1" />
          </TouchableOpacity>
          <Text style={styles.analyticsModalTitle}>Detailed Emotional Analytics</Text>
        </View>

        {analytics && (
          <View style={styles.analyticsContent}>
            <View style={styles.distributionSection}>
              <Text style={styles.sectionTitle}>Core Feelings Distribution</Text>
              {Object.entries(analytics.coreDistribution).map(([feelingId, count]) => {
                const feeling = getCoreFeelingById(feelingId);
                const percentage = Math.round((count / journalEntries.length) * 100);
                return (
                  <View key={feelingId} style={styles.distributionItem}>
                    <Text style={styles.feelingName}>{feeling?.name || feelingId}</Text>
                    <View style={styles.distributionBar}>
                      <View 
                        style={[
                          styles.distributionFill, 
                          { 
                            width: `${percentage}%`,
                            backgroundColor: feeling?.color || '#6B46C1'
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.percentageText}>{percentage}%</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.distributionSection}>
              <Text style={styles.sectionTitle}>Weekly Pattern</Text>
              {Object.entries(analytics.weeklyPatterns).map(([day, count]) => {
                const maxCount = Math.max(...Object.values(analytics.weeklyPatterns));
                const percentage = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                return (
                  <View key={day} style={styles.distributionItem}>
                    <Text style={styles.feelingName}>{day}</Text>
                    <View style={styles.distributionBar}>
                      <View 
                        style={[
                          styles.distributionFill, 
                          { 
                            width: `${percentage}%`,
                            backgroundColor: '#54A0FF'
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.percentageText}>{count} entries</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>Recommendations</Text>
              <Text style={styles.recommendationText}>
                Based on your patterns, consider practicing mindfulness on days when you feel more challenged.
              </Text>
              <Text style={styles.recommendationText}>
                Your emotional diversity of {Math.round(FeelingsAnalyticsEngine.getEmotionalDiversity(journalEntries.map(e => e.feelingSelection)) * 100)}% 
                shows you're in touch with a good range of emotions.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
=======
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
>>>>>>> Stashed changes

  interface EntryCardProps {
    entry: JournalEntry;
  }

  const EntryCard: React.FC<EntryCardProps> = ({ entry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
<<<<<<< Updated upstream
        <View style={styles.feelingBadge}>
          <Text style={styles.feelingBadgeText}>
            {entry.feelingSelection.coreFeeling.name} → {entry.feelingSelection.specificFeeling.name}
          </Text>
=======
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
>>>>>>> Stashed changes
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

        <AnalyticsSection />

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

          <FeelingsWheel
            onFeelingSelected={handleFeelingSelection}
            selectedFeeling={newEntry.feelingSelection || undefined}
          />

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

      <DetailedAnalyticsModal />
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
  analyticsCard: {
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
  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  analyticsText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginVertical: 2,
  },
  detailedAnalyticsButton: {
    backgroundColor: '#6B46C1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  detailedAnalyticsButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
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
    alignItems: 'flex-start',
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
    flex: 1,
  },
<<<<<<< Updated upstream
  feelingBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  feelingBadgeText: {
    fontSize: 12,
    color: '#6B46C1',
    fontWeight: '500',
=======
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes
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
  analyticsModal: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeAnalyticsButton: {
    position: 'absolute',
    left: 16,
    padding: 8,
  },
  analyticsModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  analyticsContent: {
    padding: 16,
  },
  distributionSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  feelingName: {
    fontSize: 14,
    color: '#374151',
    width: 80,
    fontWeight: '500',
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  distributionFill: {
    height: 8,
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#6B7280',
    width: 40,
    textAlign: 'right',
  },
  recommendationsSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default JournalScreen;