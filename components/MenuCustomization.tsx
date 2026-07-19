import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native"
import cn from "clsx"

import { images, toppings, sides } from "../constants"

// Daftar topping & side option MEMANG dibatasi cuma yang ini saja (sesuai desain),
// diambil langsung dari constants/index.ts (toppings & sides) yang sudah pasti
// punya gambar asli, jadi tidak ada lagi item yang jatuh ke fallback huruf.
export type SelectableOption = {
  id: string
  name: string
  price: number
  image: any
  type: "topping" | "bagian"
}

const slugify = (name: string) => name.toLowerCase().trim().replace(/\s+/g, "-")

export const TOPPING_OPTIONS: SelectableOption[] = toppings.map((t) => ({
  id: `topping-${slugify(t.name)}`,
  name: t.name,
  price: t.price,
  image: t.image,
  type: "topping",
}))

export const SIDE_OPTIONS: SelectableOption[] = sides.map((s) => ({
  id: `side-${slugify(s.name)}`,
  name: s.name,
  price: s.price,
  image: s.image,
  type: "bagian",
}))

export const toggleSelection = (
  option: SelectableOption,
  list: SelectableOption[],
  setList: (v: SelectableOption[]) => void
) => {
  const exists = list.find((c) => c.id === option.id)
  if (exists) {
    setList(list.filter((c) => c.id !== option.id))
  } else {
    setList([...list, option])
  }
}

type CustomizationGridProps = {
  label: string
  options: SelectableOption[]
  selected: SelectableOption[]
  onToggle: (option: SelectableOption) => void
}

// Grid horizontal untuk topping / side options. Dipakai dua kali di halaman
// detail menu (Toppings & Side options) dengan data + state yang berbeda.
const CustomizationGrid = ({ label, options, selected, onToggle }: CustomizationGridProps) => {
  if (options.length === 0) return null

  return (
    <View className="mt-7">
      <Text className="h3-bold text-dark-100 mb-3">{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-4 pr-5 pt-3"
      >
        {options.map((option) => {
          const isSelected = !!selected.find((c) => c.id === option.id)

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => onToggle(option)}
              className="items-center w-20"
            >
              <View
                className={cn(
                  "size-20 rounded-2xl border-2 items-center justify-center bg-white",
                  isSelected ? "border-primary bg-primary/10" : "border-gray-200"
                )}
              >
                <Image source={option.image} className="size-12" resizeMode="contain" />

                <View
                  className={cn(
                    "absolute -top-2 -right-2 size-6 rounded-full items-center justify-center border-2 border-white",
                    isSelected ? "bg-primary" : "bg-gray-300"
                  )}
                >
                  <Image
                    source={isSelected ? images.check : images.plus}
                    className="size-3"
                    resizeMode="contain"
                    tintColor="#ffffff"
                  />
                </View>
              </View>

              <Text className="body-medium text-dark-100 text-center mt-2" numberOfLines={2}>
                {option.name}
              </Text>
              <Text className="small-bold text-primary mt-0.5">
                +${option.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

export default CustomizationGrid