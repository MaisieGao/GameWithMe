import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { auth } from "../firebase/firebase-setup";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import { getUserByRef, getUsersByRefs } from "../firebase/apis/users";
import { onAuthStateChanged } from "firebase/auth";
import { onSnapshot, doc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-setup";
import { getImageUri } from "../firebase/apis/images";
import { addUserToGame, removeUserFromGame } from "../firebase/apis/games";
import ParticipantsList from "./ParticipantsList";
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import PressableOpacity from "./PressableOpacity";
import Color from "../Color";

export default function DetailCard({ game }) {
  const [uid, setUid] = useState(auth.currentUser ? auth.currentUser.uid : "");
  const [dm, setDM] = useState([]);
  const [posterImage, setposterImage] = useState();
  const [dmImage, setDmImage] = useState();
  const [participants, setParticipants] = useState([]);
  const navigation = useNavigation();
  const [haveParticipated, setHaveParticipated] = useState(false);
  const [location, setLocation] = useState('');
  // const id = game.id
  // get DM, image from firestore

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(auth.currentUser.uid);
      } else {
        setUid("");
      }
    });

    const getDM = async () => {
      const dm = await getUserByRef(game.dmRef);
      setDM(dm);
      const img = await getImageUri(dm.avatar);
      setDmImage(img);
    };

    const getParticipants = async () => {
      const allParticipants = await getUsersByRefs(game.participants);
      setParticipants(allParticipants);
      for (var i = 0; i < allParticipants.length; i++) {
        console.log(allParticipants[i].id, uid);
        if (allParticipants[i].id == uid) {
          console.log("FOUND");
          setHaveParticipated(true);
        }
      }

      console.log("participants", allParticipants);
    };

    const getPoster = async () => {
      const img = await getImageUri(game.poster);
      console.log(img);
      setposterImage(img);
    };

    getDM();
    getPoster();
    getParticipants();
  }, [game]);

  // get user current geolocation
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log(status)
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      console.log('current location', location);
      console.log('game location', {lat: game.location.lat, lng: game.location.lng})
    })();
  }, [game])

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
  }, [])

  async function editGame() {
    navigation.navigate("EditGame", game);
  }

  async function quitGame() {
    Alert.alert("Warning", "Are you sure you want to quit this game?",
      [
        { text: "Cancel", onPress: ()=>{} },
        { text: "OK", onPress: () => {
          removeUserFromGame(auth.currentUser.uid, game.key);  
          navigation.goBack();
        }}
      ]
    )
  }

  async function full() {
    Alert.alert("Sorry", "This game has no position!", [
      {
        text: "OK",
        style: "cancel",
        onPress: async () => {
          navigation.navigate("HomePage");
        },
      },
    ]);
  }

  async function application() {
    if (uid == "") {
      console.log("He/she has not logged in");
      Alert.alert("NOTICE", "You need to log in Firstly", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log in",
          onPress: async () => {
            navigation.navigate("Account");
          },
        },
      ]);
    } else if (uid != "" || uid != null) {
      Alert.alert("NOTICE", "Do you want to participate this game?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            // await userJoinGame
            Alert.alert("Congratulation", "You have joined this game！", [
              {
                text: "Yes",
                onPress: async () => {
                  await addUserToGame(uid, game.key);
                  navigation.navigate("HomePage");
                },
              },
            ]);
          },
        },
      ]);
      console.log("This is logged user");
    }
  }

  return (
    <View>
      <View style={styles.container}>
        <Image
          source={{ uri: posterImage }}
          resizeMode="stretch"
          style={styles.poster}
        />
        <View style={styles.box}>
          <Text style={styles.title}>{game.title}</Text>
          <View style={styles.content}>
            <Text style={styles.word}>
              <FontAwesome name="calendar" size={Platform.OS === 'ios' ?24:18} color={Color.white} />{" "}
              &nbsp;{game.date}
            </Text>
            <View style={styles.usereBox}>
              <Text style={styles.word}>
                <FontAwesome5 name="user-friends" size={Platform.OS === 'ios' ?24:17} color={Color.white} />{" "}
                &nbsp;{game.participants.length} / {game.playerLimit}{" "}
              </Text>
              <Text style={styles.word}>
                <Octicons name="location" size={Platform.OS === 'ios' ?24:16} color={Color.white} />&nbsp;
                {
                  location !== ''?
                  (getDistance(
                    {latitude: location.coords.latitude, longitude: location.coords.longitude},
                    {latitude: game.location.lat, longitude: game.location.lng}
                  ) / 1000).toFixed(1)
                  :'?'
                }
                {" km"} 
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.box2}>
        <View style={styles.content}>
          <Text style={styles.word4}>DM:</Text>
          <View style={styles.littleBox}>
            <Image
              source={{ uri: dmImage }}
              resizeMode="stretch"
              style={styles.userIcon}
            />
            <Text style={styles.word3}>{dm.username}</Text>
          </View>
          <Text style={styles.word4}>Description:</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.word3}>{game.description}</Text>
          </View>
          <Text style={styles.word4}>Participants:</Text>

          <View style={styles.littleBox}>
            {participants ? (
              <FlatList
                data={participants}
                renderItem={(participant) => {
                  return <ParticipantsList participant={participant.item} />;
                }}
                contentContainerStyle={styles.contentContainer}
              ></FlatList>
            ) : (
              <View></View>
            )}
          </View>
        </View>
        <View style={styles.buttonBox}>
          <PressableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  dm.id == uid
                    ? Color.detailCard1
                    : haveParticipated
                    ? Color.detailCard2
                    : game.participants.length < game.playerLimit
                    ? Color.mainColorAtFormDate
                    : Color.detailCard3,
              },
            ]}
            onPress={
              dm.id == uid
                ? editGame
                : haveParticipated
                ? quitGame
                : game.participants.length < game.playerLimit
                ? application
                : full
            }
          >
            <Text style={styles.buttonText}>
              {dm.id == uid
                ? "Edit Game"
                : haveParticipated
                ? "Quit Game"
                : game.participants.length < game.playerLimit
                ? "Participate"
                : "Not Applicable"}
            </Text>
          </PressableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: wp("5%"),
    paddingRight: wp("5%"),
    paddingTop: Platform.OS === 'ios' ?wp("4.5%"):wp("6%"),
    paddingBottom: Platform.OS === 'ios' ?wp("4.5%"):wp("6%"),
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: Color.backgroundColorAtCard1,
    opacity: 0.8,
    boxShadow: Color.shadow1,
    shadowOffset: { width: 2, height: 5 },
    shadowOpacity: 0.3,
    elevation: 20,
  },
  content: {
    marginTop: wp("1%"),
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
  userIcon: {
    width: wp("8%"),
    height: wp("8%"),
    borderWidth: 1,
  },
  title: {
    marginTop: wp("-2.5%"),
    color: Color.mainColorAtFormDate,
    fontSize: wp("5.5%"),
    marginLeft: 4,
    fontWeight: "bold",
    marginBottom: wp("1.5%"),
  },
  box: {
    marginLeft:  Platform.OS === 'ios' ?wp("8%"):wp("5.5%"),
    width: wp("42%"),
    height: wp("35%"),
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  box2: {
    width: wp("80%"),
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },

  word: {
    color: Color.white,
    fontSize: Platform.OS === 'ios' ?wp("4%"):wp("3.5%"),
    marginLeft: 4,
    alignSelf: "flex-start",
    marginTop: wp("3%"),
  },
  word2: {
    color: Color.white,
    fontSize: wp("4%"),
    marginLeft: wp("1%"),
    alignSelf: "flex-start",
    marginTop: wp("3%"),
  },
  word3: {
    color: Color.white,
    fontSize: wp("4%"),
    marginLeft: wp("2%"),
    alignSelf: "flex-start",
    marginTop: wp("3%"),
  },
  word4: {
    color: Color.white,
    fontSize: wp("4%"),
    marginLeft: 4,
    alignSelf: "flex-start",
    marginTop: wp("2%"),
    paddingTop: wp("2%"),
    marginBottom: wp("2%"),
    fontWeight: "bold",
  },
  pressedItem: {
    color: Color.detailCard4,
  },
  location: {
    color: Color.white,
    marginLeft: wp("30%"),
  },
  buttonText: {
    fontSize: wp("5%"),
    color: Color.detailCard5,
  },
  button: {
    height: wp("8%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp("5%"),
    marginBottom: wp("7%"),
    marginTop: wp("7%"),
    width: wp("70%"),
    // marginTop : wp('8%'),
  },
  littleBox: {
    flexDirection: "row",
    backgroundColor: Color.backgroundColorAtCard1,
    width: wp("100%"),
    opacity: 0.8,
    boxShadow: Color.shadow1,
    shadowOffset: { width: 2, height: 5 },
    shadowOpacity: 0.3,
    elevation: 20,
    borderColor: Color.mainColorAtFormDate,
    paddingLeft: wp("5%"),
    paddingTop: wp("3%"),
    paddingBottom: wp("3%"),
    paddingRight: wp("5%"),
    borderRadius: 5,
  },
  descriptionBox: {
    flexDirection: "row",
    backgroundColor: Color.backgroundColorAtCard1,
    width: wp("100%"),
    opacity: 0.8,
    boxShadow: Color.shadow1,
    shadowOffset: { width: 2, height: 5 },
    shadowOpacity: 0.3,
    elevation: 20,
    borderColor: Color.mainColorAtFormDate,
    paddingLeft: wp("5%"),
    paddingTop: wp("1%"),
    paddingBottom: wp("3%"),
    paddingRight: wp("5%"),
  },
  buttonBox: {
    marginLeft: wp("15%"),
  },
});
