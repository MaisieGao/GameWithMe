import {
  View,
  Alert,
  Text,
  ImageBackground,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import { Input, Button, Divider } from "react-native-elements";
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/FontAwesome";
import { auth } from "../firebase/firebase-setup";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { createUser } from "../firebase/apis/users";
import Color from "../Color";

export default function SignUp({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [Confirmpassword, setConfirmpassword] = useState("");

  //set password limitation
  const handleSignUp = async () => {
    if (password.length < 6) {
      Alert.alert("Password is too short");
      return;
    }
    if (password != Confirmpassword) {
      Alert.alert("Password does not match");
      return;
    }
    //create user using email and password
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      createUser({
        id: userCred.user.uid,
        email: email,
        username: username,
      });
      navigation.navigate("Account");
    } catch (err) {
      console.log(err);
      Alert.alert(err.message);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.image} />

      <View style={styles.boxContainer}>
        <ImageBackground
          source={require("../assets/signin3.png")}
          resizeMode="cover"
          imageStyle={styles.backgroundPic}
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
            placeholderTextColor={Color.signColor2}
          />
          <Input
            placeholder=" Username"
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.input}
            leftIcon={<Icon name="user" size={24} color={Color.mainColorAtFormDate} />}
            onChangeText={(newText) => {
              setUsername(newText);
            }}
            value={username}
            keyboardType="email-address"
            placeholderTextColor={Color.signColor2}
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
            placeholderTextColor={Color.signColor2}
          />
          <Input
            placeholder="Confirm Password"
            placeholderTextColor={Color.signColor2}
            inputContainerStyle={styles.inputContainer}
            secureTextEntry
            inputStyle={styles.input}
            leftIcon={<Icon name="key" size={24} color={Color.mainColorAtFormDate} />}
            renderErrorMessage={false}
            value={Confirmpassword}
            onChangeText={(newText) => {
              setConfirmpassword(newText);
            }}
          />
          <View>
            <Button
              type="clear"
              title="Sign Up"
              titleStyle={styles.title}
              containerStyle={styles.buttonContainer}
              onPress={handleSignUp}
            />
          </View>

          <Divider />
          <View style={styles.regBtnContainer}>
            <Text style={styles.notice}>Already have an Account? Sign in</Text>
            <Button
              type="clear"
              title="Sign In"
              titleStyle={styles.title}
              onPress={() => navigation.navigate("SignIn")}
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
    height: wp("114%"),
  },
  backgroundPic: {
    borderRadius: 15,
    opacity: 0.7,
  },
  image: {
    width: wp("70%"),
    height: wp("30%"),
  },
  inputContainer: {
    marginTop: wp("0.5%"),
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
    marginTop: wp("3%"),
    marginBottom: wp("3%"),
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
