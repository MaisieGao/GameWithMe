import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  ImageBackground,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase-setup";
import { useNavigation } from "@react-navigation/native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Color from "../Color";
import { getUserById } from "../firebase/apis/users";
import { getImageUri } from "../firebase/apis/images";
import SignIn from "./SignIn";
import { onSnapshot, doc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-setup";
import * as Notifications from "expo-notifications";
import PressableOpacity from "../components/PressableOpacity";

export default function Account({ route }) {
  const [username, setUsername] = useState("");
  const [uid, setUid] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const navigation = useNavigation();

  const verifyPermission = async () => {
    //ask for notification permission
    const permissionStatus = await Notifications.getPermissionsAsync();
    if (permissionStatus.granted) {
      console.log("Notification is open");
      return true;
    }
    const requestedPermission = await Notifications.requestPermissionsAsync({
      ios: {
        allowBadge: true,
      },
    });
    console.log(requestedPermission);
    return requestedPermission.granted;
  };

  const scheduleNotificationHandler = async () => {
    //if have permission, set notifications
    try {
      const hasPermission = await verifyPermission();
      if (!hasPermission) {
        return;
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "You have a notification",
          body: `Please come back to find new games`,
          color: Color.red,
        },
        trigger: {
          seconds: 5,
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        //when logged in, change avatar,username, city, and email
        const getUserInfo = async () => {
          setUid(auth.currentUser.uid);
          const user = await getUserById(uid);
          setUsername(user.username);
          setCity(user.city);
          setEmail(user.email);
          const imgUrl = await getImageUri(user.avatar);
          setAvatar(imgUrl);
        };

        getUserInfo();
        //if changed, update avatar,username, city, and email
        const updateUserInfo = async (newData) => {
          setAvatar(await getImageUri(newData.avatar));
          setCity(newData.city);
          setUsername(newData.username);
        };
        onSnapshot(doc(firestore, "users", auth.currentUser.uid), 
        (doc) => {
          console.log(doc.data());
          const newData = doc.data();
          updateUserInfo(newData);
        },
        (error) => {
          console.log("onSnapshot disconnected");
        });
      } else {
        setUid("");
      }
    });
  }, [uid]);
  //sign out
  const signOutHandler = () => {
    signOut(auth);
    navigation.navigate("SignIn");
  };
  //navigate to different pages when press the buttons
  const editHandler = () => {
    navigation.navigate("EditAccount");
  };
  const joinedGameHandler = () => {
    navigation.navigate("JoinedGames");
  };
  const hostedGameHandler = () => {
    navigation.navigate("HostGames");
  };
  const NotificationHandler = () => {
    Alert.alert("Notification", "Do you want to schedule local notification?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: scheduleNotificationHandler,
      },
    ]);
  };
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.box}>
          <ImageBackground
            source={require("../assets/pic8.png")}
            resizeMode="cover"
            style={styles.image}
          >
            <View style={styles.editBox}>
              <PressableOpacity onPress={editHandler}>
                <View tyle={styles.editbutton}>
                  <Text style={styles.edit}>Edit</Text>
                </View>
              </PressableOpacity>
            </View>
            <View style={styles.profile}>
              <View style={styles.photoBox}>
                <Image
                  source={{ uri: avatar }}
                  resizeMode="cover"
                  style={styles.profilePhoto}
                />
              </View>
            </View>
            {/* give a default name */}
            <View style={styles.wordBox}>
              <Text style={styles.largeWord}>{username}</Text>
              <Text style={styles.word}>{city}</Text>
              <Text style={styles.word}>{email}</Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.margin}>
          <PressableOpacity onPress={hostedGameHandler}>
            <View style={styles.smallBox}>
              <ImageBackground
                source={require("../assets/pic1.png")}
                resizeMode="cover"
                style={styles.image2}
              >
                <View style={styles.button}>
                  <Text style={styles.appButton}>Host Games</Text>
                </View>
              </ImageBackground>
            </View>
          </PressableOpacity>

          <PressableOpacity onPress={joinedGameHandler}>
            <View style={styles.smallBox}>
              <ImageBackground
                source={require("../assets/pic2.png")}
                resizeMode="cover"
                style={styles.image2}
              >
                <View style={styles.button}>
                  <Text style={styles.appButton}>Joined Games</Text>
                </View>
              </ImageBackground>
            </View>
          </PressableOpacity>

          <PressableOpacity onPress={NotificationHandler}>
            <View style={styles.smallBox}>
              <ImageBackground
                source={require("../assets/pic4.png")}
                resizeMode="cover"
                style={styles.image2}
              >
                <View style={styles.button}>
                  <Text style={styles.appButton}>
                    Schedule local Notification
                  </Text>
                </View>
              </ImageBackground>
            </View>
          </PressableOpacity>

          <PressableOpacity onPress={signOutHandler}>
            <View style={styles.smallBox}>
              <ImageBackground
                source={require("../assets/pic3.png")}
                resizeMode="cover"
                style={styles.image2}
              >
                <View style={styles.button}>
                  <Text style={styles.appButton}>Sign Out</Text>
                </View>
              </ImageBackground>
            </View>
          </PressableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  profile: {
    flexDirection: "row",
    marginTop: wp("1%"),
  },
  margin: {
    marginTop: wp("5%"),
  },
  image: {
    opacity: 0.9,
    width: wp("100%"),
    height: Platform.OS === "ios" ? wp("62%") : wp("78%"),
  },
  box: {
    width: wp("100%"),
    height: Platform.OS === "ios" ? wp("62%") : wp("78%"),
    flexDirection: "column",
    borderRadius: 5,
  },
  wordBox: {
    justifyContent: "center",
    alignItems: "center",
  },
  smallBox: {
    marginTop: wp("2%"),
    width: wp("100%"),
    height: wp("16%"),
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: Color.brown,
    borderRadius: 5,
  },
  photoBox: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp("40%"),
  },
  profilePhoto: {
    marginTop: wp("3%"),
    width: wp("20%"),
    height: wp("20%"),
    borderRadius: wp("50%"),
  },
  image2: {
    opacity: 0.9,
    width: wp("100%"),
    height: wp("16%"),
  },
  largeWord: {
    marginTop: wp("3.5%"),
    marginLeft: wp("2%"),
    color: Color.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  word: {
    marginTop: wp("2%"),
    marginLeft: wp("2%"),
    color: Color.white,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    color: Color.mainColorAtFormDate,
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    height: wp("16%"),
  },
  buttonBox: {
    marginLeft: -30,
    marginTop: wp("4%"),
    flexDirection: "row",
    width: wp("100%"),
    justifyContent: "space-between",
  },
  appButton: {
    color: Color.white,
    fontWeight: "bold",
    fontSize: wp("5%"),
  },
  edit: {
    color: Color.black,
    fontWeight: "bold",
    fontSize: 18,
  },

  editBox: {
    height: wp("8%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp("5%"),
    marginLeft: Platform.OS === "ios" ? wp("78%") : wp("75%"),
    marginTop: Platform.OS === "ios" ? wp("3%") : wp("13%"),
    width: wp("20%"),
    backgroundColor: Color.mainColorAtFormDate,
  },
});
