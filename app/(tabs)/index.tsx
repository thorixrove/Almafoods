import cn from "clsx";
import { FlatList, Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fragment } from "react/jsx-runtime";
import CartButton from "../../components/CartButton";
import { images, offers } from "../../constants";
import useAuthStore from "../../store/auth.store";

export default function Index() {
  const { user} = useAuthStore()


  
  // Console log (bisa dihapus)
  try {
    console.log("useAuthStore:", JSON.stringify(user ?? {}, null, 2))
  } catch (e) {
    console.log("useAuthStore:", user)
  }
  


  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList 
      data={offers}
      renderItem={({ item, index }) => {

        const isEven = index % 2 === 0
        return (
          <View>
            <Pressable 
            className={cn("offer-card h-40", isEven ? "flex-row-reverse " : "flex-row")}
            style={{ backgroundColor: item.color}}
            android_ripple={{ color: "#fffff22"}}
            >
              {({pressed}) => (
                <Fragment>
                  <View className={"h-full w-1/2"}>
                  <Image source={item.image} className={"size-full"} resizeMode="contain"/>
                  </View>

                  <View className={cn("offer-card__info", isEven ? "pl-8" : "pr-8")}>
                    <Text className="h1-bold text-white leading-tight">
                      {item.title}
                    </Text>
                    <Image
                    source={images.arrowRight}
                    className="size-9"
                    resizeMode="contain"
                    tintColor="#ffffff"
                    />
                  </View>
                </Fragment>
              )}
            </Pressable>
          </View>
        )
      }}
      contentContainerClassName="pb-28 px-5"
      ListHeaderComponent={() => (
        <View className="flex-between flex-row w-full my-5">
          <View className="flex-start">
            <Text className="small-bold text-primary">DELIVER TO</Text>
            <TouchableOpacity className="flex-center flex-row gap-x-1 mt-0.5">
              <Text className="paragraph-bold text-dark-100">Manokwari</Text>
              <Image source={images.arrowDown} className="size-3" resizeMode="contain"/>
            </TouchableOpacity>
          </View>


          <CartButton/>
        </View>
      )}
      />
    </SafeAreaView>
  );
}


