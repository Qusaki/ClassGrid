import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AuthLayout() {
    const router = useRouter();

    return (
        <Stack screenOptions={{
            headerShown: true,
            headerTransparent: true,
            headerTintColor: 'white',
            title: '',
            headerLeft: () => (
                <TouchableOpacity 
                    onPress={() => router.back()}
                    style={{ marginLeft: 15, marginTop: 40 }}
                >
                    <Ionicons name="arrow-back" size={30} color="white" />
                </TouchableOpacity>
            ),
        }} />
    );
}
