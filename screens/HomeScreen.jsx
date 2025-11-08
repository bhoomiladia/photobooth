import { CameraView, useCameraPermissions } from "expo-camera";
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { useState, useRef } from "react";
import { useIsFocused } from "@react-navigation/native";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";

export default function HomeScreen() {
  const [facing, setFacing] = useState("front");
  const [permission, requestPermission] = useCameraPermissions();
  const isFocused = useIsFocused();
  const cameraRef = useRef(null);
  const [photos, setPhotos] = useState([null, null, null]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [done, setDone] = useState(false);
  const collageRef = useRef(null);

  if (!permission) {
    return <Text>Camera is Loading...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Grant Camera Permissions</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.text}>Grant</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCamera = () => {
    setFacing((prev) => (prev === "front" ? "back" : "front"));
  };

  const takePhoto = async (index) => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({
      isImageMirrored: false,
      mirror : true,
    });

    setPhotos((prev) => {
      const updated = [...prev];
      updated[index] = photo.uri;
      return updated;
    });

    console.log(`Photo captured for slot ${index + 1}`);
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const autoClick = async () => {
    setPhotos([null, null, null]); // reset all photos
    setPhotoIndex(0);
    console.log("Starting auto capture...");

    for (let i = 0; i < 3; i++) {
      setPhotoIndex(i);
      await delay(1500); // allow camera to mount
      await takePhoto(i);
      console.log(`Captured photo ${i + 1}`);
      await delay(1000); // short pause between shots
    }

    console.log("All 3 photos captured!");
  };

  const resetLast = () => {
    // const newPhotos = [...photos];
    // const lastIndex = photoIndex === 0 ? 2 : photoIndex - 1;
    // newPhotos[lastIndex] = null;
    const newPhotos = [null,null,null]
    setPhotos(newPhotos);
    setPhotoIndex(0);
  };

  const getFinal = () => {
    setDone(true);
  };

  const restartApp = () => {
    setPhotos([null, null, null]);
    setPhotoIndex(0);
    setDone(false);
  };

  const downloadCollage = async () => {
    try {
      const uri = await captureRef(collageRef, { format: "jpg", quality: 1 });
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status!== "granted") {
        alert("Permission to access media library is required!");
        return;
      }
      await MediaLibrary.createAssetAsync(uri);
      Alert.alert("Yay!", "Collage saved to your gallery!", [{ text: "OK" }]);
    } catch (error) {
      console.error("Error saving collage: ", error);
    }
  };

  if (done) {
    return (
      <View style={styles.mainContainer}>
        <Text style={styles.heading}>{"🎀 Collage Preview"}</Text>
        <View ref={collageRef} style={styles.camerasContainer}>
          {photos[0] && <Image source={{ uri: photos[0] }} style={styles.camera} />}
          {photos[1] && <Image source={{ uri: photos[1] }} style={styles.camera} />}
          {photos[2] && <Image source={{ uri: photos[2] }} style={styles.camera} />}
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity onPress={downloadCollage} style={styles.button}>
            <Text style={styles.text}>Download Collage</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={restartApp} style={styles.button}>
            <Text style={styles.text}>Restart</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {isFocused && <View style={styles.camerasContainer}>
         {photos[0] && <Image source={{uri: photos[0]}} style={styles.camera} />} 
         {photos[1] && <Image source={{uri: photos[1]}} style={styles.camera} />} 
         {photos[2] && <Image source={{uri: photos[2]}} style={styles.camera} />}
          {!photos[2] &&< CameraView ref={cameraRef} style={styles.camera} facing={facing} />}
        </View>
      }

      <Text style={{ marginTop: 15, color: "#555" }}>
        {photos.filter(Boolean).length}/3 photos captured
      </Text>

      <View style={{ flexDirection: "row", gap: 10 }}>
        {!photos[2] && (
          <>
            <TouchableOpacity onPress={autoClick} style={styles.button}>
              <Text style={styles.text}>Click Picture</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCamera} style={styles.button}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity onPress={resetLast} style={styles.button}>
          <Text style={styles.text}>Retake</Text>
        </TouchableOpacity>
        {photos[2] && (
          <TouchableOpacity onPress={getFinal} style={styles.button}>
            <Text style={styles.text}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFF6F9",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },

  camerasContainer: {
    width: "70%",
    height: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 10,
    justifyContent: "space-evenly",
    alignItems: "center",
    shadowColor: "#FFC1CC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  camera: {
    height: "33%",
    width: "90%",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFD6E0",
    marginVertical: 0,
  },

  button: {
    backgroundColor: "#FF8FAB",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    shadowColor: "#FFB6C1",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
    marginTop: 15,
  },

  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "System",
    marginBottom: 5,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF0F5",
  },
});
