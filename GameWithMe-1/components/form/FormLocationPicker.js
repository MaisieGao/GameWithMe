import React, { useState, useEffect, useRef } from 'react'
import { Keyboard, Dimensions, SafeAreaView, Modal, Pressable, View, Text, TextInput, StyleSheet } from 'react-native'
import { googleMapsKey } from "@env"
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import MapView, { Marker } from 'react-native-maps';
import PressableOpacity from '../PressableOpacity';
import Color from '../../Color';

const FormLocationPicker = (props) => {

  const [focus, setFocus] = useState(false);
  const [autoCompleteList, setAutoCompleteList] = useState([]);
  // if current input and last input are different, it means user is typing, then show auto complete
  const [lastInput, setLastInput] = useState(props.initialLocation? props.initialLocation.name : '');
  // user location input which is a string
  const [locationInput, setLocationInput] = useState(props.initialLocation? props.initialLocation.name : '');
  // geoLocation on the map pin
  const [geoLocation, setGeoLocation] = useState({
    latitude: props.initialLocation? props.initialLocation.lat : 49.2806799, // default map center northeastern university
    longitude: props.initialLocation? props.initialLocation.lng : -123.1182539,
    latitudeDelta: 0.02, 
    longitudeDelta: 0.03
  })

  // modal stuff
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef(null)

  // console.log(geoLocation)

  // set place suggestion when typing
  useEffect(() => {
    // console.log(autoCompleteList, autoCompleteList.length > 0);
    // console.log('current location input', locationInput)
    const getAutoComplete = async () => {
      // using heroku cors proxy for google maps web api
      const url = `https://secret-chamber-05944.herokuapp.com/https://maps.googleapis.com/maps/api/place/autocomplete/json?types=geocode|establishment&components=country:ca&input=${locationInput}&types=geocode&key=${googleMapsKey}`;
      // const url = `https://secret-chamber-05944.herokuapp.com/https://maps.googleapis.com/maps/api/place/autocomplete/json?type=address&components=country:ca&input=${locationInput}&types=geocode&key=${googleMapsKey}`;
      // const url = `https://secret-chamber-05944.herokuapp.com/https://maps.googleapis.com/maps/api/place/autocomplete/json?type=address&components=country:ca&input=${locationInput}&types=geocode&key=${googleMapsKey}`;
    //   const url = `https://secret-chamber-05944.herokuapp.com/https://maps.googleapis.com/maps/api/place/autocomplete/json?type=city&input=${locationInput}&types=geocode&key=${googleMapsKey}`;
      await fetch(url, {
        headers: {
          "X-Requested-With": "maps.googleapis.com"
        },
        "mode": "cors",
        "method": "GET",
      })
      .then(data => data.json())
      // .then(result => {console.log(result)})
      .then(result => {setAutoCompleteList(result.predictions)})
      .catch(err => console.error("Error getting place autocomplete", err))
    }

    // when user typed, reset last input, which will be set when tapped out (onblur)
    // when user tap out, close the place suggestion list
    if (locationInput !== lastInput && focus) {
      setLastInput('');
      getAutoComplete();
    } else {
      setAutoCompleteList([]);
    }
  }, [locationInput, lastInput])


  // animate map to certain geolocation
  useEffect(() => {
    if(mapRef && mapRef.current) {
      console.log('animate to', geoLocation);
      // animation doesn't seem to work on Android, why?
      // mapRef.current.animateToRegion(geoLocation, 1000);
      // mapRef.current.animateCamera({center: geoLocation}, 500);
    } else {
      console.log('no mapref');
    }
  }, [geoLocation])

  // update data when location name or geolocation changed
  useEffect(() => {
    if(props.onChange) {
      if (locationInput === '') {
        props.onChange(''); // give empty string with empty input for required error
      } else {
        props.onChange({
          name: locationInput,
          lat: geoLocation.latitude,
          lng: geoLocation.longitude,
          geoHash: "" // empty for now
        })
      }
    }
  }, [locationInput, geoLocation])

  // update geo location(lat, lng) from a location literal using google maps api
  const updateGeoLocation = async (location) => {
    console.log('update geo location with', location);
    const url = `https://secret-chamber-05944.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json?address=${location.replace(/ /g, '+')}&key=${googleMapsKey}`
    await fetch(url, {
      headers: {
        "X-Requested-With": "maps.googleapis.com"
      },
      "mode": "cors",
      "method": "GET",
    })
    .then(data => data.json())
    .then(result => {
      // input have no geolocation result
      if (result.results.length === 0) {
        console.log('cannot get geolocation from user input');
        setGeoLocation({
          latitude: 0,
          longitude: 0,
          latitudeDelta: 0.02,
          longitudeDelta: 0.03
        })
        return ;
      }
      console.log(result.results[0].geometry.location);
      setGeoLocation({
        latitude: result.results[0].geometry.location.lat,
        longitude: result.results[0].geometry.location.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.03
      })
    })
    .catch(err => {
      console.error(err);
    })
  }

  // update location string from a geo location using google maps api
  const updateLocationInput = async (geo) => {
    console.log('update location literal with', geo);
    const url = `https://secret-chamber-05944.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json?latlng=${geo.latitude},${geo.longitude}&key=${googleMapsKey}`
    await fetch(url, {
      headers: {
        "X-Requested-With": "maps.googleapis.com"
      },
      "mode": "cors",
      "method": "GET",
    })
    .then(data => data.json())
    .then(result => {
      if (result.results.length === 0) {
        console.log('cannot get location literal from pin');
        setLocationInput('');
        return ;
      }
      console.log('address', result.results[0].formatted_address);
      setLocationInput(result.results[0].formatted_address);
    })
    .catch(err => {
      console.error('error converting geolocation', err);
    })
  }

  return (
   <View style={[styles.container, props.style]}>
      <View><Text style={styles.label}>{props.label}</Text></View>
      <Pressable onPress={()=>{setModalVisible(true)}}>
        <Text style={[
          styles.textField,
          locationInput !== ''? styles.textFieldLocationSelected : styles.textFieldPlaceHolder,
          props.error? styles.textFieldError : {}
        ]}>
          {locationInput !== ''? locationInput: props.placeHolder}
        </Text>
      </Pressable>
      {
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => { setModalVisible(false); }}
        >
          <SafeAreaView style={[styles.container, props.style]}>
            <TextInput
              style={[
                styles.textField,
                {borderRadius: 0},
                focus? styles.textFieldFocused : {},
              ]}
              autoFocus={true}
              onFocus={() => {setFocus(true);}}
              value={locationInput}
              multiline={props.multiline? true : false}
              defaultValue={props.defaultValue? props.defaultValue: ''}
              onBlur={() => {setFocus(false); setLastInput(locationInput); setAutoCompleteList({})}}
              onChangeText={(input) => {setLocationInput(input);}}
              placeholder={props.placeHolder}
              placeholderTextColor={Color.colorFormDate5}
            />
            <View style={{backgroundColor: Color.backgroundColorAtFormDate}}>
            {
              autoCompleteList.length > 0?
              autoCompleteList.map((item, index) => (
                <PressableOpacity
                  key={index}
                  onPress={async () => {
                    console.log('selected', item.description);
                    setLocationInput(item.description);
                    setLastInput(item.description);
                    updateGeoLocation(item.description);
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={styles.placeSuggestionText}>
                    {item.description}
                  </Text>
                </PressableOpacity>
              ))
              :<></>
            }
            </View>
            <View>
              <MapView
                style={styles.map}
                ref = {mapRef}
                initialRegion={geoLocation}
                region={geoLocation}
                onPanDrag={() => {
                  Keyboard.dismiss();
                }}
                onPress={(event) => {
                  setGeoLocation({
                    latitude: event.nativeEvent.coordinate.latitude,
                    longitude: event.nativeEvent.coordinate.longitude,
                  })
                  Keyboard.dismiss();
                  console.log('map onPress');
                  updateLocationInput({
                    latitude: event.nativeEvent.coordinate.latitude,
                    longitude: event.nativeEvent.coordinate.longitude,
                  })
                }}
              >
                <Marker
                  coordinate={geoLocation}
                >
                </Marker>
              </MapView>
            </View>
          </SafeAreaView>
          <PressableOpacity
            style={{
              position: 'absolute',
              alignSelf: 'center',
              bottom: wp('10%'),
              height: wp('10%'),
              width: wp('80%'),

              backgroundColor: Color.mainColorAtFormDate,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 3,
            }}
            onPress={()=>{
              setModalVisible(false)
              updateGeoLocation(locationInput);
            }}
          >
            <Text style={{fontSize: 20}}>
              Done
            </Text>
          </PressableOpacity>
        </Modal>
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
  textFieldFocused: {
    borderWidth: 1,
    borderColor: Color.colorFormLoc1
  },
  textFieldError: {
    borderWidth: Color.colorFormDate6,
  },
  textFieldPlaceHolder: {
    color: Color.colorFormDate5,
  },
  placeSuggestionText: {
    color: Color.colorFormDate4,
    fontSize: 18,
    padding: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    height: Dimensions.get("screen").height,
  },
  error: {
    height: 20,
    fontSize: 14,
    color: Color.colorFormDate6,
  },
});

export default FormLocationPicker;