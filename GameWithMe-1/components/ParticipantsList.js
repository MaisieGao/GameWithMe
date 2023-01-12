import React, { useEffect, useState } from 'react'
import { View, Image, Text, StyleSheet, } from 'react-native'

import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { useNavigation } from '@react-navigation/native';
import { getImageUri } from '../firebase/apis/images';
import Color from '../Color';

export default function ParticipantsList({ participant }) {
  const [image, setImage] = useState();
  const navigation = useNavigation();
  // const id = game.id

  // get DM, image from firestore
  useEffect(() => {

    const getIcon = async () => {
      const img = await getImageUri(participant.avatar)
      console.log(img);
      setImage(img);
      // console.log("+++++" + img);
    }
    getIcon();

  })

  return (
    <View style={{flexDirection: 'row'}}>
      <Image source={{ uri: image }} resizeMode="stretch" style={styles.userIcon} />
      <Text style={styles.word}>{participant.username}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  word: {
    color: Color.white,
    fontSize: wp('4%'),
    marginLeft: wp('2%'),
    alignSelf: 'flex-start',
    marginTop: wp('1%'),
  },
  userIcon: {
    width: wp('5%'),
    height: wp('5%'),
    borderWidth: 1
  },
})