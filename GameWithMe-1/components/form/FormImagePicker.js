
import React, { useState, useEffect } from 'react';
import { Image, Modal, View, Text, TextInput, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import * as ExpoImagePicker from 'expo-image-picker';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import PressableOpacity from '../PressableOpacity';

import { MaterialIcons } from '@expo/vector-icons';
import ImagePicker from './ImagePicker';
import { getImageUri } from '../../firebase/apis/images';
import Color from '../../Color';

const FormImagePicker = (props) => {
  const [imageUri, setImageUri] = useState(props.initialUri != undefined && props.initialUri.startsWith("http")? props.initialUri : "");
  const [cameraPermission, requestPermission] = ExpoImagePicker.useCameraPermissions();

  useEffect(() => {
    const parseUri = async () => {
      if (props.initialUri != undefined) {
        if (props.initialUri.startsWith('images/')) {
          const uri = await getImageUri(props.initialUri);
          setImageUri(uri);
        }
      }
    }
    parseUri();
  },[])

  return (
    <View style={[styles.container, props.style]}>
      <View><Text style={styles.label}>{props.label}</Text></View>
        {
          imageUri?
          <View>
            <Image style={[styles.preview, props.style.preview]} source={{uri: imageUri}}></Image>
            <PressableOpacity onPress={() => {setImageUri(''); props.onChange('')}}>
              <Text style={{color:Color.colorFormDate4}}>Remove</Text>
            </PressableOpacity>
          </View>
          :
          <ImagePicker onChange={(uri) => {setImageUri(uri); props.onChange(uri)}}>
            <MaterialIcons name="add-photo-alternate" size={40} color={Color.colorFormDate4} />
          </ImagePicker>
        }
        {
          props.error?
          <Text style={styles.error}>
            {props.error.message}
          </Text>
          :
          <></>
        }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // borderWidth: 1, // debug
    // borderColor: '#fff' //debug
  },
  label: {
    color: Color.colorFormDate1,
    // fontFamily: 'Lato',
    fontSize: 16,
    fontWeight:'bold'
  },
  preview: {
    color: Color.colorFormImg1,
    width: wp('60%'),
    height: wp('80%'),
  },
  error: {
    height: 20,
    fontSize: 14,
    color: Color.colorFormDate6,
  },
});

export default FormImagePicker;
