import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ImageBackground,
  SafeAreaView,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import DetailCard from "../components/DetailCard";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase/firebase-setup.js";
import Color from "../Color";

export default function GameDetails({ route }) {
  const gameID = route.params.key;
  const [games, setGames] = useState([]);
  // console.log("g   " + games);

  useEffect(() => {
    onSnapshot(collection(firestore, "games"), 
    (query) => {
      setGames(
        query.docs.map((snapDoc) => {
          if (snapDoc.id == gameID) {
            let data = snapDoc.data();
            data = { ...data, key: snapDoc.id };
            return data;
          }
        })
      );
    },
    (error) => {
      console.log("onSnapShot disconnected");
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scroll}>
        <ImageBackground
          source={require("../assets/back2.png")}
          resizeMode="cover"
          imageStyle={styles.image2}
        >
          {games ? (
            <FlatList
              data={games}
              renderItem={(game) => {
                if (typeof game.item != "undefined") {
                  return <DetailCard game={game.item} />;
                }
              }}
              contentContainerStyle={styles.contentContainer}
            ></FlatList>
          ) : (
            <View></View>
          )}
        </ImageBackground>
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
    marginTop: wp("5%"),
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: wp("70%"),
    height: wp("30%"),
  },
  scroll: {
    flex: 20,
  },
  image2: {
    height: wp("200%"),
  },
});
