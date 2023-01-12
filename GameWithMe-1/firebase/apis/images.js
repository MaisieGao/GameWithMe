import { getStorage, ref, uploadBytes, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';

// upload image blob can cause random crashes on iOS, but fine on android on firebase 9.0.0+, see
// https://github.com/firebase/firebase-js-sdk/issues/5848
// https://stackoverflow.com/questions/72400610/upload-multiple-images-to-firebase-blob-crashing-app
//
// if it continues, we will be switching to base64 solution
const uploadImageByBytes = async (image) => {
  const storage = getStorage();
  const imagePath = 'images/' + uuid.v4() + ".jpeg";
  const imageRef = ref(storage, imagePath);

  return await uploadBytes(imageRef, image, {
    contentType: "image/jpeg"
  }).then((snapshot) => {
    console.log('Uploaded a blob or file!');
    return imagePath;
  }).catch(err => {
    console.error("error in uploadImage");
    throw err;
  });
}

const uploadImageByUri = async (imageUri) => {
  const img = await fetch(imageUri);
  const imageBlob = await img.blob();

  const storage = getStorage();
  const imagePath = 'images/' + uuid.v4() + ".jpeg";
  const imageRef = ref(storage, imagePath);

  return await uploadBytes(imageRef, imageBlob, {
    contentType: "image/jpeg"
  }).then((snapshot) => {
    console.log('Uploaded a blob or file!');
    return imagePath;
  }).catch(err => {
    console.error("error in uploadImage");
    throw err;
  });
}

const deleteImage = async (imagePath) => {
  const storage = getStorage();
  // create a reference to the file to delete
  const desertRef = ref(storage, imagePath);

  // delete file
  deleteObject(desertRef).then(() => {
    console.log('deleted', imagePath)
  }).catch((error) => {
    console.error('Error in deleteImage', error);
    throw error;
  });
}

// maximum number of images to store in the cache
const MAX_CACHE_SIZE = 100;
// list of recently used images
const recentlyUsedImages = [];
// mapping from image paths to local URIs
const imagePathToLocalUri = {};

const getImageUri = async (imagePath) => {
  // create the cache directory if it does not exist
  const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.cacheDirectory}images`);
  if (!dirInfo.exists) {
    console.log("creating directory");
    await FileSystem.makeDirectoryAsync(`${FileSystem.cacheDirectory}images`, {
      intermediates: true
    });
  }

  // check if the image is in the cache
  if (imagePath in imagePathToLocalUri) {
    // update the list of recently used images
    const index = recentlyUsedImages.indexOf(imagePath);
    recentlyUsedImages.splice(index, 1);
    recentlyUsedImages.unshift(imagePath);

    // return the local URI for the image
    // console.log('return image from cache', imagePathToLocalUri[imagePath]);
    return imagePathToLocalUri[imagePath];
  }

  const localUri = `${FileSystem.cacheDirectory}${imagePath}`;

  // retrieve the storage service and the image reference
  const storage = getStorage();
  const imageRef = ref(storage, imagePath);

  // retrieve the download URL for the image
  const downloadUrl = await getDownloadURL(imageRef);
  // console.log('downloading image from firebase', downloadUrl);

  // download the image from firebase storage
  await FileSystem.downloadAsync(downloadUrl, localUri);

  // add the image to the list of recently used images
  recentlyUsedImages.unshift(imagePath);

  // add the image to the cache mapping
  imagePathToLocalUri[imagePath] = localUri;

  // if the cache is full, remove the least recently used image
  if (recentlyUsedImages.length > MAX_CACHE_SIZE) {
    const leastRecentlyUsedImage = recentlyUsedImages.pop();
    delete imagePathToLocalUri[leastRecentlyUsedImage];
  }

  // return the local URI for the image
  // console.log('return image from cache', localUri);
  return localUri;
}

export { uploadImageByBytes, uploadImageByUri, getImageUri, deleteImage }