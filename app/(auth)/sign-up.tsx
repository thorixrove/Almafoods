import { View, Text, Button, Alert} from 'react-native'
import { useState } from 'react'
import { Link, router } from 'expo-router'
import CustomInput from '../../components/CustomInput'
import CustomButton from '../../components/CustomButton'
import { createuser } from '../../lib/appwrite'


const SignUp = () => {
  const[isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ name: "",email: "", password: ""})

  const submit = async () => {
    const { name, email, password} = form

    if(!name || !email || !password) return Alert.alert("Error", "Mohon masukan email address & password  yang valid")
      setIsSubmitting(true)

    try {
      await createuser({
        email,
        password,
        name
      })
      
      Alert.alert( "Success", "User signed up successfully")
      router.replace("/")

    } catch (error: any) {
      Alert.alert("Error", error.message)
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <View className='gap-8 bg-white rounded-lg p-5 mt-5'>

      <CustomInput
      placeholder='Masukkan nama'
      value={form.name}
      onChangeText={(text) => setForm((prev) => ({ ...prev, name: text}))}
      label='Full name'
      />

      <CustomInput
      placeholder='Masukkan email'
      value={form.email}
      onChangeText={(text) => setForm((prev) => ({ ...prev, email: text}))}
      label='Email'
      keyboardType='email-address'
      />

      <CustomInput
       placeholder='Masukkan password'
       value={form.password}
       onChangeText={(text) => setForm((prev) => ({ ...prev, password: text}))}
       label='Password'
       secureTextEntry={true}
       />

       <CustomButton
       title='Sign Up'
       isLoading={isSubmitting}
       onPress={submit}
       />

       <View className='flex justify-center mt-1 flex-row gap-2'>
        <Text className='base-reguler text-gray-100'>
          Already have an account? ?
        </Text>
        <Link href="/sign-in" asChild>
          <Text className="base-bold text-primary">Sign In</Text>
        </Link>
       </View>
    </View>
  )


}

export default SignUp