import React, { useState, useEffect } from "react";
import { StyleSheet, View, SafeAreaView, Image, FlatList } from "react-native";
import Card from "../components/Card.js";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase/firebase-setup.js";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import Color from "../Color.js";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

export default function Home() {
  const [games, setGames] = useState([]);
  const navigation = useNavigation();
  const verifyPermission = async () => {
    const permissionStatus = await Notifications.getPermissionsAsync();
    if (permissionStatus.granted) {
      return true;
    }
    const requestedPermission = await Notifications.requestPermissionsAsync({
      ios: {
        allowBadge: true,
      },
    });
    return requestedPermission.granted;
  };

  //get all the data from games collection and show each game in the flatlist
  useEffect(() => {
    onSnapshot(collection(firestore, "games"), 
    (querySnapshot) => {
      if (querySnapshot.empty) {
        setGames([]);
        return;
      }
      setGames(
        querySnapshot.docs.map((snapDoc) => {
          let data = snapDoc.data();
          data = { ...data, key: snapDoc.id };
          return data;
        })
      );
    },
    (error) => {
      console.log("onSnapShot disconnected");
    });
  }, []);

  useEffect(() => {
    //after received notification, navigate to home page
    const subscription = Notifications.addNotificationReceivedListener(
      (notificaftion) => {
        console.log("notification received ", notificaftion);
        navigation.navigate("HomePage");
      }
    );

    return () => {
      subscription.remove();
    };
  });

  useEffect(() => {
    const getPushToken = async () => {
      const hasPermission = verifyPermission();
      if (!hasPermission) {
        return;
      }
      try {
        const token = await Notifications.getExpoPushTokenAsync();
        console.log("push token is " + token.data);
      } catch (err) {
        console.log("push token ", err);
      }
    };
    getPushToken();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.margin}>
        <Image source={require("../assets/logo.png")} style={styles.image} />
      </View>

      <View style={styles.scroll}>
        {games ? (
          <FlatList
            data={games}
            // obj has three things--item, index, separators
            renderItem={(game) => {
              console.log("rendergame", game.item);
              return <Card game={game.item} />;
            }}
            contentContainerStyle={styles.contentContainer}
          ></FlatList>
        ) : (
          <View></View>
        )}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  margin: {
    marginTop: Platform.OS === "ios" ? wp("5%") : wp("13%"),
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: wp("70%"),
    height: wp("30%"),
  },

  scroll: {
    flex: 20,
    marginTop: wp("3%"),
  },
});
