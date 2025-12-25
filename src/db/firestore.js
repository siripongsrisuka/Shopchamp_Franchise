import firebase from 'firebase/app'
import 'firebase/firestore'
import  'firebase/auth'
import 'firebase/storage'
// Note! : firebase V9 are more change syntax and not different in feature.so,use V8 and change to V9 later .....
// import firebase from 'firebase/compat/app';
// import 'firebase/compat/auth';
// import 'firebase/compat/firestore';
// import 'firebase/compat/storage';


import { stringYMDHMS } from '../Utility/dateTime';
import { v4 as uuidv4 } from 'uuid';

// // shopchamp-restaurant
// const firebaseConfig = {
//   apiKey: "AIzaSyDIrSUcUCUrdgCZ6xRTiw9kd4KGG5J609Q",
//   authDomain: "shopchamp-restaurant.firebaseapp.com",
//   projectId: "shopchamp-restaurant",
//   storageBucket: "shopchamp-restaurant.appspot.com",
//   messagingSenderId: "845480287943",
//   appId: "1:845480287943:web:821115f96c08d7406428e2",
//   measurementId: "G-4GEN2V2CEL"
// };

// shopchamp-merchant
const firebaseConfig = {
  apiKey: "AIzaSyAQDCXX7p-vOMHVEAlUpDgQmh382ulvfMA",
  authDomain: "shopcham-24b0b.firebaseapp.com",
  projectId: "shopcham-24b0b",
  storageBucket: "shopcham-24b0b.appspot.com",
  messagingSenderId: "955470064375",
  appId: "1:955470064375:web:46d333dd232ee016af01f2",
  measurementId: "G-DS6JW927RY"
};
  
  //hash for void error, load firebase only once
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  const db = firebase.firestore()
  const firebaseAuth = firebase.auth()
  const firebaseStorage = firebase.storage()

  export {db,firebaseAuth,firebaseStorage}

  export const webImageDelete = async (oldUrltoDelete=null) => {
    const oldFileRef = await firebaseStorage.refFromURL(oldUrltoDelete).fullPath;
    // alert(oldFileRef);
    
    firebaseStorage.ref(oldFileRef).getDownloadURL()
      .then(()=>{
        firebaseStorage.ref(oldFileRef).delete();
        // alert('success delete file in firebaseStorage!')
      })
      .catch((err)=>{
        console.log('oldUrltoDelete file does not exits!')
        // alert('oldUrltoDelete file does not exits!')
        console.log(err);
      }); 
  
  };
  
  export const prepareFirebaseImage2 = async (imageData, storageRef, franchiseId) => {
    let imageUrl = '';
    
    // Extract the image format (e.g., png, jpg, gif) from the data URL
    const imageFormat = imageData.match(/^data:image\/(\w+);base64,/)?.[1]; // Extract the format (e.g., png, gif, jpg)
    if (!imageFormat) {
      throw new Error('Invalid image format'); // Handle unsupported formats
    }
  
    const fileName = franchiseId + uuidv4(); // Add timestamp to prevent overwriting
    const filePath = `${storageRef}${fileName}.png`; // Set the file path with the correct extension
    
    // Upload image to Firebase Storage with the correct contentType
    await firebaseStorage.ref(filePath).putString(imageData, 'data_url', { contentType: `image/png` });
    
    // Get the download URL of the uploaded image
    imageUrl = await firebaseStorage.ref(filePath).getDownloadURL();
  
    return imageUrl;
  };

  export const prepareFirebaseImage = async (imageData,storageRef,oldUrltoDelete=null) => { // auto check format and prepare URL to send image file and get URL
    // Example to use ...
    // 'add file only':
    //    const imageIdUrl = await prepareFirebaseImage(editBrandProfile.imageId,'/brandProfile/')
    // 'update file (add & delete old file) :
    //    const oldUrltoDelete = await db.collection('productCobrand').doc(docId).get().then(doc => doc.data().imageId) //get one object pattern
    //    const imageIdUrl = await prepareFirebaseImage(editBrandProfile.imageId,'/brandProfile/',oldUrltoDelete)
    
    // alert('prepareFirebaseImage')
  
    let imageUrl = ''
    // if(imageData?.name == undefined){ // detect "URL" format
    //     imageUrl = imageData
    // }else{ // detect "BLOB" format
        // alert('else prepareFirebaseImage')
        // const fileName = stringYMDHMS()+imageData.name // event.target.files[0].name ,add datetime to prevent instead old file in firebase storage
        const fileName = stringYMDHMS() // event.target.files[0].name ,add datetime to prevent instead old file in firebase storage
        // await firebaseStorage.ref(storageRef+fileName).put(imageData)  //eg. ref = 'brandProfile/pepsiCanPicture';
        // firebaseStorage.ref(storageRef+fileName).putString(imageData, 'data_url', { contentType: 'image/jpeg' });
        await firebaseStorage.ref(storageRef+fileName+'.png').putString(imageData, 'data_url', { contentType: 'image/png' });
        imageUrl = await firebaseStorage.ref(storageRef+fileName+'.png').getDownloadURL();
  
        // imageUrl = await firebaseStorage.ref(storageRef+fileName).getDownloadURL()
  
        // if(oldUrltoDelete){   // delete old file in firebase storage
        // const oldFileRef = await firebaseStorage.refFromURL(oldUrltoDelete).fullPath
        // firebaseStorage.ref(oldFileRef).delete()
        // }
    // }
  
    // console.log('refFromURL()',await firebaseStorage.refFromURL(imageUrl).fullPath)
    return imageUrl
  }