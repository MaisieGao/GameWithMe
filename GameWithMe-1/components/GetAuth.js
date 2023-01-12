import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { auth } from "../firebase/firebase-setup";
import TabNavigatorScreen from "../navigation/TabNavigation";
import SignIn from "../screens/SignIn";
import SignUp from "../screens/SignUp";
import Account from "../screens/Account";
import { onAuthStateChanged } from "firebase/auth";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Color from "../Color";
export default function GetAuth() {
  const [uid, setUid] = useState("");
  //check whether user has logged in
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(auth.currentUser.uid);
      } else {
        setUid("");
      }
    });
  }, [uid]);
  const AuthStack = createNativeStackNavigator();

  const AuthStackfunction = () => {
    //make the initial page to be the signin page
    return (
      <AuthStack.Navigator initialRouteName="SignIn">
        <AuthStack.Screen
          name="SignIn"
          component={SignIn}
          options={{ headerShown: false }}
        />
        <AuthStack.Screen
          name="SignUp"
          component={SignUp}
          options={{ headerShown: false }}
        />
        <AuthStack.Screen
          name="Account"
          component={Account}
          options={{ headerShown: false }}
        />
      </AuthStack.Navigator>
    );
  };
  const AppStack = () => {
    return <TabNavigatorScreen />;
  };
  //if not logged in, go to signin page and can navigate to signup page
  //if logged in, go to navigatorscreen to access all the pages
  return (
    <SafeAreaView style={styles.container}>
      {uid ? AppStack() : AuthStackfunction()}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
});
