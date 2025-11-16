import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { VStack, HStack, Avatar, Badge, Switch } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { resources } = useSelector(state => state.resources);
  const { deals } = useSelector(state => state.deals);
  const savedDeals = deals.filter(d => d.saved);

  const handleLogout = () => {
    dispatch(logout());
  };
  const StatCard = ({ title, value, icon }) => (
    <View style={styles.statCard}>
      <HStack alignItems="center" space={3}>
        <View style={styles.statIconContainer}>
          <Icon name={icon} size={24} color="#D4A574" />
        </View>
        <VStack>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </VStack>
      </HStack>
    </View>
  );

  const MenuItem = ({ title, icon, onPress, hasSwitch = false, value = false, onValueChange }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={hasSwitch}>
      <HStack justifyContent="space-between" alignItems="center">
        <HStack alignItems="center" space={3}>
          <Icon name={icon} size={24} color="#4A5568" />
          <Text style={styles.menuItemText}>{title}</Text>
        </HStack>
        {hasSwitch ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#E2E8F0', true: '#D4A574' }}
          />
        ) : (
          <Icon name="chevron-right" size={24} color="#CBD5E0" />
        )}
      </HStack>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <VStack space={4} alignItems="center">
          <Avatar
            size="xl"
            source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}` }}
          />
          <VStack alignItems="center" space={1}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userInfo}>
              {user?.university} • {user?.fieldOfStudy}
            </Text>
            <Badge colorScheme="success" variant="subtle">
              Année {user?.yearOfStudy}
            </Badge>
          </VStack>
        </VStack>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Mes statistiques</Text>
        <HStack space={3} justifyContent="space-between">
          <StatCard
            title="Ressources sauvegardées"
            value={savedResources.length}
            icon="bookmark"
          />
          <StatCard
            title="Deals favoris"
            value={savedDeals.length}
            icon="favorite"
          />
        </HStack>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        <VStack space={0}>
          <MenuItem
            title="Notifications push"
            />
            <menuItem
            title="Notifications push"
            icon="notifications"
            hasSwitch
            value={user?.preferences.notifications}
            onValueChange={(value) => {
              console.log('preference changed', value);
            }}
          />
          <MenuItem
  title="Services de localisation"
  icon="location-on"
  hasSwitch
  value={user?.preferences.locationServices}
  onValueChange={(value) => {
    console.log('preference changed', value);
  }}
/>

<MenuItem
  title="Catégories"
  icon="category"
  onPress={() => {
    // Navigate to categories selection
  }}
/>

        </VStack>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <VStack space={0}>
          <MenuItem
            title="Modifier le profil"
            icon="edit"
            onPress={() => { /* Navigate to edit profile */ }}
          />
          <MenuItem
            title="Changer le mot de passe"
            icon="lock"
            onPress={() => { /* Navigate to change password */ }}
          />
          <MenuItem
            title="Confidentialité"
            icon="security"
            onPress={() => { /* Navigate to privacy settings */ }}
          />
        </VStack>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aide</Text>
        <VStack space={0}>
          <MenuItem
            title="FAQ"
            icon="help-outline"
            onPress={() => { /* Navigate to FAQ */ }}
          />
          <MenuItem
            title="Nous contacter"
            icon="mail"
            onPress={() => { /* Navigate to contact */ }}
          />
          <MenuItem
            title="À propos"
            icon="info"
            onPress={() => { /* Navigate to about */ }}
          />
        </VStack>
      </View>

      <View style={styles.section}>
        <VStack space={0}>
          <MenuItem
            title="Conditions d'utilisation"
            icon="description"
            onPress={() => { /* Navigate to terms */ }}
          />
          <MenuItem
            title="Politique de confidentialité"
            icon="privacy-tip"
            onPress={() => { /* Navigate to privacy policy */ }}
          />
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <HStack alignItems="center" space={3}>
              <Icon name="logout" size={24} color="#E53E3E" />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </HStack>
          </TouchableOpacity>
        </VStack>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>EduConnect v1.0.0</Text>
        <Text style={styles.copyright}>© 2024 EduConnect. Tous droits réservés.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    fontFamily: 'Sorts Mill Goudy',
  },
  userInfo: {
    fontSize: 16,
    color: '#4A5568',
    fontFamily: 'Oranienbaum',
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
    fontFamily: 'Oranienbaum',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F6F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    fontFamily: 'Sorts Mill Goudy',
  },
  statTitle: {
    fontSize: 12,
    color: '#4A5568',
    fontFamily: 'Oranienbaum',
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  menuItemText: {
    fontSize: 16,
    color: '#2D3748',
    fontFamily: 'Oranienbaum',
  },
  logoutButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  logoutText: {
    fontSize: 16,
    color: '#E53E3E',
    fontFamily: 'Oranienbaum',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 1,
  },
  version: {
    fontSize: 14,
    color: '#718096',
    fontFamily: 'Oranienbaum',
  },
  copyright: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 4,
    fontFamily: 'Oranienbaum',
  },
});

export default ProfileScreen;