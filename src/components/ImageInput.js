import React, {useEffect} from "react";
import { Form } from "react-bootstrap";
import '../styles/imageInput.css' // Must to use for bind file input,label,img together (css eclipse the element together)!!!
import imgPlaceHolder from '../assets/image/imgPlaceHolder.png'

//Notice
// In HTML5 element rule...
// 'id' propertie : must only have unique 1 id propertie name/1 web page (If duplicate => a event or reference will work with first ordinaly id tag => wrong event handler)
// 'className' propertie : can duplicate in a web page

//How to use...
//=> Set Difference Id (htmlId) If more than one <ImageInput/> 
// to prevent the "label" HMTL element confuse to bind event with file input )
//=> Set Difference html name to use edit state that it's relate object name with element name
// like eg ...
{/* <ImageInput data={addFormData} onChange={handleAddFormChange} htmlId="imageInAddForm" /> */}
{/* <ImageInput data={editBrandProfile} onChange={handleBrandChange} htmlId="imageInEditBrand" width='300px'/> */}
{/* <ImageInput data={editBrandProfile} onChange={handleBrandChange} htmlId="imageInBrandAds" width='300px' name = "brandAdsImage" /> */}

const ImageInput = ({
  data = {},
  onChange,
  htmlId="photo",  // default value
  width = '80px',
  name = "imageId" 
}) => {
 

  // "eval" is change string and variable to real execute code.Benefit to work with dynamic value
  // eg. eval('data.'+name) = data.imageId ,data.brandAdsImage
  // the <img/> can receive value/show picture data in 2 forms = [Path,URL] . So must change "BLOB" format from file input to URL
  let imageUrl = ''
  if(eval('data.'+name+'?.name') == undefined){ // Detect,If data in "file object("BLOB" format)" .It'll have key "name"
    imageUrl = eval('data.'+name)
  }else{
    imageUrl = URL.createObjectURL(eval('data.'+name))
  }
  console.log("imageUrl" + imageUrl)
  return (
    <form encType="multipart/form-data">
        <div className="form__img-input-container fluid">
            {/* 
            "label" is same part of "file input".Use to increase panel to can clicked -> can trigger event
            and can add optional UI in the label

            the "<form encType="multipart/form-data">"Send data in binary format.May must use with some send/store data to server or page
            Normaylly,when send data it will in ASKII format .So, can't use with some data eg. file, picture 
            */}
            <Form.Control 
              name= {name}
              type="file" 
              accept=".png, .jpg, .jpeg "
              id={htmlId} 
              className="visually-hidden"
              onChange={onChange}
            />
            <label htmlFor= {htmlId} className="form-img__file-label" style={{width:width,height:width}}>  
            
            </label>
            {/* <img src={src} alt={alt} className="form-img__img-preview" /> */}
            {eval('data.'+name)?  
              (<img src={imageUrl} className="form-img__img-preview" style={{width:width,height:width}} />)
             :(<img src={imgPlaceHolder} className="form-img__img-preview" style={{width:width,height:width}}/>)
            }

        </div>
    </form>
  );
};

export default ImageInput;
