import React, { useState } from 'react';
import './compartir.css';

const Compartir = ({setSharedLink, setOnQr}) => {

    // copia al portapapeles la url
   const sharedApp = () => {
    navigator.clipboard.writeText('https://mistresprinsesas.vercel.app/') 
    .then(() => {
      setSharedLink(true)
      setTimeout(() => {
       setSharedLink(false)
      }, 3000);
    })
    .catch(()=> {
      console.log('Error al compiar el link al portapapeles')
    })
  }
  return (
    <div className='container-compartir'>
      <div className='container-btn'>
        <button
          title="Compartir link"
          onClick={() => sharedApp()}
        >
          Compartir Link</button>
        <button
        title="Mostrar QR"
        onClick={() => setOnQr(true)}
        >Mostrar QR</button>
      </div>
    </div>
  )
};
export default Compartir;