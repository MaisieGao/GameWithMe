import { React, useState, useEffect } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import Color from '../../Color';

// one input section in the form, includes a label and a textfield
const FormInput = (props) => {

  const [focus, setFocus] = useState(false);

  // console.log(props.label, props)

  return (
    <View style={[styles.container, props.style]}>
      <View><Text style={styles.label}>{props.label}</Text></View>
      <TextInput
        style={[
          styles.textField, 
          props.textWidth? {width: props.textWidth} : {},
          props.textHeight? {height: props.textHeight} : {},
          focus? styles.textFieldFocused : {},
          props.error? styles.textFieldError : {},
          props.multiline? {paddingTop: 10} : {}]
        }
        onFocus={() => {setFocus(true)}}
        multiline={props.multiline? true : false}
        defaultValue={props.defaultValue? props.defaultValue: ''}
        onBlur={() => {setFocus(false)}}
        onChangeText={props.onChange}
        placeholder={props.placeHolder}
        placeholderTextColor={Color.colorFormDate5}
      />
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
    marginBottom: 7,
    // fontFamily: 'Lato',
    fontSize: 16,
    fontWeight:'bold'
  },
  textField: {
    backgroundColor: Color.backgroundColorAtFormDate,
    borderWidth: 1,
    borderColor: Color.colorFormDate3,
    color: Color.colorFormDate4,
    height: 45,
    padding: 10,
    borderRadius: 5,
    // fontFamily: 'Lato',
    fontSize: 18,
  },
  textFieldFocused: {
    borderWidth: 1,
    borderColor: Color.colorFormInput1,
  },
  textFieldError: {
    borderWidth: 1,
    borderColor: Color.colorFormDate6,
  },
  error: {
    height: 20,
    fontSize: 14,
    color: Color.colorFormDate6,
  },
});


export default FormInput;