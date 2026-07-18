import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { images } from '../../constants'
import useAuthStore from '../../store/auth.store'
import { signOut, updateUser, uploadAvatarImage } from '../../lib/appwrite'
import CustomHeader from '../../components/CustomHeader'
import CustomButton from '../../components/CustomButton'

const ProfileInfoRow = ({
  icon,
  label,
  value,
}: {
  icon: any
  label: string
  value?: string
}) => (
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

const Profile = () => {
  const router = useRouter()
  const { user, setUser, setIsAuthenticated } = useAuthStore()

  const [isEditVisible, setIsEditVisible] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [addressHome, setAddressHome] = useState(user?.address1 ?? '')
  const [addressWork, setAddressWork] = useState(user?.address2 ?? '')

  const openEdit = () => {
    setName(user?.name ?? '')
    setPhone(user?.phone ?? '')
    setAddressHome(user?.address1 ?? '')
    setAddressWork(user?.address2 ?? '')
    setIsEditVisible(true)
  }

  const handleSaveProfile = async () => {
    if (!user) return

    if (!name.trim()) {
      Alert.alert('Error', 'Nama tidak boleh kosong')
      return
    }

    setIsSaving(true)
    try {
      const updated = await updateUser({
        documentId: user.$id,
        name: name.trim(),
        phone: phone.trim(),
        address1: addressHome.trim(),
        address2: addressWork.trim(),
      })

      setUser({
        ...user,
        name: updated.name,
        phone: updated.phone,
        address1: updated.address1,
        address2: updated.address2,
      } as typeof user)
      setIsEditVisible(false)
      Alert.alert('Berhasil', 'Profil berhasil diperbarui')
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Gagal memperbarui profil'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangeAvatar = async () => {
    if (!user) return

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        Alert.alert(
          'Izin diperlukan',
          'Izinkan akses galeri untuk mengganti foto profil'
        )
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })

      if (result.canceled || result.assets.length === 0) return

      const asset = result.assets[0]
      setIsUploadingAvatar(true)

      const fileName = asset.uri.split('/').pop() ?? `avatar-${Date.now()}.jpg`
      const fileType = asset.mimeType ?? 'image/jpeg'

      const updatedUser = await uploadAvatarImage({
        file: {
          name: fileName,
          type: fileType,
          size: asset.fileSize ?? 0,
          uri: asset.uri,
        },
        documentId: user.$id,
      })

      setUser({ ...user, avatar: updatedUser.avatar } as typeof user)
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Gagal mengunggah foto profil'
      )
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true)
          try {
            await signOut()
          } catch (error) {
            console.log('signOut error', error)
          } finally {
            setUser(null)
            setIsAuthenticated(false)
            setIsLoggingOut(false)
            router.replace('/(auth)/sign-in')
          }
        },
      },
    ])
  }

  return (
    <View className="flex-1 bg-white">
      <CustomHeader title="Profile" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28 px-5 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View className="items-center mt-2 mb-6">
          <View className="relative">
            <Image
              source={user?.avatar ? { uri: user.avatar } : images.avatar}
              className="size-28 rounded-full"
              resizeMode="cover"
            />
            {isUploadingAvatar && (
              <View className="absolute inset-0 rounded-full bg-black/40 items-center justify-center">
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            )}
            <TouchableOpacity
              onPress={handleChangeAvatar}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 size-8 rounded-full bg-primary items-center justify-center border-2 border-white"
            >
              <Image
                source={images.pencil}
                className="size-4"
                resizeMode="contain"
                tintColor="#ffffff"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info card */}
        <View className="rounded-2xl bg-white border border-white overflow-hidden">
          <ProfileInfoRow
            icon={images.user}
            label="Full Name"
            value={user?.name}
          />
          <ProfileInfoRow
            icon={images.envelope}
            label="Email"
            value={user?.email}
          />
          <ProfileInfoRow
            icon={images.phone}
            label="Phone number"
            value={user?.phone}
          />
          <ProfileInfoRow
            icon={images.location}
            label="Address 1 - (Home)"
            value={user?.address1}
          />
          <View className="border-b-0">
            <ProfileInfoRow
              icon={images.location}
              label="Address 2 - (Work)"
              value={user?.address2}
            />
          </View>
        </View>

        {/* Actions */}
        <CustomButton
          title="Edit Profile"
          onPress={openEdit}
          style="mt-8 bg-white border border-primary"
          textStyle="!text-primary"
        />

        <CustomButton
          title={isLoggingOut ? 'Logging out...' : 'Logout'}
          onPress={handleLogout}
          isLoading={isLoggingOut}
          style="mt-4 bg-white border border-error"
          textStyle="!text-error"
          leftIcon={
            <Image
              source={images.logout}
              className="size-5 mr-2"
              resizeMode="contain"
              tintColor="#F14141"
            />
          }
        />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl px-5 pt-6 pb-10">
            <Text className="h3-bold text-dark-100 mb-4">Edit Profile</Text>

            <Text className="small-bold text-gray-100 mb-1">Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nama lengkap"
              className="border border-gray-200 rounded-xl px-4 py-3 mb-4 base-regular text-dark-100"
            />

            <Text className="small-bold text-gray-100 mb-1">
              Phone number
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+62 812 3456 7890"
              keyboardType="phone-pad"
              className="border border-gray-200 rounded-xl px-4 py-3 mb-4 base-regular text-dark-100"
            />

            <Text className="small-bold text-gray-100 mb-1">
              Address 1 - (Home)
            </Text>
            <TextInput
              value={addressHome}
              onChangeText={setAddressHome}
              placeholder="Alamat rumah"
              className="border border-gray-200 rounded-xl px-4 py-3 mb-4 base-regular text-dark-100"
            />

            <Text className="small-bold text-gray-100 mb-1">
              Address 2 - (Work)
            </Text>
            <TextInput
              value={addressWork}
              onChangeText={setAddressWork}
              placeholder="Alamat kantor"
              className="border border-gray-200 rounded-xl px-4 py-3 mb-6 base-regular text-dark-100"
            />

            <CustomButton
              title={isSaving ? 'Menyimpan...' : 'Simpan'}
              onPress={handleSaveProfile}
              isLoading={isSaving}
              style="bg-primary"
            />

            <TouchableOpacity
              onPress={() => setIsEditVisible(false)}
              className="mt-3 items-center"
            >
              <Text className="base-medium text-gray-100">Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default Profile