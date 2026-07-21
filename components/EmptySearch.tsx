import { View, Text, Image } from "react-native"
import { images } from "../constants"

// Titik-titik dekoratif kecil di sekitar lingkaran, meniru desain di gambar referensi
const Dot = ({ className }: { className: string }) => (
  <View className={`absolute size-2.5 rounded-full bg-primary ${className}`} />
)

const EmptySearch = () => {
  return (
    <View className="flex-1 items-center justify-center px-10 pt-20">
      {/* Ilustrasi lingkaran gradient-like pakai layer opacity, tanpa perlu library tambahan */}
      <View className="relative items-center justify-center size-32 mb-6">
        <View className="absolute size-32 rounded-full bg-primary/10" />
        <View className="absolute size-24 rounded-full bg-primary/20" />
        <View className="absolute size-16 rounded-full bg-primary items-center justify-center">
          <Image
            source={images.search}
            className="size-7"
            resizeMode="contain"
            tintColor="#FFFFFF"
          />
        </View>

        <Dot className="-top-1 right-2 bg-primary/70" />
        <Dot className="top-6 -right-3 size-2" />
        <Dot className="bottom-2 -left-4 size-2" />
      </View>

      <Text className="base-bold text-dark-100 text-center">
        Menu tidak ditemukan
      </Text>
      <Text className="body-regular text-gray-100 text-center mt-1">
        Coba gunakan kata lain atau periksa kesalahan ketik.
      </Text>
    </View>
  )
}

export default EmptySearch