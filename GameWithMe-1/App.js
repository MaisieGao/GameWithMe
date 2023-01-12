import React from "react";
import { SafeAreaView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import * as eva from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";
import GetAuth from "./components/GetAuth";

export default function App() {
  // disable hard-coded console.error
  // console._errorOriginal = console.error.bind(console);
  // console.error = (err) => {console.warn(err)};

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        <NavigationContainer>
          <GetAuth />
        </NavigationContainer>
      </SafeAreaView>
    </ApplicationProvider>
  );
}
