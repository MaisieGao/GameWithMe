import { Pressable } from "react-native";
import React from "react";

export default function PressableOpacity(props) {
  return (
    <Pressable
      onPress={props.onPress}
      style={({pressed}) => [
        {opacity: pressed? 0.5: 1.0},
        props.style
      ]
    }>
      {props.children}
    </Pressable>
  );
}