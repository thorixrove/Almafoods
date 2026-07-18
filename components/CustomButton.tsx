import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { CustomButtonProps } from '../type'
import cn from "clsx"

const CustomButton = ({
  onPress,
  title="Click Me",
  style,
  textStyle,
  leftIcon,
  isLoading = false
}: CustomButtonProps) => {
  return (
    <Pressable
      className={cn("custom-btn overflow-hidden", style)}
      onPress={onPress}
      disabled={isLoading}
      android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
    >
      {({ pressed }) => (
        <>
          {pressed && (
            <View pointerEvents="none" className="absolute inset-0 bg-black/20" />
          )}
          {leftIcon}
          <View className='flex-center flex-row'>
            {isLoading ? (
              <ActivityIndicator size="small" color="white"/>
            ): (
              <Text className={cn("text-white-100 paragraph-semibold", textStyle)}>
                {title}
              </Text>
            )}
          </View>
        </>
      )}
    </Pressable>
  )
}
export default CustomButton