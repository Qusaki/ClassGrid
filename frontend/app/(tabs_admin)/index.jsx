import { Link } from 'expo-router'
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'

const LOGO_IMG = require('../../assets/images/classgrid_logo.png');

const App = () => {
  return (
    <ImageBackground
      source={{
        uri: 'https://i.pinimg.com/736x/23/98/a0/2398a0aa5dca1de3c2427a37c4ae5232.jpg', // Replace with your actual background image URL
      }}
      resizeMode="cover"
      style={styles.container}
    >
      <View style={styles.container}>
        <Image
          alt="App Logo"
          resizeMode="contain"
          style={styles.headerImg}
          source={LOGO_IMG}
        />

        <Link href="/Adminlogin" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Administrator</Text>
          </Pressable>
        </Link>
        <Link href="/Instructorlogin" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Instructor</Text>
          </Pressable>
        </Link>
        <Link href="/ProgChairlogin" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Program Chairperson</Text>
          </Pressable>
        </Link>
      </View>
    </ImageBackground>
  )
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: "flex-start",
    paddingTop: 80,
    padding: 20,
  },
  contentOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(119, 119, 118, 0.3)',
  },
  headerImg: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 100, // circle
  },
  button: {
    height: 50,
    width: 300,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 119, 255, 0.85)',
    padding: 14,
    marginVertical: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'League Spartan',
  },
})
