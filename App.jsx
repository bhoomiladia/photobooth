import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import { NavigationContainer } from '@react-navigation/native';
import { useState } from 'react';
const tabs = createBottomTabNavigator();

export default	function TabNavigator(){
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return(
    <NavigationContainer>
    <tabs.Navigator>
      <tabs.Screen name=" " component={HomeScreen} />
      {/* <tabs.Screen name="Settings" component={SettingsScreen} /> */}
    </tabs.Navigator>
    </NavigationContainer>
  )
}