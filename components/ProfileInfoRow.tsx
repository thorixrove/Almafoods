import { View, Text, Image } from 'react-native'
import React from 'react'

type ProfileInfoRowProps = {
  icon: any
  label: string
  value?: string
}

const ProfileInfoRow = ({ icon, label, value }: ProfileInfoRowProps) => (
  <View className="flex-row items-center gap-x-4 px-5 py-3  border-white">
    <View className="size-12 rounded-full bg-primary/10 items-center justify-center">
      <Image source={icon} className="size-5" resizeMode="contain" />
    </View>
    <View className="flex-1">
      <Text className="small-bold text-gray-100">{label}</Text>
      <Text className="base-medium text-dark-100 mt-0.5">
        {value && value.length > 0 ? value : 'Belum diisi'}
      </Text>
    </View>
  </View>
)

export default ProfileInfoRow