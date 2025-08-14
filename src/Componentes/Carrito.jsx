import React, { useEffect, useState } from 'react';
import { getData, getDataCategorias, borrarCategoria, editActivate } from '../firebase/auth.js';
import './contenedorProductos.css';

const Carrito = ({
  setInitBtn,
  setIsCarrito,
  user,
  categorias,
  setCategorias,
  setIsEditProducto,
  productos,
  setProductos,
  productoEditar,
  setProductoEditar,
  eliminarImagen,
  isActivate,
  setIsActivate,
  isConfirmBorrado,
  setIsConfirmBorrado,
  borrar,
  setBorrar
}) => {
  const [categoriaFiltrada, setCategoriaFiltrada] = useState('');
  const [ productoSelect, setProductoSelect ] = useState(null)

  const sacarOferta = (precio, porcentaje) => {
    const precioOff = precio * porcentaje / 100;
    return (precio - precioOff).toFixed(2);
  };

  useEffect(() => {
    if (user) {
      getData(setProductos);
      getDataCategorias(setCategorias);
    } else {
      setProductos([]);
    }
  }, [user]);

  const categoriaSelect = (e) => {
    setCategoriaFiltrada(e.target.value);
  };

  useEffect(() => {
    if(borrar){
      handleEliminarProducto(productoSelect);
      setIsConfirmBorrado(false)
    }
  },[borrar])


  const handleEliminarProducto = async (prod) => {
      
    try {
      await eliminarImagen('Producto borrado con exito', prod.public_id);
      await borrarCategoria('productos', prod.id);
    } catch (error) {
      console.error('❌ Error al eliminar imagen o producto:', error);
    }
  };

  const handleToggleActivate = async (id, newState) => {
    try {
      await editActivate(id, newState);
      // Refrescar productos desde Firebase
      await getData(setProductos);
    } catch (error) {
      console.error('❌ Error al cambiar estado activate:', error);
    }
  };

 

  const renderProducto = (prod) => (
    <div key={prod.id} className="fila-producto">
      <img src={prod.urlImg} alt={prod.titulo} />

      <div className="fila-datos">
        <p><strong>{prod.titulo}</strong></p>
        <p>{prod.descripcion}</p>
        <p>$ {prod.oferta ? sacarOferta(prod.precio, prod.porcentajeOff) : prod.precio}</p>

        
        {prod.oferta ? (
          <p>🟢 Oferta {prod.porcentajeOff}% OFF</p>
        )
        :
        <p>🔴 No tiene oferta</p>
        }
      </div>

      <div className="fila-botones">
        <button
          onClick={() => {
            setIsEditProducto(true);
            const filtro = productos.find(p => p.id === prod.id);
            setProductoEditar(filtro);
          }}
          title="Editar"
        >
          ✏️
        </button>
        <button
          onClick={() => { 
            setProductoSelect(prod)
            setIsConfirmBorrado(true) }}
          title="Eliminar"
        >
          🗑️
        </button>

        <button
          onClick={() => handleToggleActivate(prod.id, !prod.activate)}
          title="Activar/Desactivar"
        >
          {
            prod.activate ?
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#2c9b0bff">
                <path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm0-80h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm400-40q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM480-480Z"/>
              </svg>
              :
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323">
                <path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm0-80h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-40q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm200-120Z"/>
              </svg>
          }
        </button>
      </div>
    </div>
  );

  const productosAMostrar = categoriaFiltrada
    ? productos.filter(p => p.categoria.toLowerCase() === categoriaFiltrada.toLowerCase())
    : productos;

  return (
    <div className="container-general">
      <div className='header-general'>
        <h4>Lista de Productos</h4>
      </div>

      <section className="categorias">
        <select id="selectCategoria" onChange={categoriaSelect}>
          <option value="">Seleccione una categoria</option>
          {categorias && categorias.map(c => (
            <option key={c.id} value={c.categoria}>{c.categoria}</option>
          ))}
        </select>
      </section>

      <div className="contenedor-productos">
        {
          productosAMostrar.length > 0 ?
            productosAMostrar.map(renderProducto)
            :
            <p style={{textAlign:'center'}}>No hay productos para mostrar.</p>
        }
      </div>
    </div>
  );
};

export default Carrito;

