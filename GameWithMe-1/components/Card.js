import React, { useEffect, useState } from "react";
import { View, Image, Text, StyleSheet, ImageBackground } from "react-native";
import PressableOpacity from "./PressableOpacity";

import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import { getUserByRef } from "../firebase/apis/users";
import { onSnapshot, doc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-setup";
import { getImageUri } from "../firebase/apis/images";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import Color from "../Color";
export default function Card({ game }) {
  const [dm, setDM] = useState([]);
  const [image, setImage] = useState();
  const [location, setLocation] = useState("");
  const navigation = useNavigation();
  // const id = game.id
  const goToGame = () => {
    navigation.navigate("GameDetails", { key: game.key });
  };

  // get DM, image from firestore
  useEffect(() => {
    const getDM = async () => {
      const dm = await getUserByRef(game.dmRef);
      setDM(dm);
    };

    const getPoster = async () => {
      const img = await getImageUri(game.poster);
      console.log(img);
      setImage(img);
    };

    getDM();
    getPoster();
  }, [game]);

  // get user current geolocation
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log(status);
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      console.log("current location", location);
      console.log("game location", {
        lat: game.location.lat,
        lng: game.location.lng,
      });
    })();
  }, []);

  // listen on game document update
  useEffect(() => {
    onSnapshot(doc(firestore, "games", game.key), 
    (doc) => {
      game = doc.data();
      if(game) {
        game.key = doc.id;
      }
    },
    (error) => {
      console.log("onSnapshot disconnected");
    });
  }, []);

  return (
    <PressableOpacity style={styles.container} onPress={goToGame}>
      <Image
        source={{ uri: image }}
        resizeMode="stretch"
        style={styles.poster}
      />
      <View style={styles.box}>
        <Text style={styles.title}>{game.title}</Text>
        <View style={styles.content}>
          <Text style={styles.word}>DM: {dm.username}</Text>
          <Text style={styles.word}>
            <FontAwesome
              name="calendar"
              size={Platform.OS === "ios" ? 24 : 16}
              color={Color.white}
            />{" "}
            &nbsp;{game.date}
          </Text>

          <View style={styles.littleBox}>
            <Text style={styles.word}>
              <FontAwesome5
                name="user-friends"
                size={Platform.OS === "ios" ? 24 : 16}
                color={Color.white}
              />{" "}
              &nbsp;{game.participants.length} / {game.playerLimit}{" "}
            </Text>
            <Text style={styles.word2}>
              <Octicons
                name="location"
                size={Platform.OS === "ios" ? 24 : 16}
                color={Color.white}
              />
              &nbsp;
              {location !== ""
                ? (
                    getDistance(
                      {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                      },
                      {
                        latitude: game.location.lat,
                        longitude: game.location.lng,
                      }
                    ) / 1000
                  ).toFixed(1)
                : "?"}
              {" km"}
            </Text>
          </View>
        </View>
      </View>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: wp("5%"),
    paddingLeft: wp("5%"),
    paddingRight: wp("5%"),
    paddingTop: Platform.OS === "ios" ? wp("4%") : wp("5%"),
    paddingBottom: Platform.OS === "ios" ? wp("4%") : wp("5%"),
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: Color.backgroundColorAtCard1,
    // opacity: 0.8,
    boxShadow: Color.shadow1,
    shadowOffset: { width: 2, height: 5 },
    shadowOpacity: 0.3,
    elevation: 20,
    borderColor: Color.mainColorAtFormDate,
  },
  content: {
    marginTop: wp("2%"),
  },
  littleBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  poster: {
    width: wp("30%"),
    height: wp("40%"),
    borderColor: Color.mainColorAtFormDate,
    borderWidth: 1,
  },
  title: {
    color: Color.mainColorAtFormDate,
    fontSize: Platform.OS === "ios" ? wp("6%") : wp("5%"),
    marginLeft: 4,
    fontWeight: "bold",
    marginTop: wp("-2%"),
  },
  box: {
    marginLeft: wp("10%"),
    width: wp("42%"),
    height: wp("35%"),
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },

  word: {
    color: Color.white,
    fontSize: Platform.OS === "ios" ? wp("4%") : wp("3.5%"),
    marginLeft: 4,
    alignSelf: "flex-start",
    marginTop: wp("3%"),
  },
  word2: {
    color: Color.white,
    fontSize: wp("4%"),
    marginLeft: Platform.OS === "ios" ? wp("13%") : wp("6.5%"),
    alignSelf: "flex-start",
    marginTop: Platform.OS === "ios" ? wp("3.5%") : wp("3%"),
  },
  pressedItem: {
    color: Color.colorAtCard2,
  },
  location: {
    color: Color.white,
    marginLeft: wp("30%"),
  },
});
