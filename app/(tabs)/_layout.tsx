import { Redirect, Tabs} from "expo-router";
import useAuthStore from "../../store/auth.store";
import { useCartStore } from "../../store/cart.store";
import { View, Text, Image} from "react-native";
import cn from "clsx"
import { TabBarIconProps } from "../../type";
import { images } from "../../constants";

type TabBarIconWithBadgeProps = TabBarIconProps & { badge?: number }

const TabBarIcon = ({ focused, icon, title, badge}: TabBarIconWithBadgeProps) => (
   <View className="tab-icon">
      <View className="relative">
         <Image source={icon} className="size-7" resizeMode="contain" tintColor={focused ? '#FE8C00' : '#5D5F6D'}/>

         {!!badge && badge > 0 && (
            <View className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-primary items-center justify-center">
               <Text className="text-white text-[10px] font-bold">
                  {badge > 9 ? "9+" : badge}
               </Text>
            </View>
         )}
      </View>
      <Text className={cn("text-sm font-bold", focused ? "text-primary":"text-gray-20")}>
         {title}
      </Text>
   </View>
)

// CARA MSUK KE HOME SCREEN    const isAuthenticated = true
export default function TabLayout() {
   const { isAuthenticated} = useAuthStore()
   const totalCartItems = useCartStore((state) => state.getTotalItems())

   if(!isAuthenticated) return <Redirect href="/sign-in"/>

   return(
      <Tabs screenOptions={{
         headerShown: false,
         tabBarShowLabel: false,
         tabBarStyle: {
                     borderTopLeftRadius: 40,
                     borderTopRightRadius: 40,
                     borderBottomLeftRadius: 40,
                     borderBottomRightRadius: 40,
                     marginHorizontal: 20,
                     height: 70,
                     position: 'absolute',
                     bottom: 40,
                     backgroundColor: 'white',
                     shadowColor: '#1a1a1a',
                     shadowOffset: { width: 5, height: 5},
                     shadowOpacity: 0.1,
                     shadowRadius: 4,
                     elevation: 5
         }
      }}>
         <Tabs.Screen
         name="index"
         options={{
            title: "Home",
            tabBarIcon: ({ focused }) => <TabBarIcon title="Home" icon={images.home} focused={focused}/>
         }}
         />
         <Tabs.Screen
         name="search"
         options={{
            title: "search",
            tabBarIcon: ({ focused }) => <TabBarIcon title="search" icon={images.search} focused={focused}/>
         }}
         />
         <Tabs.Screen
         name="cart"
         options={{
            title: "Cart",
            tabBarIcon: ({focused}) => <TabBarIcon title="Cart" icon={images.bag} focused={focused} badge={totalCartItems}/>
         }}
         />
         <Tabs.Screen
         name="profile"
         options={{
            title: "profile",
            tabBarIcon: ({focused}) => <TabBarIcon title="Profile" icon={images.person} focused={focused}/>
         }}
         />
      </Tabs>
   )
}