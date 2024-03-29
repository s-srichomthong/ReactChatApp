import React from 'react'
import { View, Text, SafeAreaView, Image, Button, TouchableOpacity } from 'react-native'
import Container from '../components/Container'
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import uploadImage from '../libs/firebase/uploadImage'
import setDatabase from '../libs/firebase/setDatabase'
import { Ionicons } from '@expo/vector-icons'
import logout from "../libs/firebase/logout";
import getClient from "../libs/firebase/getClient";
import getDatabase from "../libs/firebase/getDatabase";
import getFirebaseClient from '../libs/firebase/getClient'
import styles from "../styles/layout";

class ProfileScreen extends React.Component {

    state = {
        image: null,
        hasCameraPermission: false,
        userId: null,
        name : null,
        authLoading: false
    };

    static navigationOptions = ({ navigation }) => ({
        title: 'Profile',

        headerRight: () => (
            <TouchableOpacity
                title="Sign out"
                onPress={() => {
                    logout().then(() => {
                        const { firebase } = getClient();
                        firebase.auth().signOut().then(() => {
                            navigation.replace('LoginScreen')
                        }).catch( (err) => {
                            alert("Error while logout caused by : " + err.getMessages())
                        });

                    }).catch((error) => {
                        console.log(error)
                    })
                }}>
                <Text style={{color:'#508deb', marginEnd : 10}}>Sign out</Text>
            </TouchableOpacity>
        )
    });

    getProfileData = async () => {
        const { firebase } = getFirebaseClient();
        const user = firebase.auth();
        await getDatabase(`users/${user.currentUser.uid}`, (data) => {
            this.setState({image : data.avatar});
            this.setState({name : data.name});
            this.setState({loading : false});
        })
    };

    componentDidMount() {
        this.getPermissionAsync().then(r => {

        });

        this.getProfileData();
        const uid = this.props.navigation.getParam('uid');
        this.setState({
            userId: uid
        })
    }

    getPermissionAsync = async () => {
        const cameraRoll = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        if (cameraRoll.status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
        }
        this.setState({ hasCameraPermission: true });

    };

    _pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1
        });

        if (!result.cancelled) {
            this.setState({ image: result.uri });
        }
    };

    onTakePhoto = (data) => {
        this.setState({
            image: data
        });
    };

    saveImage = async () => {
        if (this.state.image == null) {
            alert('please choose a photo');
            return
        }
        this.setState({ authLoading: true });
        const url = await uploadImage(this.state.image);
        await setDatabase('users/' + this.state.userId + '/avatar', url);
        this.setState({ authLoading: false });
        this.props.navigation.replace('ChatRoom')
    };


    render() {
        const { image } = this.state;
        return (
            <Container loading={this.state.authLoading} >
                <SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, marginTop: 30, marginBottom: 20 }}>สวัสดี {this.state.name? this.state.name : "Unknown"}</Text>
                    <Image
                        style={{ width: 250, height: 250, borderRadius: 125, marginVertical: 20 }}
                        source={ image == null ? require('../../assets/placeholderAvatar.png') : {uri: image} } />

                    <View style={{flexDirection: 'row', marginBottom: 50}}>
                        <TouchableOpacity
                            title="Open Camera Roll"
                            onPress={this._pickImage}>
                            <View style={{width: 60, height: 60, backgroundColor: '#606060', alignItems: 'center', justifyContent: 'center', borderRadius: 30, margin: 10}}>
                                <Ionicons name="md-images" size={32} color="#fff" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            title="Open Camera"
                            onPress={() => this.props.navigation.navigate('Camera', { onTakePhoto: this.onTakePhoto })}>
                            <View style={{width: 60, height: 60, backgroundColor: '#606060', alignItems: 'center', justifyContent: 'center', borderRadius: 30, margin: 10}}>
                                <Ionicons name="md-camera" size={32} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        title="Save"
                        onPress={this.saveImage}>
                        <Text style={styles.buttonCute}>Save</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Container>
        )
    }
}

export default ProfileScreen
