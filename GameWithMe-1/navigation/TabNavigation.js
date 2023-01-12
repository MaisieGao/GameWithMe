import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../screens/Home";
import Account from "../screens/Account";
import CreateNewGame from "../screens/CreateNewGame";
import GameDetails from "../screens/GameDetails";
import SignIn from "../screens/SignIn";
import SignUp from "../screens/SignUp";
import EditAccount from "../screens/EditAccount";
import EditGame from "../screens/EditGame";
import HostGames from "../screens/HostGames";
import JoinedGames from "../screens/JoinedGames";
import { Ionicons } from "@expo/vector-icons";
import Color from "../Color";

const HomeStack = createNativeStackNavigator();

const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator initialRouteName="Home">
      <HomeStack.Screen
        name="HomePage"
        component={Home}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="GameDetails"
        component={GameDetails}
        options={() => {
          return {
            title: "Game Details",
          };
        }}
      />
      <HomeStack.Screen
        name="EditGame"
        component={EditGame}
        options={() => {
          return {
            title: "Edit Game",
          };
        }}
      />
    </HomeStack.Navigator>
  );
};

const AccountStack = createNativeStackNavigator();

const AccountStackScreen = () => {
  return (
    <AccountStack.Navigator
      initialRouteName="Account"
      screenOptions={{
        headerTitleAlign: "center",
      }}
    >
      <AccountStack.Screen
        name="Account"
        component={Account}
        options={{ headerShown: false }}
      />
      <AccountStack.Screen
          name="SignIn"
          component={SignIn}
          options={{ headerShown: false }}
        />
        <AccountStack.Screen
          name="SignUp"
          component={SignUp}
          options={{ headerShown: false }}
        />
      <AccountStack.Screen
        name="EditAccount"
        component={EditAccount}
        options={() => {
          return {
            title: "Edit User Profile",
          };
        }}
      />
      <AccountStack.Screen
        name="HostGames"
        component={HostGames}
        options={() => {
          return {
            title: "Host Games",
          };
        }}
      />
      <AccountStack.Screen
        name="JoinedGames"
        component={JoinedGames}
        options={() => {
          return {
            title: "Joined Games",
          };
        }}
      />
      <AccountStack.Screen
        name="GameDetails"
        component={GameDetails}
        options={() => {
          return {
            title: "Game Details",
          };
        }}
      />
    </AccountStack.Navigator>
  );
};

const NewGameStack = createNativeStackNavigator();

const NewGameStackScreen = () => {
  return (
    <NewGameStack.Navigator initialRouteName="CreateNewGame" screenOptions={{}}>
      <NewGameStack.Screen
        name="CreateNewGame"
        component={CreateNewGame}
        options={() => {
          return {
            title: "Create a New Game",
          };
        }}
      />
    </NewGameStack.Navigator>
  );
};

export default function TabNavigatorScreen() {
  const TabNavigator = createBottomTabNavigator();

  return (
    <TabNavigator.Navigator
      initialRouteName="Account"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Color.colorAtTab1,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          }
          if (route.name === "Account") {
            iconName = focused ? "person-circle" : "person-circle-outline";
            size = 30;
          } else if (route.name === "New") {
            iconName = focused ? "add" : "add-outline";
            size = 40;
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Color.mainColorAtFormDate,
        tabBarInactiveTintColor: Color.white,
      })}
    >
      <TabNavigator.Screen name="Home" component={HomeStackScreen} />
      <TabNavigator.Screen name="New" component={NewGameStackScreen} />
      <TabNavigator.Screen name="Account" component={AccountStackScreen} />
    </TabNavigator.Navigator>
  );
}
