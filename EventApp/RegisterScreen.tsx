import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
  const handleRegister = async (values) => {
    try {
      const response = await axios.post('http://10.0.2.2:3000/register', values);
      if (response.status === 200) {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      onSubmit={handleRegister}
    >
      {({ handleChange, handleBlur, handleSubmit, values }) => (
        <View style={styles.container}>
          <Text>Kullanıcı Adı</Text>
          <TextInput
            onChangeText={handleChange('username')}
            onBlur={handleBlur('username')}
            value={values.username}
            style={styles.input}
          />
          <Text>Şifre</Text>
          <TextInput
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
            secureTextEntry
            style={styles.input}
          />
          <Button onPress={handleSubmit} title="Kayıt Ol" />
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
});

export default RegisterScreen;
