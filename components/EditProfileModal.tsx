import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native'
import React, { useState } from 'react'

type EditProfileModalProps = {
  visible: boolean
  onClose: () => void
  isSaving: boolean
  name: string
  setName: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  addressHome: string
  setAddressHome: (v: string) => void
  addressWork: string
  setAddressWork: (v: string) => void
  onSave: () => void
}

const FIELDS = [
  { label: 'Full Name', placeholder: 'Nama lengkap', keyboardType: undefined as const },
  { label: 'Phone number', placeholder: '+62 812 3456 7890', keyboardType: 'phone-pad' as const },
  { label: 'Address 1 - (Home)', placeholder: 'Alamat rumah', keyboardType: undefined as const },
  { label: 'Address 2 - (Work)', placeholder: 'Alamat kantor', keyboardType: undefined as const },
]

const EditProfileModal = ({
  visible,
  onClose,
  isSaving,
  name,
  setName,
  phone,
  setPhone,
  addressHome,
  setAddressHome,
  addressWork,
  setAddressWork,
  onSave,
}: EditProfileModalProps) => {
  const [activeButton, setActiveButton] = useState<'save' | 'cancel' | null>(null)

  const values = [name, phone, addressHome, addressWork]
  const setters = [setName, setPhone, setAddressHome, setAddressWork]

  const buttons = [
    {
      key: 'save' as const,
      label: isSaving ? 'Menyimpan...' : 'Simpan',
      onPress: () => {
        setActiveButton('save')
        onSave()
      },
      extra: '',
    },
    {
      key: 'cancel' as const,
      label: 'Batal',
      onPress: () => {
        setActiveButton('cancel')
        onClose()
      },
      extra: 'mt-3',
    },
  ]

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl px-5 pt-6 pb-10 max-h-[80%]">
            <Text className="h3-bold text-dark-100 mb-4">Edit Profile</Text>

            <ScrollView 
              keyboardShouldPersistTaps="handled" 
              showsVerticalScrollIndicator={false}
            >
              {FIELDS.map((field, i) => (
                <View key={field.label}>
                  <Text className="small-bold text-gray-100 mb-1">{field.label}</Text>
                  <TextInput
                    value={values[i]}
                    onChangeText={setters[i]}
                    placeholder={field.placeholder}
                    keyboardType={field.keyboardType}
                    className={`border border-gray-200 rounded-xl px-4 py-3 ${i === FIELDS.length - 1 ? 'mb-6' : 'mb-4'} base-regular text-dark-100`}
                  />
                </View>
              ))}

              {buttons.map(({ key, label, onPress, extra }) => (
                <Pressable
                  key={key}
                  onPress={onPress}
                  className={`${extra} items-center rounded-xl px-4 py-3 ${activeButton === key ? 'bg-primary' : 'bg-transparent'}`}
                >
                  <Text className={`base-medium ${activeButton === key ? 'text-white' : 'text-black'}`}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export default EditProfileModal
