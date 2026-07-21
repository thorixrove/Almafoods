import { useRef } from "react"
import { Modal, View, Text, Pressable, Animated, PanResponder, Image } from "react-native"
import { images } from "../constants"

type LoginSuccessModalProps = {
  visible: boolean
  onContinue: () => void
  onCancel: () => void
}

const DISMISS_THRESHOLD = 100

const LoginSuccessModal = ({ visible, onContinue, onCancel }: LoginSuccessModalProps) => {
  const translateY = useRef(new Animated.Value(0)).current

  const resetPosition = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
    }).start()
  }

  const handleClose = () => {
    // reset dulu biar posisi bersih saat modal dibuka lagi lain kali
    translateY.setValue(0)
    onCancel()
  }

  const panResponder = useRef(
    PanResponder.create({
      // hanya aktif kalau geraknya jelas ke bawah, biar tidak konflik dgn tap biasa
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 6,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy)
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > DISMISS_THRESHOLD) {
          handleClose()
        } else {
          resetPosition()
        }
      },
    })
  ).current

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        {/* backdrop, tap di luar sheet = batal */}
        <Pressable className="absolute inset-0 bg-black/50" onPress={handleClose} />

        <Animated.View
          style={{ transform: [{ translateY }] }}
          className="bg-white rounded-t-[32px] items-center"
        >
          {/* area drag: cuma handle bar ini yang responsif ke gesture geser */}
          <View {...panResponder.panHandlers} className="w-full items-center pt-3 pb-2">
            <View className="w-12 h-1.5 rounded-full bg-gray-200" />
          </View>

          <View className="px-5 pb-12 items-center w-full">
            <Image
              source={images.success}
              className="size-28 mb-6"
              resizeMode="contain"
            />

            <Text className="h3-bold text-dark-100 text-center">
              Login berhasil
            </Text>
            <Text className="body-regular text-gray-100 text-center mt-1">
              Kamu sudah siap lanjut ke halaman utama.
            </Text>

            <Pressable
              onPress={onContinue}
              className="bg-primary w-full rounded-full py-5 items-center mt-10"
            >
              <Text className="text-white base-bold">Go to Homepage</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

export default LoginSuccessModal