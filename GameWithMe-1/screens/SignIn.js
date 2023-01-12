import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Image,
  ImageBackground,
  Alert,
} from "react-native";
import { Input, Button, Divider } from "react-native-elements";
import React, { useState } from "react";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/FontAwesome";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase/firebase-setup";
import Color from "../Color";

export default function SignIn() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //set limitation and alert for password
  const handleSignIn = async () => {
    if (password.length < 6) {
      Alert.alert("Password is too short");
      return;
    }
    //sign in using email and password into firebase
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      console.log(userCred);
      navigation.navigate("Account");
    } catch (err) {
      console.log(err);
      Alert.alert(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />

      <View style={styles.boxContainer}>
        <ImageBackground
          source={require("../assets/signin3.png")}
          resizeMode="cover"
          imageStyle={styles.image}
        >
          <Input
            placeholder=" Email"
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.input}
            leftIcon={<Icon name="user" size={24} color={Color.mainColorAtFormDate} />}
            onChangeText={(newText) => {
              setEmail(newText);
            }}
            value={email}
            keyboardType="email-address"
            placeholderTextColor={Color.signColor1}
          />
          <Input
            placeholder=" Password"
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.input}
            leftIcon={<Icon name="key" size={24} color={Color.mainColorAtFormDate} />}
            onChangeText={(newText) => {
              setPassword(newText);
            }}
            value={password}
            secureTextEntry={true}
            placeholderTextColor={Color.signColor1}
          />
          <View>
            <Button
              type="clear"
              title="Sign In"
              titleStyle={styles.title}
              containerStyle={styles.buttonContainer}
              onPress={handleSignIn}
            />
          </View>

          <Divider />
          <View style={styles.regBtnContainer}>
            {/* if not have an account, navigate to signup page */}
            <Text style={styles.notice}>Don't Have An Account?</Text>
            <Button
              type="clear"
              title="Register"
              titleStyle={styles.title}
              onPress={() => navigation.navigate("SignUp")}
            />
          </View>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Color.background,
  },
  boxContainer: {
    width: wp("80%"),
    height: wp("78%"),
  },
  logo: {
    width: wp("70%"),
    height: wp("30%"),
  },
  image: {
    opacity: 0.7,
    borderRadius: 15,
  },
  inputContainer: {
    marginTop: wp("1%"),
    marginLeft: wp("7%"),
    width: wp("60%"),
    borderBottomColor: Color.mainColorAtFormDate,
    borderBottomWidth: 1,
  },
  input: {
    color: Color.white,
    fontWeight: "500",
  },
  buttonContainer: {
    marginBottom: wp("4%"),
  },
  notice: {
    color: Color.colorFormImg1,
    fontSize: wp("4%"),
    marginBottom: wp("2%"),
  },
  regBtnContainer: {
    alignItems: "center",
    paddingTop: wp("5%"),
  },
  title: {
    color: Color.mainColorAtFormDate,
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
});
