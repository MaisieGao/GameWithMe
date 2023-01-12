import { React, useState, useEffect } from 'react'
import { Alert, SafeAreaView,ImageBackground, Text, View, StyleSheet, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import Color from "../Color";
import FormInput from '../components/form/FormInput';
import FormDatePicker from '../components/form/FormDatePicker';
import FormImagePicker from '../components/form/FormImagePicker';
import FormLocationPicker from '../components/form/FormLocationPicker';
import PressableOpacity from '../components/PressableOpacity';

import { doc } from 'firebase/firestore';
import { createGame } from '../firebase/apis/games';
import { uploadImageByUri } from '../firebase/apis/images';
import { firestore, auth } from '../firebase/firebase-setup';

export default function CreateNewGame() {

  const navigation = useNavigation();

  const { register, setValue, setError, handleSubmit, control, getValues, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      date: '',
      playerLimit: '',
      location: '',
      description: '',
      poster: ''
    }
  });

  const rules = {
    title: {
      required: 'name is required',
      minLength: {
        value: 5,
        message: 'name must be longer than 5 characters',
      },
      maxLength: {
        value: 20,
        message: 'name must be shorter than 20 characters'
      },
      pattern: {
        value: /^[0-9a-zA-Z\s]+$/,
        message: 'only numbers and letters are allowed'
      }
    },
    location: {
      required: 'location is required',
      pattern: {
        value: /^[0-9a-zA-Z\s]+$/,
        message: 'only numbers and letters are allowed'
      },
      minLength: {
        value: 5,
        message: 'name must be longer than 5 characters',
      },
      maxLength: {
        value: 100,
        message: 'name must be shorter than 100 characters'
      },
    },
    date: {
      required: 'date is required'
    },
    playerLimit: {
      required: 'player limit is required',
      pattern: {
        value: /^[0-9]+$/,
        message: 'only numbers are allowed'
      }
    },
    description: {
      required: 'description is required',
      minLength: {
        value: 10,
        message: 'description must be longer than 10 characters'
      },
      maxLength: {
        value: 1000,
        message: 'description must be shorter than 1000 characters'
      },
    },
    poster: {
      required: 'poster is required',
    }
  }


  const submitForm = async (data) => {
    console.log("Creating game", data)

    // check user login information
    try {
      // add dm as current logged-in user or as unknown
      if (auth.currentUser) {
        data.dmRef = doc(firestore, 'users', auth.currentUser.uid);
      } else {
        navigation.navigate("Account");
        return ;
      }

      // upload the poster image first
      const imagePath = await uploadImageByUri(data.poster);
      data.poster = imagePath; // replace the local path to storage path on firebase
    } catch (err) {
      console.error('error uploading image', err);
      return ;
    }

    // check if location is valid(have geolocation)
    if(data.location.lat=== 0 && data.location.lng === 0) {
      setError("location", { type: 'custom', message: 'cannot find this location'})
      return;
    }

    try {
      console.log('uploading', data)
      await createGame(data);
      // show an message to indicate game created
      Alert.alert("Success");
      // return to home upon successfully creating a game
      navigation.goBack();
    } catch (err) {
      console.error('error uploading game form', err);
      return ;
    }
  }

  // Wrap with TouchableWithoutFeedback to cancel keyboard when user pressed outside of the input area
  // Wrap with KeyboardAvoidingView to avoid keyboard blocking the input area
  return (
    <ImageBackground source={require("../assets/back3.jpeg")} style={{width: '100%', height: '100%'}}>        
      <KeyboardAwareScrollView keyboardShouldPersistTaps={'always'}>
        <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}} style={styles.container}>
          <View style={styles.container}>
            <Controller
              control={control}
              name="title"
              rules={rules.title}
              render={({
                // field: { onChange, onBlur, value, name, ref },
                // fieldState: { isTouched, isDirty, error },
                field, fieldState, formState
              }) => (
                <FormInput
                  label="Module"
                  placeHolder="Module Name"
                  onChange={field.onChange}
                  error={fieldState.error}
                  value={field.value}
                  style={styles.section}/>
              )}
            />
            <Controller
              control={control}
              name="date"
              rules={rules.date}
              render={({
                field, fieldState, formState
              }) => (
                <FormDatePicker
                  label="Date"
                  placeHolder={(new Date()).toISOString().substring(0, 10)}
                  onChange={field.onChange}
                  error={fieldState.error}
                  value={field.value}
                  isTouched={fieldState.isTouched}
                  style={styles.section}/>
              )}
            />
            <Controller
              control={control}
              name="location"
              rules={rules.location}
              render={({
                field, fieldState, formState
              }) => (
                <FormLocationPicker
                  label="Location"
                  placeHolder="Northeastern University"
                  onChange={field.onChange}
                  error={fieldState.error}
                  value={field.value}
                  style={styles.section}/>
              )}
            />
            <Controller
              control={control}
              name="playerLimit"
              rules={rules.playerLimit}
              render={({
                field, fieldState, formState
              }) => (
                <FormInput
                  label="Player Limit"
                  placeHolder="8"
                  onChange={field.onChange}
                  error={fieldState.error}
                  value={field.value}
                  style={styles.section}/>
              )}
            />
            <Controller
              control={control}
              name="description"
              rules={rules.description}
              render={({
                field, fieldState, formState
              }) => (
                <FormInput
                  label="Description"
                  placeHolder="Tell us about your game"
                  onChange={field.onChange}
                  error={fieldState.error}
                  textHeight={200}
                  multiline={true}
                  value={field.value}
                  style={styles.section}/>
              )}
            />
            <Controller
              control={control}
              name="poster"
              rules={rules.poster}
              render={({
                field, fieldState, formState
              }) => (
                <FormImagePicker 
                  label="Poster"
                  onChange={field.onChange}
                  error={fieldState.error}
                  value={field.value}
                  style={styles.section}
                />
              )}
            />
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItem: 'center', marginTop: wp('10%'), marginBottom: wp('20%')}}>
              <PressableOpacity style={styles.button} onPress={() => {navigation.goBack()}} >
                <Text style={styles.buttonText}>Cancel</Text>
              </PressableOpacity>
              <PressableOpacity style={styles.button} onPress={handleSubmit((data) => {submitForm(data)})} >
                <Text style={styles.buttonText}>Submit</Text>
              </PressableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('10%'),
    paddingTop: wp('10%'),
  },
  section: {
    marginVertical: 15,
  },
  buttonText: {
    fontSize: wp('5%'),
    color: Color.detailCard5,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp('5%'),
    backgroundColor: Color.mainColorAtFormDate,
    minWidth: 130,
    margin: 5,
    height:wp('8%')
  },
});