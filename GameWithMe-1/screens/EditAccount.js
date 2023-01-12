import { View,ImageBackground, Text,SafeAreaView, Pressable, Image, StyleSheet,TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState, useEffect } from 'react'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import FormInput from '../components/form/FormInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { auth } from '../firebase/firebase-setup';
import Color from '../Color';
import { useNavigation } from '@react-navigation/native'
import ImagePicker from '../components/form/ImagePicker';
import { useForm, Controller } from 'react-hook-form';
import PressableOpacity from '../components/PressableOpacity';

import { uploadImageByUri } from '../firebase/apis/images';

import { getUserById, updateUser } from '../firebase/apis/users';
import { getImageUri, deleteImage } from '../firebase/apis/images';

export default function EditAccount() {
  const navigation = useNavigation();
  const [avatar, setAvatar] = useState("")
  const [user, setUser] = useState("");

  const { register, unregister, setValue, handleSubmit, control, getValues, reset, formState: { errors } } = useForm({
    defaultValues: {
      avatar: "",
      username: "",
      city: "",
    },
  });

  useEffect(() => {
    const getUserInfo = async () => {
      const user = await getUserById(auth.currentUser.uid);
      const imageUri = await getImageUri(user.avatar);
      setUser(user);
      setAvatar(imageUri);
      setValue("username", user.username);
      setValue("city", user.city);
    }
    getUserInfo();
  }, [auth.currentUser])

  const submitForm = async (data) => {
    console.log("submit form with", data);
    try {
      if (data.avatar) {
        const imagePath = await uploadImageByUri(data.avatar);
        data.avatar = imagePath; // replace the image path to storage path on firebase
        // delete old image
        await deleteImage(user.avatar);
      } else {
        data.avatar = user.avatar; // use old avatar
      }
      
      if (auth.currentUser) {
        updateUser(auth.currentUser.uid, data);
        navigation.goBack();
      } else {
        throw 'current user is undefined';
      }
    } catch (err) {
      console.error('error submitting form', err);
      return;
    }

  }


  const rules = {
    username: {
      required: 'username cannot be empty',
      minLength: {
        value: 3,
        message: 'username must be longer than 3 characters',
      },
      maxLength: {
        value: 20,
        message: 'username must be shorter than 20 characters'
      },
      pattern: {
        value: /^[0-9a-zA-Z\s]+$/,
        message: 'only numbers and letters'
      }
    },
    city: {
      required: 'city cannot be empty',
      minLength: {
        value: 3,
        message: 'city must be longer than 3 characters',
      },
      maxLength: {
        value: 20,
        message: 'city must be shorter than 20 characters'
      },
      pattern: {
        value: /^[a-zA-Z\s]+$/,
        message: 'only letters'
      }
    },
  }

  return (
    <ImageBackground
      source={require("../assets/back8.jpg")}
      style={{width: '100%', height: '100%'}} 
    >
      <View style={styles.view}>
        <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
          <KeyboardAwareScrollView>
            <View style={styles.form}>
              <Image source={{uri: avatar}} resizeMode="cover" style={styles.profilePicture}/>
              <Controller
                control={control}
                name="avatar"
                render={({
                  field, fieldState, formState
                }) => (
                  <ImagePicker
                    onChange={(uri)=>{setAvatar(uri); field.onChange(uri)}}
                    value={field.value}
                  >
                    <View style={styles.button}>
                      <Text style={styles.buttonText1}>Change Avatar</Text>
                    </View>
                  </ImagePicker>
                )}
              />
              
              <Controller
                control={control}
                name="username"
                rules={rules.username}
                render={({
                  field, fieldState, formState
                }) => (
                  <FormInput
                    label="Username"
                    onChange={field.onChange}
                    defaultValue={getValues("username")}
                    error={fieldState.error}
                    value={field.value}
                    style={styles.section}/>
                )}
              />
              <Controller
                control={control}
                name="city"
                rules={rules.city}
                render={({
                  field, fieldState, formState
                }) => (
                  <FormInput
                    label="City"
                    defaultValue={getValues("city")}
                    onChange={field.onChange}
                    error={fieldState.error}
                    value={getValues("city")}
                    style={styles.section}/>
                )}
              />
              <View style={{flexDirection: 'row', marginTop: wp('8%'), justifyContent: 'space-between', alignItem: 'center'}}>
                <PressableOpacity style={styles.button2} onPress={handleSubmit((data) => {submitForm(data)})} >
                  <Text style={styles.buttonText2}>Confirm</Text>
                </PressableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  
  view:{
    alignItems:'center',
  },
  form: {
    width: wp('80%'),
    alignItems:'center',
  },

  buttonText1:{
    color: Color.detailCard5,
    fontSize:wp('5%'),
    marginLeft:wp('17%'),
  },
  buttonText2:{
    color: Color.detailCard5,
    fontSize:wp('5%'),

  },
  section: {
    marginVertical: wp('2%'),
    width: '100%',
    marginTop:wp('2%'),
    color: Color.white,
    fontWeight:'bold'
  },
  imageButton:{
      justifyContent:'center',
      alignItems:'center'
  },
  profilePicture: {
    marginTop: wp('10%'),
    width: wp('25%'),
    height: wp('25%'),
    borderRadius:wp('50%'),
  },
  button2: {
    height: wp('8%'),
    alignItems: 'center',
   justifyContent:'center',
    borderRadius: wp('5%'),
    marginTop: wp('2%'),
    width:wp('70%'),
    backgroundColor:Color.mainColorAtFormDate
  },
  button: {
    height: wp('8%'),
    borderRadius: wp('5%'),
    marginBottom: wp('7%'),
    marginTop: wp('9%'),
    width:wp('70%'),
    backgroundColor:Color.mainColorAtFormDate,
    justifyContent:"center"

  },
  image2:{
    height:wp('200%'),
  }
})