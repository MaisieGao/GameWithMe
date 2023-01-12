import { React, useState, useEffect } from 'react'
import { Pressable, Modal, View, Text, TextInput, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import DatePicker from 'react-native-modern-datepicker'
import Color from '../../Color';

const FormDatePicker = (props) => {

  const [dateSelected, setDateSelected] = useState(props.initialDate? true : false);
  const [showPicker, setShowPicker] = useState(false);
  const [dateValue, setDateValue] = useState( props.initialDate !== undefined? new Date(props.initialDate) : new Date());

  return (
    <View style={[styles.container, props.style]}>
      <View><Text style={styles.label}>{props.label}</Text></View>
        <Pressable onPress={() => {setShowPicker(!showPicker)}}>
          <Text style={[
            styles.textField, 
            dateSelected? {} : styles.textFieldDateSelected,
            props.error? styles.textFieldError : {}
          ]}>
            {dateValue.toISOString().substring(0, 10)}
          </Text>
        </Pressable>
      {
        props.error?
        <Text style={styles.error}>
          {props.error.message}
        </Text>
        :
        <></>
      }
        {
          showPicker? 
          <DatePicker
            options={{
              backgroundColor: Color.backgroundColorAtFormDate,
              textHeaderColor: Color.mainColorAtFormDate,
              textDefaultColor: Color.colorFormDate3,
              selectedTextColor: Color.backgroundColorAtFormDate,
              mainColor: Color.mainColorAtFormDate,
              textSecondaryColor: Color.colorFormDate4,
              borderColor: Color.borderColorAtFormDate,
            }}
            current={dateValue.toISOString().substring(0, 10)}
            selected={dateValue.toISOString().substring(0, 10)}
            mode="calendar"
            onDateChange={(date) => {
              // setDateValue(new Date(Date.parse(date))); 
              const dateObj = new Date(date);
              const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
              const realDate = new Date(dateObj - userTimezoneOffset);
              setDateValue(realDate);

              setShowPicker(false); 
              setDateSelected(true); 
              props.onChange(realDate.toISOString().substring(0, 10))
            }}
            minuteInterval={30}
            {...props}
            style={{ borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}/> : <></>
          }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  textFieldDateSelected: {
    color: Color.colorFormDate5
  },
  error: {
    height: 20,
    fontSize: 14,
    color: Color.colorFormDate6,
  },    
  textFieldError: {
    borderWidth: 1,
    borderColor: Color.colorFormDate6,
  },
});

export default FormDatePicker;