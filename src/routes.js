import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/Home";

const AppNavigator = createStackNavigator();

function AppNavigatorStack() {
  return (
    <NavigationContainer>
      <AppNavigator.Navigator headerMode="none" initialRouteName={"Home"}>
        <AppNavigator.Screen name="Home" component={HomeScreen} />
      </AppNavigator.Navigator>
    </NavigationContainer>
  );
}
export default React.memo(AppNavigatorStack);
