import React, { useState, useEffect } from 'react';
import './error.css';

const Error = ({setIsError, textoError, setTextoError}) => {
  useEffect(() => {    
    setTimeout(() => {
      setIsError(false);
      setTextoError('')
    },3000)
  },[])

  return (
    <div className='container-error'>
      <div className="banner-error">
        <p>{textoError}</p>
      </div>
    </div>
  )
};
export default Error;