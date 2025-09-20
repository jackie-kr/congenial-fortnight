// screens/ResourcesScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Resource, ResourceCategories } from '../types';

type CategoryKey = 'healthcare' | 'mental_health' | 'community' | 'legal' | 'education';

const ResourcesScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('healthcare');

  const categories: ResourceCategories = {
    healthcare: {
      title: '🏥 Healthcare',
      icon: 'medical',
      resources: [
        {
          name: 'WPATH Standards of Care',
          type: 'Guidelines',
          description: 'International standards for transgender healthcare',
          url: 'https://www.wpath.org',
          location: 'Global'
        },
        {
          name: 'Planned Parenthood',
          type: 'Healthcare Provider',
          description: 'Hormone therapy and trans-affirming care',
          url: 'https://www.plannedparenthood.org',
          location: 'USA'
        },
        {
          name: 'Fenway Health',
          type: 'Specialized Clinic',
          description: 'LGBTQ+ specialized healthcare',
          url: 'https://fenwayhealth.org',
          location: 'Boston, MA'
        },
        {
          name: 'Howard Brown Health',
          type: 'Specialized Clinic',
          description: 'Comprehensive LGBTQ+ healthcare',
          url: 'https://howardbrown.org',
          location: 'Chicago, IL'
        }
      ]
    },
    mental_health: {
      title: '🧠 Mental Health',
      icon: 'heart',
      resources: [
        {
          name: 'Trans Lifeline',
          type: 'Crisis Support',
          description: '24/7 crisis hotline by and for trans people',
          phone: '877-565-8860',
          location: 'USA'
        },
        {
          name: 'Psychology Today',
          type: 'Therapist Directory',
          description: 'Find LGBTQ+ affirming therapists',
          url: 'https://www.psychologytoday.com',
          location: 'Global'
        },
        {
          name: 'The Trevor Project',
          type: 'Crisis Support',
          description: 'LGBTQ+ youth crisis intervention',
          phone: '1-866-488-7386',
          location: 'USA'
        }
      ]
    },
    community: {
      title: '🤝 Community',
      icon: 'people',
      resources: [
        {
          name: 'PFLAG',
          type: 'Support Organization',
          description: 'Support for LGBTQ+ individuals and families',
          url: 'https://pflag.org',
          location: 'USA'
        },
        {
          name: 'GLAAD',
          type: 'Advocacy',
          description: 'Media advocacy and education',
          url: 'https://www.glaad.org',
          location: 'USA'
        },
        {
          name: 'Reddit r/transgender',
          type: 'Online Community',
          description: 'Large online support community',
          url: 'https://reddit.com/r/transgender',
          location: 'Online'
        },
        {
          name: 'TransHub',
          type: 'Information Hub',
          description: 'Comprehensive trans resource website',
          url: 'https://www.transhub.org.au',
          location: 'Australia'
        }
      ]
    },
    legal: {
      title: '⚖️ Legal Resources',
      icon: 'document-text',
      resources: [
        {
          name: 'Lambda Legal',
          type: 'Legal Aid',
          description: 'LGBTQ+ legal advocacy and support',
          url: 'https://www.lambdalegal.org',
          location: 'USA'
        },
        {
          name: 'ACLU LGBTQ+ Rights',
          type: 'Civil Rights',
          description: 'Civil liberties and rights advocacy',
          url: 'https://www.aclu.org/issues/lgbt-rights',
          location: 'USA'
        },
        {
          name: 'National Center for Transgender Equality',
          type: 'Advocacy',
          description: 'Policy advocacy and legal resources',
          url: 'https://transequality.org',
          location: 'USA'
        }
      ]
    },
    education: {
      title: '📚 Education & Research',
      icon: 'library',
      resources: [
        {
          name: 'UCSF Transgender Care',
          type: 'Medical Guidelines',
          description: 'Evidence-based treatment guidelines',
          url: 'https://transcare.ucsf.edu',
          location: 'Online'
        },
        {
          name: 'Gender Dysphoria Bible',
          type: 'Educational Resource',
          description: 'Comprehensive guide to gender dysphoria',
          url: 'https://genderdysphoria.fyi',
          location: 'Online'
        },
        {
          name: 'Trans Research Network',
          type: 'Research Hub',
          description: 'Latest research on transgender health',
          url: 'https://www.transresearchnetwork.org',
          location: 'Online'
        }
      ]
    }
  };

  const handleResourcePress = async (resource: Resource): Promise<void> => {
    if (resource.phone) {
      Alert.alert(
        'Call Resource',
        `Would you like to call ${resource.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Call', 
            onPress: () => Linking.openURL(`tel:${resource.phone}`)
          }
        ]
      );
    } else if (resource.url) {
      try {
        await Linking.openURL(resource.url);
      } catch (error) {
        Alert.alert('Error', 'Could not open link');
      }
    }
  };

  interface ResourceCardProps {
    resource: Resource;
  }

  const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => (
    <TouchableOpacity 
      style={styles.resourceCard}
      onPress={() => handleResourcePress(resource)}
    >
      <View style={styles.resourceHeader}>
        <Text style={styles.resourceName}>{resource.name}</Text>
        <View style={styles.resourceType}>
          <Text style={styles.resourceTypeText}>{resource.type}</Text>
        </View>
      </View>
      
      <Text style={styles.resourceDescription}>{resource.description}</Text>
      
      <View style={styles.resourceFooter}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.locationText}>{resource.location}</Text>
        </View>
        
        {resource.phone && (
          <View style={styles.phoneContainer}>
            <Ionicons name="call-outline" size={14} color="#6B46C1" />
            <Text style={styles.phoneText}>{resource.phone}</Text>
          </View>
        )}
        
        {resource.url && (
          <Ionicons name="open-outline" size={16} color="#6B46C1" />
        )}
      </View>
    </TouchableOpacity>
  );

  const EmergencySection: React.FC = () => (
    <View style={styles.emergencySection}>
      <Text style={styles.emergencyTitle}>🆘 Emergency Resources</Text>
      
      <TouchableOpacity 
        style={styles.emergencyButton}
        onPress={() => Linking.openURL('tel:877-565-8860')}
      >
        <Text style={styles.emergencyButtonText}>Trans Lifeline: 877-565-8860</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.emergencyButton}
        onPress={() => Linking.openURL('tel:988')}
      >
        <Text style={styles.emergencyButtonText}>Crisis Lifeline: 988</Text>
      </TouchableOpacity>
    </View>
  );

  interface CategoryButtonProps {
    categoryKey: CategoryKey;
    category: {
      title: string;
      icon: string;
    };
    isActive: boolean;
    onPress: (key: CategoryKey) => void;
  }

  const CategoryButton: React.FC<CategoryButtonProps> = ({ 
    categoryKey, 
    category, 
    isActive, 
    onPress 
  }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        isActive && styles.activeCategoryButton
      ]}
      onPress={() => onPress(categoryKey)}
    >
      <Ionicons 
        name={category.icon as keyof typeof Ionicons.glyphMap} 
        size={20} 
        color={isActive ? '#ffffff' : '#6B46C1'} 
      />
      <Text style={[
        styles.categoryButtonText,
        isActive && styles.activeCategoryButtonText
      ]}>
        {category.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <EmergencySection />
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {(Object.entries(categories) as [CategoryKey, typeof categories[CategoryKey]][]).map(([key, category]) => (
          <CategoryButton
            key={key}
            categoryKey={key}
            category={category}
            isActive={activeCategory === key}
            onPress={setActiveCategory}
          />
        ))}
      </ScrollView>

      <ScrollView style={styles.resourcesList}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>
            {categories[activeCategory].title}
          </Text>
          <Text style={styles.categorySubtitle}>
            Tap any resource to open or call
          </Text>
        </View>

        {categories[activeCategory].resources.map((resource, index) => (
          <ResourceCard key={index} resource={resource} />
        ))}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>💡 Note</Text>
          <Text style={styles.disclaimerText}>
            This is a curated list of resources. For hackathon purposes, these are static examples. 
            In a full version, resources would be location-aware and regularly updated.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  emergencySection: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FCA5A5',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryScroll: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6B46C1',
  },
  activeCategoryButton: {
    backgroundColor: '#6B46C1',
  },
  categoryButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B46C1',
  },
  activeCategoryButtonText: {
    color: '#ffffff',
  },
  resourcesList: {
    flex: 1,
  },
  categoryHeader: {
    padding: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  resourceCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  resourceType: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resourceTypeText: {
    fontSize: 12,
    color: '#6B46C1',
    fontWeight: '500',
  },
  resourceDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  resourceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  phoneText: {
    fontSize: 12,
    color: '#6B46C1',
    marginLeft: 4,
    fontWeight: '500',
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  disclaimerTitle: {
    fontSize: 14,