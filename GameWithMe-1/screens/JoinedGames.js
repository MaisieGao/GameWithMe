import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ImageBackground,
  Pressable,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Color from "../Color";
import { getUserById } from "../firebase/apis/users";
import { getGamesByRefs } from "../firebase/apis/games";
import { auth } from "../firebase/firebase-setup";
import { useNavigation } from "@react-navigation/native";
import PressableOpacity from "../components/PressableOpacity";

export default function JoinedGames() {
  const [uid, setUid] = useState(auth.currentUser.uid);
  const [games, setGames] = useState("");
  const navigation = useNavigation();

  //get joined games for the user
  //show each game in the flatlist
  useEffect(() => {
    const getJoinedGame = async () => {
      const user = await getUserById(uid);
      try {
        if (user.joined) {
          setGames(await getGamesByRefs(user.joined));
        }
      } catch (err) {
        console.error("error in JoinedGames", err);
      }
    };
    getJoinedGame();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <ImageBackground
          source={require("../assets/pic6.png")}
          resizeMode="cover"
          imageStyle={styles.image2}
        >
          <View style={styles.text}>
            {games.length != 0 ? (
              <FlatList
                data={games}
                // obj has three things--item, index, separators
                renderItem={(game) => {
                  const goToGame = () => {
                    navigation.navigate("GameDetails", { key: game.item.id });
                  };
                  console.log("1212" + game.item.id);
                  return (
                    <PressableOpacity onPress={goToGame}>
                      <Text style={styles.game}>{game.item.title}</Text>
                    </PressableOpacity>
                  );
                }}
                contentContainerStyle={styles.contentContainer}
              ></FlatList>
            ) : (
              <View style={styles.gamebox}>
                <Text style={styles.gameEmpty}>
                  You have not joined any game yet
                </Text>
              </View>
            )}
          </View>
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

  image2: {
    width: wp("100%"),
    height: wp("180%"),
  },
  buttonbox: {
    marginTop: wp("5%"),
    justifyContent: "center",
    alignItems: "center",
  },

  gamebox: {
    marginTop: wp("80%"),
    textAlign: "center",
    alignItems: "center",
    textAlign: "center",
  },
  gameEmpty: {
    color: Color.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  game: {
    backgroundColor: Color.backgroundColorAtCard1,
    width: wp("100%"),
    opacity: 0.8,
    boxShadow: Color.shadow1,
    shadowOffset: { width: 2, height: 5 },
    shadowOpacity: 0.3,
    elevation: 20,
    textAlign: "center",
    paddingTop: wp("4%"),
    paddingRight: wp("5%"),
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 15,
    shadowColor: Color.black,
    shadowOpacity: 0.3,
    height: wp("15%"),
    fontSize: 20,
    color: Color.white,
    fontWeight: "bold",
  },

  text: {
    marginTop: wp("5%"),
    marginLeft: wp("-4%"),
  },
});
