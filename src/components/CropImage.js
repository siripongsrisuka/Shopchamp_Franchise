import React, { useState, useRef } from 'react'
import 'react-image-crop/dist/ReactCrop.css'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop'
import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from './useDebounceEffect'
import {
  Button,
  Form,
  Row,
  Col,
  Container,
  Table,
  Modal,
  Card,
  Image,
  Collapse,
  InputGroup,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";

import 'react-image-crop/dist/ReactCrop.css'
import { colors } from '../configs';
import { checkSource } from '../Utility/function';
import loadImage from 'blueimp-load-image/js';
import { prepareFirebaseImage } from '../db/firestore';

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(
  mediaWidth,
  mediaHeight,
  aspect,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

function CropImage({onClick, onHide,ratio=4/1}) {
  const [test, setTest] = useState('')
  const [imgSrc, setImgSrc] = useState('')
  const previewCanvasRef = useRef(null)
  const imgRef = useRef(null)
  const hiddenAnchorRef = useRef(null)
  const blobUrlRef = useRef('')
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  // const [aspect, setAspect] = useState(16 / 9)
  const [aspect, setAspect] = useState(ratio)

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined) // Makes crop preview update between images.
      const reader = new FileReader()
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
      )
      reader.readAsDataURL(e.target.files[0])
    }
  }

  // const onSelectFile =  (e) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     loadImage(
  //       e.target.files[0],
  //       (img) => {
  //         var base64data = img.toDataURL(`image/jpeg`);
  //         setImgSrc(base64data);
  //         console.log(base64data)
  //       },
  //       { orientation: true, canvas: true }
  //     );
  //     // const reader = new FileReader();
  //     // reader.addEventListener('load', () => setUpImg(reader.result));
  //     // reader.readAsDataURL(e.target.files[0]);
  //   }
  // };

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }



  async function onDownloadCropClick() {
    if (!previewCanvasRef.current) {
      throw new Error('Crop canvas does not exist')
    }
    previewCanvasRef.current.toBlob((blob) => {
      console.log(blob)
      if (!blob) {
        throw new Error('Failed to create blob')
      }
      // if (blobUrlRef.current) {
      //   URL.revokeObjectURL(blobUrlRef.current)
      // }
      blobUrlRef.current = URL.createObjectURL(blob);
      // onClick(blobUrlRef.current)
      loadImage(
        blobUrlRef.current,
        async (img) => {
          var base64data = img.toDataURL(`image/jpeg`);
          onClick(base64data)
          // return base64data
          // const imageUrl = await prepareFirebaseImage(base64data,'/logo/')
          // alert(imageUrl)
        },
        { orientation: true, canvas: true }
      );
      

      // hiddenAnchorRef.current.href = blobUrlRef.current;
      // hiddenAnchorRef.current.click();
    })
  }

  // function onDownloadCropClick() {
  //   if (!previewCanvasRef.current) {
  //     throw new Error('Crop canvas does not exist')
  //   }
  //   console.log(previewCanvasRef.current)
  //   previewCanvasRef.current.toBlob((blob) => {
  //     if (!blob) {
  //       throw new Error('Failed to create blob')
  //     }
  //     if (blobUrlRef.current) {
  //       URL.revokeObjectURL(blobUrlRef.current)
  //     }
  //     blobUrlRef.current = URL.createObjectURL(blob);
  //     const myFile = new File([blobUrlRef.current], 'image.jpeg', {
  //       type: blobUrlRef.current.type,
  //   });
  //   console.log(myFile)
  //   onClick(myFile)

  //     hiddenAnchorRef.current.href = blobUrlRef.current;
  //     hiddenAnchorRef.current.click();
  //   })
  // }
  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate,
        )
      }
    },
    100,
    [completedCrop, scale, rotate],
  )

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined)
    } else if (imgRef.current) {
      const { width, height } = imgRef.current
      setAspect(ratio)
      setCrop(centerAspectCrop(width, height, ratio))
    }
  }

  return (
    <div className="App">
      <div className="Crop-Controls">
        <input type="file" accept="image/*" onChange={onSelectFile} />
        {/* <div>
          <label htmlFor="scale-input">Scale: </label>
          <input
            id="scale-input"
            type="number"
            step="0.1"
            value={scale}
            disabled={!imgSrc}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </div> */}
        {/* <div>
          <label htmlFor="rotate-input">Rotate: </label>
          <input
            id="rotate-input"
            type="number"
            value={rotate}
            disabled={!imgSrc}
            onChange={(e) =>
              setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))
            }
          />
        </div> */}
        {/* <div>
          <button onClick={handleToggleAspectClick}>
            Toggle aspect {aspect ? 'off' : 'on'}
          </button>
        </div> */}
      </div>
      {!!imgSrc && (
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={imgSrc}
            style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      )}
      <img style={{width:200}} src={test} />
      {!!completedCrop && (
        <>
          <div>
            <canvas
              ref={previewCanvasRef}
              style={{
                border: '1px solid black',
                objectFit: 'contain',
                width: completedCrop.width,
                height: completedCrop.height,
              }}
            />
          </div>
          <div>
              <Button onClick={onHide} variant="secondary" >close</Button>
              <Button style={{backgroundColor:colors.purpleRed,borderColor:colors.purpleRed,marginLeft:20,marginRight:20}} onClick={onDownloadCropClick} >confirm</Button>
            <a
              ref={hiddenAnchorRef}
              download
              style={{
                position: 'absolute',
                top: '-200vh',
                visibility: 'hidden',
              }}
            >
              Hidden download
            </a>
          </div>
        </>
      )}
    </div>
  )
}

export default  CropImage