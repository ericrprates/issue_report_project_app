import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  View,
  TouchableOpacity,
  StatusBar
} from "react-native";

import Constants from "expo-constants";
import { Form } from "@unform/mobile";
import Input from "../components/Input";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import api from "../services/api";
import * as FileSystem from "expo-file-system";

function HowTo() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [location, setLocation] = useState(null);

  const camRef = useRef(null);
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [picture, setPicture] = useState(false);
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
    _getLocationAsync();
  }, []);

  const _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      alert("Permission to access location was denied");
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const handlePress = async () => {
    if (camRef && !picture) {
      setLoading(true);

      let photo = await camRef.current.takePictureAsync({
        quality: 0.4
      });

      camRef.current.pausePreview();
      setPicture(photo);
      setLoading(false);
    } else {
      camRef.current.resumePreview();
      setPicture(false);
    }
  };

  const handleSubmit = async (data, { reset }) => {
    try {
      let fileB64 = await FileSystem.readAsStringAsync(picture.uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      let response = await api
        .post("/issues", {
          file: "data:image/png;base64," + fileB64,
          ...data,
          location
        })
        .catch(e => {
          console.log(e);
        });
      if (response.data.success) {
        setPicture(false);
        alert("Enviado com sucesso!");
        reset();
        camRef.current.resumePreview();
      } else {
        alert("Ooops, error!");
      }
    } catch (e) {
      console.log(e);
      alert("Ooops, error!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Issue Reports</Text>
      <Text style={styles.subtitle}>Report the problems of your city</Text>
      <KeyboardAvoidingView behavior={"padding"}>
        <ScrollView>
          <StatusBar barStyle="dark-content" />
          <Form ref={formRef} onSubmit={handleSubmit}>
            <Input name="title" label="Title" />
            <Input name="description" label="Description" />
            <Camera
              style={{ flex: 1, marginBottom: 20 }}
              type={type}
              ref={camRef}
              autoFocus={Camera.Constants.AutoFocus.on}
              focusDepth={0}
            >
              <View style={styles.cameraView}>
                <TouchableOpacity style={styles.photoBtn} onPress={handlePress}>
                  <Text style={styles.btnText}> Photo </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.flipBtn}
                  onPress={() => {
                    setType(
                      type === Camera.Constants.Type.back
                        ? Camera.Constants.Type.front
                        : Camera.Constants.Type.back
                    );
                  }}
                >
                  <Text style={styles.btnText}> Flip </Text>
                </TouchableOpacity>
              </View>
            </Camera>
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && { backgroundColor: "lightgray" }
              ]}
              onPress={() => !loading && formRef.current.submitForm()}
            >
              <Text style={styles.submitButtonText}>
                {!loading ? "Send" : "Loading"}
              </Text>
            </TouchableOpacity>
          </Form>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flipBtn: {
    flex: 0.5,
    alignSelf: "flex-end",
    alignItems: "flex-end"
  },
  btnText: {
    fontSize: 18,
    marginBottom: 10,
    color: "white"
  },
  photoBtn: {
    alignSelf: "flex-end",
    alignItems: "flex-start",
    flex: 0.5
  },
  cameraView: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    height: 300
  },
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    paddingHorizontal: 40,
    paddingVertical: 20
  },
  actionsContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  title: {
    fontWeight: "bold",
    fontSize: 30,
    fontFamily: "Roboto"
  },
  subtitle: {
    fontSize: 14,
    marginVertical: 20,
    fontFamily: "Roboto",
    color: "gray"
  },
  next: {
    fontSize: 30,
    fontWeight: "bold",
    color: "lightgray",
    fontFamily: "Roboto"
  },
  submitButton: {
    backgroundColor: "lightblue",
    borderRadius: 4,
    padding: 16,
    alignItems: "center"
  },

  submitButtonText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 15
  }
});

export default React.memo(HowTo);
