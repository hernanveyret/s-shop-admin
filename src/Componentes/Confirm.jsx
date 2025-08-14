import React, { useState, useEffect } from 'react';
import './confirm.css';

const Confirm = ({setIsConfirm, textoConfirm, setTextoConfirm}) => {
  useEffect(() => {    
    setTimeout(() => {
      setIsConfirm(false);
      setTextoConfirm('')
    },3000)
  },[])

  return (
    <div className='container-confirm'>
      <div className="banner-confirm">
        <p>{textoConfirm}</p>
      </div>
    </div>
  )
};
export default Confirm;