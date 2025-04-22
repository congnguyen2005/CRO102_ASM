import { FontAwesome } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import CartScreen from "../screens/CartScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/Loginscreen";
import NotificationScreen from "../screens/NotificationScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import ProfileScreen from "../profile/ProfileScreen";
import RegisterScreen from "../screens/RegisterScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import HistoryScreen from "../profile/HistoryScreen";
import EditProfileScreen from "../profile/EditProfileScreen";
import FavoriteScreen from "../screens/FavoriteScreen";
import PaymentScreen from "../screens/PaymentScreen";
import PlantGuideScreen from "../profile/PlantGuideScreen";
import QAScreen from "../profile/QAScreen";
import TermsConditionsScreen from "../profile/TermsConditionsScreen";
import PrivacyPolicyScreen from "../profile/PrivacyPolicyScreen";
import GeminiAPI from "../profile/GeminiAPI";
import FogotPassWord from "../screens/FogotPassWord";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigator cho Home
const HomeStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="History" component={HistoryScreen} />
  </Stack.Navigator>
);

// Stack Navigator cho Categories
const CategoriesStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CategoriesMain" component={CategoriesScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);


const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: "Hồ sơ" }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Chỉnh sửa thông tin" }} />
    <Stack.Screen name="PlantGuide" component={PlantGuideScreen} options={{ title: "Cẩm nang trồng cây" }} />
    <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{ title: "Lịch sử giao dịch" }} />
    <Stack.Screen name="QA" component={QAScreen} options={{ title: "Q & A" }} />
    <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} options={{ title: "Điều khoản & Điều kiện" }} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: "Chính sách quyền riêng tư" }} />
    <Stack.Screen name="GeminiAI" component={GeminiAPI} options={{ title: "Trò chuyện với AI" }} />

  </Stack.Navigator>
);
// Bottom Tab Navigation
const BottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === "Home") iconName = "home";
        else if (route.name === "Categories") iconName = "th-list";
        else if (route.name === "Notifications") iconName = "bell";
        else if (route.name === "Profile") iconName = "user";
        else if (route.name === "Favorites") iconName = "heart";
        return <FontAwesome name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "green",
      tabBarInactiveTintColor: "gray",
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeStackNavigator} />
  
    <Tab.Screen 
      name="Favorites" 
      component={FavoriteScreen}
      options={{
        title: 'Yêu thích'
      }}
    />
    <Tab.Screen name="Notifications" component={NotificationScreen} />
    <Tab.Screen name="Profile" component={ProfileStack} />
  </Tab.Navigator>
);

// App Navigation
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={FogotPassWord} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;