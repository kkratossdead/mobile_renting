import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ChoiceScreen from "../screens/ChoiceScreen";
import RenterHomeScreen from "../screens/RenterHomeScreen";
import SellerScreen from "../screens/SellerScreen";
import PropertyDetailScreen from "../screens/PropertyDetailScreen";
import EditPropertyScreen from "../screens/EditPropertyScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Choice" component={ChoiceScreen} />
        <Stack.Screen name="RenterHome" component={RenterHomeScreen} />
        <Stack.Screen name="SellerHome" component={SellerScreen} />
        <Stack.Screen 
          name="PropertyDetail" 
          component={PropertyDetailScreen}
          options={{ 
            headerShown: true, 
            title: "Property Details",
            headerBackTitle: "<-" 
          }}
        />
        <Stack.Screen 
          name="EditProperty" 
          component={EditPropertyScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
