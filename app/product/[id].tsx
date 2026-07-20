import { useState } from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"

import CustomHeader from "../../components/CustomHeader"
import CustomButton from "../../components/CustomButton"
import CustomizationGrid, {
  SelectableOption,
  TOPPING_OPTIONS,
  SIDE_OPTIONS,
  toggleSelection,
} from "../../components/MenuCustomization"
import { images } from "../../constants"
import { getMenuById } from "../../lib/appwrite"
import useAppwrite from "../../lib/useAppwrite"
import { useCartStore } from "../../store/cart.store"
import { CartCustomization, MenuItem } from "../../type"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const MenuDetails = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { addItem } = useCartStore()

  // Ambil detail menu berdasarkan id yang dikirim dari MenuCard
  const { data: menuItem, loading: loadingMenu } = useAppwrite({
    fn: getMenuById,
    params: { id },
  })

  const [selectedToppings, setSelectedToppings] = useState<SelectableOption[]>([])
  const [selectedSides, setSelectedSides] = useState<SelectableOption[]>([])
  const [quantity, setQuantity] = useState(1)

  if (loadingMenu || !menuItem) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FE8C00" />
      </SafeAreaView>
    )
  }

  const item = menuItem as MenuItem

  const extraPrice = [...selectedToppings, ...selectedSides].reduce(
    (sum, c) => sum + c.price,
    0
  )
  const unitPrice = item.price + extraPrice
  const totalPrice = unitPrice * quantity

  const handleAddToCart = () => {
    const customizations: CartCustomization[] = [
      ...selectedToppings,
      ...selectedSides,
    ].map((c) => ({ id: c.id, name: c.name, price: c.price, type: c.type }))

    // addItem otomatis menaikkan quantity kalau item + kombinasi customization
    // yang sama sudah ada di cart (lihat logic areCustomizationsEqual di cart.store.ts)
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: item.$id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        customizations,
      })
    }

    router.push("/(tabs)/cart")
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-40"
        showsVerticalScrollIndicator={false}
      >
        {/* tombol back + search icon */}
        <CustomHeader />
        
         {/* Gambar produk */}
        <View className="items-center">
          <Image
            source={{ uri: item.image_url }}
            className="w-56 h-56"
            resizeMode="contain"
          />
        </View>

         {/* Nama, tipe, rating, harga */}
        <Text className="h1-bold text-dark-100 mt-3">{item.name}</Text>
        {item.type ? (
          <Text className="body-regular text-gray-200 mt-1">{item.type}</Text>
        ) : null}
        <View className="flex-row items-center gap-1 mt-2">
          <Image source={images.star} className="size-5" resizeMode="contain" />
          <Text className="paragraph-bold text-dark-100">
            {item.rating?.toFixed(1)}/5
          </Text>
        </View>
        <Text className="h1-bold text-primary mt-2">${item.price.toFixed(2)}</Text>

        {/* Kalori & Protein */}
        <View className="flex-row justify-between mt-5 border-b border-white pb-1">
          <View className="items-center">
            <Text className="small-bold text-gray-200">Calories</Text>
            <Text className="paragraph-bold text-dark-100 mt-1">
              {item.calories} Cal
            </Text>
          </View>
          <View className="items-center">
            <Text className="small-bold text-gray-200">Protein</Text>
            <Text className="paragraph-bold text-dark-100 mt-1">
              {item.protein}g
            </Text>
          </View>
        </View>

        {/* Banner Free Delivery */}
        <View className="flex-row items-center justify-between bg-primary/10 rounded-2xl px-5 py-4 mt-5">
            <View className="flex-row items-center gap-1">
            <Image
              source={images.dollar}
              className="size-6"
              resizeMode="contain"
              tintColor="#FE8C00"
            />
            <Text className="body-medium text-primary">Free Delivery</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Image
              source={images.clock}
              className="size-4"
              resizeMode="contain"
              tintColor="#FE8C00"
            />
            <Text className="body-medium text-primary">20 - 30 mins</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Image
              source={images.star}
              className="size-4"
              resizeMode="contain"
              tintColor="#FE8C00"
            />
            <Text className="body-medium text-primary">
              {item.rating?.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Deskripsi produk */}
        <Text className="paragraph-medium text-gray-200 mt-4 leading-4">
          {item.description}
        </Text>

        {/* Grid Toppings & Side options*/}
        <CustomizationGrid
          label="Toppings"
          options={TOPPING_OPTIONS}
          selected={selectedToppings}
          onToggle={(option) =>
            toggleSelection(option, selectedToppings, setSelectedToppings)
          }
        />
        <CustomizationGrid
          label="Side options"
          options={SIDE_OPTIONS}
          selected={selectedSides}
          onToggle={(option) => toggleSelection(option, selectedSides, setSelectedSides)}
        />
      </ScrollView>

      {/* Bottom bar (quantity selector + tombol Add to Cart)*/}
{/* Bottom bar (quantity selector + tombol Add to Cart)*/}
<View
  className="absolute bottom-0 left-0 right-0 mx-5 mb-12 bg-white rounded-full px-3 py-2 flex-row items-center gap-4"
  style={{
    paddingBottom: insets.bottom > 0 ? insets.bottom / 4 : 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  }}
>
  {/* Quantity Selector */}
        <View className="flex-row items-center gap-4 bg-white rounded-full px-3 py-2">
          <TouchableOpacity
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            className="size-8 rounded-full bg-primary/10 items-center justify-center"
          >
            <Image source={images.minus} className="size-3" resizeMode="contain" />
          </TouchableOpacity>
          <Text className="paragraph-bold text-dark-100">{quantity}</Text>
          <TouchableOpacity
            onPress={() => setQuantity((q) => q + 1)}
            className="size-8 rounded-full bg-primary/10 items-center justify-center"
          >
            <Image source={images.plus} className="size-3" resizeMode="contain" />
          </TouchableOpacity>
        </View>

  {/* Add to Cart Button */}
  <CustomButton
    title={`Add to Cart ($${totalPrice.toFixed(2)})`}
    style="flex-1 bg-[#FE8C00] rounded-full"
    onPress={handleAddToCart}
    leftIcon={
      <Image
        source={images.bag}
        className="size-5 mr-2"
        resizeMode="contain"
        tintColor="#ffffff"
      />
    }
  />
</View>
    </SafeAreaView>
  )
}

export default MenuDetails