import React, { useState, useEffect } from 'react';
import { Alert, Pressable, View, Text, TextInput, StyleSheet } from 'react-native'
import * as ExpoImagePicker from 'expo-image-picker';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import PressableOpacity from '../PressableOpacity';
import Color from '../../Color';

const ImagePicker = (props) => {
  const [cameraPermission, requestPermission] = ExpoImagePicker.useCameraPermissions();
  const aspect = props.aspect? props.aspect : [4, 3]; // same as Home.js

  const takePicture = async () => {
    if (cameraPermission.status !== ExpoImagePicker.PermissionStatus.GRANTED) {
        const permission = await ExpoImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("missing camera permission");
          return;
        }
    }

    const result = await ExpoImagePicker.launchCameraAsync({
      quality: 0,
      aspect: aspect,
    });

    if (!result.canceled) {
      props.onChange(result.uri);
    }
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      quality: 0,
      aspect: aspect, // same as Home.js
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true,
    });

    if (!result.canceled) {
      props.onChange(result.uri)
    }
  };

  const chooseImageFrom = async () => {
    Alert.alert('Choose Image From', '', 
      [
        { text: "Gallery", onPress: pickImage,},
        { text: "Camera", onPress: takePicture}
      ])
  }

  return (
    <View style={[styles.container, props.style]}>
      <View style={styles.box}><Text style={styles.label}>{props.label}</Text></View>
      <PressableOpacity onPress={chooseImageFrom} style={{alignSelf: 'flex-start'}}>
        {props.children}
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  label: {
    marginBottom: wp('-5%'),
  },
  preview: {
    color: Color.colorFormImg1
  },
  image: {
    width: wp('32%'),
    height: wp('48%'),
  },
});

export default ImagePicker;