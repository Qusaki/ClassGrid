import { Link, Stack } from 'expo-router';
import { Image, StyleSheet, Text, View, TouchableOpacity, ImageBackground } from 'react-native';

export default function LandingPage() {
    return (
        <ImageBackground
            source={{ uri: 'https://i.pinimg.com/736x/23/98/a0/2398a0aa5dca1de3c2427a37c4ae5232.jpg' }}
            resizeMode="cover"
            style={styles.background}
        >
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />

                <View style={styles.logoContainer}>
                    {/* Using the local asset for the logo based on file listing */}
                    <Image
                        source={require('../assets/images/classgrid_logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Link href="/(auth_admin)/Adminlogin" asChild>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>Administrator</Text>
                        </TouchableOpacity>
                    </Link>

                    <Link href="/(auth_instructor)/Instructorlogin" asChild>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>Instructor</Text>
                        </TouchableOpacity>
                    </Link>

                    <Link href="/(auth_chair)/ProgChairlogin" asChild>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>Program Chairperson</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logo: {
        width: 150,
        height: 150,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333', // Dark text as seen in screenshot (logo has text but adding this just in case)
        marginTop: 10,
        // Note: Screenshot shows dark text "ClassGrid" below logo on grey background
        // Adjusting color to white if background is dark, or verify image
        color: 'black',
        textShadowColor: 'white',
        textShadowRadius: 2,
    },
    buttonContainer: {
        width: '80%',
        gap: 20,
    },
    button: {
        backgroundColor: '#007AFF', // Blue color from screenshot
        padding: 18,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
