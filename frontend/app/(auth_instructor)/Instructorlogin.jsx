import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ImageBackground, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, Alert, ActivityIndicator } from 'react-native';
import useAuthStore from '../../store/authStore';

export default function Example() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    const success = await login(form.email, form.password);
    if (success) {
      // Navigate to Instructor Menu
      router.replace('/(tabs_instructor)');
    } else {
      Alert.alert('Login Failed', error || 'Invalid credentials');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={{
          uri: 'https://i.pinimg.com/736x/23/98/a0/2398a0aa5dca1de3c2427a37c4ae5232.jpg',
        }}
        resizeMode="cover"
        style={styles.backgroundContainer}
      >
        <View style={styles.contentOverlay}>
          {/* Back button removed to use native header */}
          <View style={styles.container}>
            <View style={styles.header}>
              <Image
                alt="App Logo"
                resizeMode="contain"
                style={styles.headerImg}
                source={{ uri: 'https://scontent.fmnl17-6.fna.fbcdn.net/v/t1.15752-9/542009147_764160926408947_8654842669446252397_n.png?_nc_cat=109&ccb=1-7&_nc_sid=9f807c&_nc_ohc=1LA14WUL2bgQ7kNvwFwFlzS&_nc_oc=AdkyrtHw14d1JqV-Sfv7qgk_tlT_K84IFHD1Hsn4TnMIzUwLz46WRwEujuCkYDA-yKU&_nc_zt=23&_nc_ht=scontent.fmnl17-6.fna&oh=03_Q7cD3wGITjkEzUUXDCtYx4E_57rZszoC_bkEXJGgoUfGDgcbPA&oe=6934E5AE' }} />

              <Text style={styles.title}>
                Instructor <Text style={{ color: '#686869ff' }}></Text>
              </Text>

              <Text style={styles.subtitle}>
                Create you schedule hussle free!
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.input}>
                <Text style={styles.inputLabel}>Instructor ID</Text>

                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  keyboardType="default"
                  onChangeText={email => setForm({ ...form, email })}
                  placeholder="Enter Instructor ID"
                  placeholderTextColor="#6b7280"
                  style={styles.inputControl}
                  value={form.email} />
              </View>

              <View style={styles.input}>
                <Text style={styles.inputLabel}>Password</Text>

                <TextInput
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  onChangeText={password => setForm({ ...form, password })}
                  placeholder="********"
                  placeholderTextColor="#6b7280"
                  style={styles.inputControl}
                  secureTextEntry={true}
                  value={form.password} />
              </View>

              <View style={styles.formAction}>
                <Pressable style={styles.button} onPress={handleLogin} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Sign in</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
  },
  contentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(119, 119, 118, 0.6)',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'gray',
    borderRadius: 5,
  },
  backButtonPressed: {
    backgroundColor: 'red',
  },
  backButtonText: {
    color: '#ffffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    padding: 24,
  },
  title: {
    fontSize: 31,
    fontWeight: '700',
    color: '#fdfcfcff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fdfcfcff',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 36,
  },
  headerImg: {
    width: 165,
    height: 165,
    alignSelf: 'center',
    marginBottom: 8,
  },
  form: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  formAction: {
    marginTop: 4,
    marginBottom: 16,
    alignItems: 'center',
  },
  formLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#075eec',
    textAlign: 'center',
  },
  formFooter: {
    paddingVertical: 24,
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    letterSpacing: 0.15,
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fdfcfcff',
    marginBottom: 8,
  },
  inputControl: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
    borderStyle: 'solid',
  },
  button: {
    height: 50,
    width: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 119, 255, 1)',
    margin: 30,
    marginTop: 30,
  },
  buttonPressed: {
    backgroundColor: 'darkgreen',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
