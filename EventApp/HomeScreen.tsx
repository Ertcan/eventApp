import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Modal, Text, TouchableOpacity, TextInput, Image, ScrollView } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import { Picker } from '@react-native-picker/picker';
import { launchCamera } from 'react-native-image-picker';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

MapboxGL.setAccessToken('pk.eyJ1IjoiZXJ0Y2FuIiwiYSI6ImNseWx5N3Y3ZjA4ZmIyanFyaW1wbTE1bHYifQ.tyJTX_KmRgTktiL1DL0sVg');


const socket = io('http://10.0.2.2:3000'); 

const HomeScreen = ({ navigation }) => {
  const toastref = useRef <Toast> (null);
  const [userLocation, setUserLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportmodalVisible, reportsetModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [address, setAddress] = useState('');
  const [type, setType] = useState('1');
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [photoUri, setPhotoUri] = useState('');
  const [incidents, setIncidents] = useState([]);

  const getLocationPermission = async () => {
    const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    if (result === RESULTS.GRANTED) {
      const watchId = Geolocation.watchPosition(
        (position) => {
          setUserLocation([
            position.coords.longitude,
            position.coords.latitude,
          ]);
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, distanceFilter: 10, interval: 10000 } 
      );

      return () => Geolocation.clearWatch(watchId);
    }
  };
  
  getLocationPermission();

  useEffect(() => {
    const fetchIncidentTypes = async () => {
      try {
        const response = await fetch('http://10.0.2.2:3000/incident-types');
        const data = await response.json();
        setIncidentTypes(data);
        if (data.length > 0) {
          setType(data[0].type); 
        }
      } catch (error) {
        console.error('Error fetching incident types:', error);
      }
    };

    fetchIncidentTypes();
  }, []);


  useEffect(() => {
    const handleInitialIncidents = (initialIncidents) => {
      console.log('Initial incidents received:', initialIncidents);
      
    
      const formattedIncidents = initialIncidents.map(incident => ({
        ...incident,
        lat: parseFloat(incident.lat),
        lon: parseFloat(incident.lon),
      }));
    
      
      setIncidents(formattedIncidents);
    
      
      if (userLocation) {
        const nearbyIncidents = formattedIncidents.filter(incident => {
          const distance = getDistance(userLocation[1], userLocation[0], incident.lat, incident.lon);
          return distance <= 1; 
        });
    
        if (nearbyIncidents.length > 0) {
          showNotification(nearbyIncidents);
        }
      }
    };
    const handleIncidentUpdate = (newIncident) => {
      console.log('New incident received:', newIncident);
      if (newIncident && typeof newIncident === 'object') {
        const latitude = parseFloat(newIncident.lat);
        const longitude = parseFloat(newIncident.lon);
  
        if (isNaN(latitude) || isNaN(longitude)) {
          console.log('Invalid coordinates:', newIncident.lat, newIncident.lon);
          return;
        }
  
        setIncidents((prevIncidents) => [
          ...prevIncidents,
          {
            ...newIncident,
            lat: latitude,
            lon: longitude,
          },
        ]);
      } else {
        console.error('Expected an object but got:', newIncident);
      }
    };
    

    const handleViewIncrement = ({ id }) => {
      console.log('View increment received for id:', id);
      setIncidents((prevIncidents) =>
        prevIncidents.map(incident =>
          incident.id === id
            ? { ...incident, views: incident.views + 1 }
            : incident
        )
      );
    };
  
    const handleMarkAsGone = ({ id }) => {
      console.log('Mark as gone received for id:', id);
      setIncidents((prevIncidents) =>
        prevIncidents.map(incident =>
          incident.id === id
            ? { ...incident, isactive: false }
            : incident
        )
      );
    };
    socket.emit('initialIncidents');
    

    socket.on('initialIncidents', handleInitialIncidents);
    socket.on('incidentUpdate', handleIncidentUpdate);
    socket.on('viewIncrement', handleViewIncrement);
    socket.on('markAsGone', handleMarkAsGone);
  
    return () => {
      socket.off('initialIncidents', handleInitialIncidents);
      socket.off('incidentUpdate', handleIncidentUpdate);
      socket.off('viewIncrement', handleViewIncrement);
      socket.off('markAsGone', handleMarkAsGone);
    };
  }, []);
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const showNotification = (incidents) => {
    Toast.show({
      type: 'info',
      position: 'top',
      text1: 'Nearby Incidents',
      text2: `There are ${incidents.length} incidents near you.`,
      visibilityTime: 5000, 
      autoHide: true, 
      topOffset: 60, 
      onShow: () => console.log('Notification shown'),
      onHide: () => console.log('Notification hidden'),
    });
  };
  const getAddressFromCoordinates = async (longitude, latitude) => {
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoiZXJ0Y2FuIiwiYSI6ImNseWx5N3Y3ZjA4ZmIyanFyaW1wbTE1bHYifQ.tyJTX_KmRgTktiL1DL0sVg`);
      const data = await response.json();
      const address = data.features.length > 0 ? data.features[0].place_name : 'No address found';
      return address;
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Error fetching address';
    }
  };

  const handleMapPress = async (event) => {
    const { coordinates } = event.geometry;
    const [longitude, latitude] = coordinates;
    
    
    const address = await getAddressFromCoordinates(longitude, latitude);
    
    
    setModalData({
      latitude,
      longitude,
      address,  
    });
    setAddress(address); 
    setModalVisible(true);
  };
  const handlePhotoPick = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 1,
      },
      (response) => {
        if (response.assets && response.assets.length > 0) {
          setPhotoUri(response.assets[0].uri);
        }
      }
    );
  };

  const handleSave = async () => {
    const formData = new FormData();
    
    
    if (photoUri) {
      formData.append('photo', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
    }
  
    try {
      let imageAddress = null;
      
      if (photoUri) {
        const response = await fetch('http://10.0.2.2:3000/upload-photo', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        imageAddress = data.filePath;
      }
  
     
      socket.emit('incidentUpdate', {
        lat: modalData.latitude,
        lon: modalData.longitude,
        type,
        address,
        image_address: imageAddress,
        views: 1,
        isactive: true
      });
  
      
      setModalVisible(false);
      setAddress('');
      setType('');
      setPhotoUri('');
    } catch (error) {
      console.error('Error sending incident:', error);
    }
  };
  const handleViewIncrement = async () => {
    if (!modalData || !modalData.id) return;
  
    try {
      const clickedIncidents = await AsyncStorage.getItem('clickedIncidents');
      const clickedList = clickedIncidents ? JSON.parse(clickedIncidents) : [];
  
      if (!clickedList.includes(modalData.id)) {
       
        clickedList.push(modalData.id);
        await AsyncStorage.setItem('clickedIncidents', JSON.stringify(clickedList));
  
       
        socket.emit('viewIncrement', { id: modalData.id });
        
       
        setModalData((prevData) => ({
          ...prevData,
          views: prevData.views + 1, 
        }));
      } else {
        
        alert('You have already clicked this incident.');
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };
  
  
  const handleMarkAsGone = async () => {
    if (!modalData || !modalData.id) return;
  
    try {

      socket.emit('markAsGone', { id: modalData.id });
      
      
      reportsetModalVisible(false);
    } catch (error) {
      console.error('Error marking as gone:', error);
    }
  };
  const renderIncidentMarkers = () => {
    return incidents
      .filter(incident => incident.isactive) 
      .map((incident, index) => (
        <MapboxGL.PointAnnotation
          key={index}
          id={`incident-${index}`}
          coordinate={[incident.lon, incident.lat]}
          onSelected={() => {
            setModalData({
              latitude: incident.lat,
              longitude: incident.lon,
              type: incident.incident_type,
              address: incident.address,
              image: incident.image,
              views: incident.views,
              id: incident.id,
            });
            reportsetModalVisible(true);
          }}
        >
        </MapboxGL.PointAnnotation>
      ));
  };

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map} onLongPress={handleMapPress}>
        {userLocation && (
          <MapboxGL.Camera
            centerCoordinate={userLocation}
            zoomLevel={12}
            animationMode="flyTo"
            animationDuration={1000}
          />
        )}
        {userLocation && (
          <MapboxGL.PointAnnotation
            id="user-location"
            coordinate={userLocation}
          >
            <MapboxGL.Callout>
              <View>
                <Text>You are here!</Text>
              </View>
            </MapboxGL.Callout>
          </MapboxGL.PointAnnotation>
        )}
        {renderIncidentMarkers()}
      </MapboxGL.MapView>

      <Modal
        visible={reportmodalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => reportsetModalVisible(false)}
       
      >
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Incident Details</Text>
            <Text style={styles.modalText}>Type: {modalData?.type}</Text>
            <Text style={styles.modalText}>Address: {modalData?.address}</Text>
            <Text style={styles.modalText}>Views: {modalData?.views}</Text>
            {modalData?.image ? (
              <TouchableOpacity onPress={() => {
                <Image source={{ uri: `http://10.0.2.2:3000/${modalData?.image}` }} style={styles.enlargedImage} />
              }}>
                <Image source={{ uri: `http://10.0.2.2:3000/${modalData.image}` }} style={styles.image} />
              </TouchableOpacity>
            ) : null}
              <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={() => reportsetModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.viewButton} onPress={handleViewIncrement}>
                <Text style={styles.viewButtonText}>Seen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.goneButton} onPress={handleMarkAsGone}>
          <Text style={styles.goneButtonText}>Gone</Text>
        </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Report Incident Modal */}
<Modal
  visible={modalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Report an Incident</Text>
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        multiline={true}
        numberOfLines={4}
        onChangeText={setAddress}
      />
      <Picker
        selectedValue={type}
        style={styles.picker}
        onValueChange={(itemValue) => setType(itemValue)}
      >
        {incidentTypes.map((item) => (
          <Picker.Item key={item.id} label={item.type} value={item.id} />
        ))}
      </Picker>
      <TouchableOpacity style={styles.photoButton} onPress={handlePhotoPick}>
        <Text style={styles.photoButtonText}>Take Photo</Text>
      </TouchableOpacity>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.imagePreview} />
      ) : null}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  modalContainer: {
    flex: 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  viewButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    height: 60,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
  photoButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  photoButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  image: {
    width: 350,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'white',
  },
  closeButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
  },
  enlargedImage: {
    width: '90%',
    height: '80%',
    resizeMode: 'contain',
  },
  goneButton: {
    backgroundColor: '#dc3545', 
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  goneButtonText: {
    color: 'white',
  },
});

export default HomeScreen;
