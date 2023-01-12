import { React, useState, useEffect } from 'react'
import { Alert, ImageBackground, Text, View, StyleSheet, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'

import FormInput from '../components/form/FormInput';
import FormDatePicker from '../components/form/FormDatePicker';
import FormImagePicker from '../components/form/FormImagePicker';
import FormLocationPicker from '../components/form/FormLocationPicker';
import PressableOpacity from '../components/PressableOpacity';

import { doc } from 'firebase/firestore';
import { deleteGame, updateGame } from '../firebase/apis/games';
import { deleteImage, getImageUri, uploadImageByUri } from '../firebase/apis/images';
import { firestore, auth } from '../firebase/firebase-setup';
import Color from '../Color';

export default function EditGame({route}) {

  const game = route.params;
  const originalImageUri = game.poster;
  const navigation = useNavigation();

  const { register, setValue, handleSubmit, control, getValues, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: game.title,
      date: game.date,
      playerLimit: game.playerLimit,
      location: game.location,
      description: game.description,
      poster: game.poster,
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

    // alert wrapper for easier calling
  const confirmationAlert = (title, message, onConfirm, onCancel=()=>{}) => {
    Alert.alert(title, message,
      [
        { text: "Cancel", onPress: onCancel },
        { text: "OK", onPress: onConfirm}
      ]
    )
  };

  const submitForm = async (data) => {
    console.log("Updating game", data)
    try {
      // only update image if image has changed
      if (originalImageUri != data.poster) {
        const imagePath = await uploadImageByUri(data.poster);
        data.poster = imagePath; // replace the local path to storage path on firebase
        // delete old image
        await deleteImage(game.poster);
      }
    } catch (err) {
      console.error('error uploading image', err);
      return ;
    }

    // check if location is valid(have geolocation)
    if(data.location.lat=== 0 && data.location.lng === 0) {
      setError("location", { type: 'custom', message: 'cannot find this location'})
      return;
    }

    // upload the data to firestore
    try {
      console.log('uploading', data)
      await updateGame(game.key, data);
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
    <ImageBackground source={require("../assets/back1.png")} style={{width: '100%', height: '100%'}}>
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
                  defaultValue={getValues("title")}
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
                  initialDate={getValues("date")}
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
                  initialLocation={getValues("location")}
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
                  defaultValue={getValues("playerLimit")}
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
                  defaultValue={getValues("description")}
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
                  // defaultValue={getValues("poster")}
                  initialUri={getValues("poster")}
                  value={field.value}
                  style={styles.section}
                />
              )}
            />
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItem: 'center', marginTop: wp('10%'), marginBottom: wp('5%')}}>
              <PressableOpacity style={styles.button} onPress={() => {navigation.goBack()}} >
                <Text style={styles.buttonText}>Cancel</Text>
              </PressableOpacity>
              <PressableOpacity style={styles.button} onPress={handleSubmit((data) => {submitForm(data)})} >
                <Text style={styles.buttonText}>Submit</Text>
              </PressableOpacity>
            </View>
            <View style={{marginBottom: wp('10%')}}>
              <PressableOpacity style={[styles.button, {backgroundColor: Color.detailCard2}]} onPress={handleSubmit((data) => {
                confirmationAlert("Warning", "Are you sure you want to delete this game?", () => {
                  deleteGame(game.key);
                  // delete old image
                  deleteImage(game.poster);
                  Alert.alert("success");
                  navigation.navigate("HomePage")
                });
              })}>
                <Text style={[styles.buttonText, {color: Color.colorFormDate4}]}>Delete</Text>
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
    fontSize: 18,
    color: Color.detailCard5
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: Color.mainColorAtFormDate,
    borderRadius: 5,
    minWidth: 130,
    margin: 5,
  },
});