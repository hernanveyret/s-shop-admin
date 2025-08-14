import React, { useState, useEffect } from 'react';
import './confirmBorrado.css';

const ConfirmBorrado = ({
        isConfirmBorrado,
        setIsConfirmBorrado,
        borrar,
        setBorrar
}) => { 

  return (
    <div className='container-borrar'>
      <div className="banner-borrar">
        <p>⚠️</p>
        <p>¿ Borrar ?</p>
        <div className="btns-borrado">
          <button
            onClick={() => { setBorrar(true) }}
          >SI</button>
          <button
            onClick={() => { 
              setBorrar(false);
              setIsConfirmBorrado(false);
            }}
          >NO</button>
        </div>
      </div>
    </div>
  )
};
export default ConfirmBorrado;