import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import './App.css'
import SubirImagenWebP from './Componentes/SubirImagenWebp'
import Carrito from './Componentes/Carrito';
import EditarProducto from './Componentes/EditarProducto.jsx';
import DatosBancarios from './Componentes/DatosBancarios.jsx';
import Confirm from './Componentes/Confirm.jsx';
import Error from './Componentes/Error.jsx';
import InstallPrompt from './Componentes/InstallPrompt.jsx';
import Compartir from './Componentes/Compartir.jsx';
import VerQr from './Componentes/VerQr.jsx';

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config.js";

import { loginConMail, 
         loginWhihtGoogle, 
         cerrarSesion, 
         crearCategorias, 
         borrarCategoria, 
         getDataCategorias, 
         cambiarContrasena,
         guardarPrecioEnvio,
         guardarDatosbancarios,
         getDataDatosBancarios,
         getDataCostoEnvio
        } from './firebase/auth.js';
import EditarCategoria from './Componentes/EditarCategoria.jsx';
import FormAuth from './Componentes/FormAuth.jsx';
import ConfirmBorrado from './Componentes/ConfirmBorrado.jsx';
import SharedConfirm from './Componentes/SharedConfirm.jsx';

function App() {
  const [ isLogin, setIsLogin ] = useState(true);
  const [ initBtn, setInitBtn ] = useState(false);
  const [ isCategorias, setIsCategorias ] = useState(false);
  const [ isEnvio, setIsEnvio ] = useState(false)
  const [ add, setAdd ] = useState(false);
  const [ isCarrito, setIsCarrito ] = useState(false)
  const [ user, setUser ] = useState(null);
  const [ usuario, setUsuario ] = useState(null);
  const [ categorias, setCategorias ] = useState([]);
  const [ datosDeBanco, setDatoDebanco ] = useState({})
  const [ valorDeEnvio, setValorDeEnvio ] = useState({});
  const [ idCategoria, setIdCategoria ] = useState(null);
  const [ nombreCategoria, setNombreCategoria ] = useState(null)
  const [ isEditProducto, setIsEditProducto ] = useState(false);
  const [ isEditCategorias, setIsEditCategorias ] = useState(false);
  const [ isActualizar, setIsActualizar ] = useState(false)
  const [ productos, setProductos ] = useState([]);
  const [ isActivate, setIsActivate ] = useState(true)
  const [ isDatosBancarios, setIsDatosBancarios ] = useState(false);
  const [ isConfirm, setIsConfirm ] = useState(false);
  const [ isError, setIsError ] = useState(false);
  const [ isConfirmBorrado, setIsConfirmBorrado ] = useState(false);
  const [ borrar, setBorrar ] = useState(false);
  const [ isCompartir, setIsCompartir]  = useState(false);

  const [ usuarioActual, setUsuarioActual ] = useState(null) 

  const [ productoEditar, setProductoEditar ] = useState(null)
  const [ archivoOriginal, setAchivoOriginal ] = useState(null)
  const [ textoConfirm, setTextoConfirm] = useState('');
  const [ textoError, setTextoError ] = useState('');
  const [ mensageErrorImagen, setMensageErrorImagen ] = useState(null)
  const [ sharedLink, setSharedLink ] = useState(false);
  const [ onQr, setOnQr ] = useState(false);

  const [ publicId, setIsPublicId ] = useState(null);

  const [ menu, setMenu ] = useState(true)

  // Para guardar URL subida
  const [ url, setUrl ] = useState(null);

  const styleBlock = {
    display: 'block',
    transition: '.2s ease'
  }

  const styleNone = {
    display: 'none'
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user)
        setIsLogin(false);
        setInitBtn(true)
        setUser(true)
        const currentUsuario = auth.currentUser
        setUsuarioActual(currentUsuario)
      } else {
        //console.log("⛔ No hay usuario logueado");
        setUser(false)
      }
    });
  },[]);

  useEffect(() => {
    //console.log(usuario)
    //usuario?.photoURL && console.log(usuario.photoURL)  
  },[usuario]);

  //Escucha firebase cuando hay categorias para mostrar
  useEffect(() => {
    const unsubscribeCategorias = getDataCategorias(setCategorias);
    const unsubscribeDatosBancarios = getDataDatosBancarios(setDatoDebanco);
    const unsubscribeValorDeEnvio = getDataCostoEnvio(setValorDeEnvio);
    return () => {
      if(unsubscribeCategorias) unsubscribeCategorias(); // Limpia el listener cuando se desmonta
      if(unsubscribeDatosBancarios) unsubscribeDatosBancarios(); // Limpia el listener cuando se desm
      if(unsubscribeValorDeEnvio) unsubscribeValorDeEnvio(); // Limpia el listener cuando se desm
    }
    
  }, []);

  // eliminar imagen de cloudinary productos ok
  const eliminarImagen = async (carpeta, publicId) => {    
    try {
      const res = await fetch('https://e-shop-server-kappa.vercel.app/api/eliminar-imagen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_id: publicId }),
      });

      const data = await res.json();
      if (data.success) {
        setTextoConfirm(carpeta)
        setIsConfirm(true)
      } else {
        setTextoConfirm('No se pudo borrar')
        setIsConfirm(true)
      }
    } catch (err) {
      setTextoConfirm(`Error en Fetch: ${err.message}`);
      console.log(err)
        setIsConfirm(true)
    }
      
  };

  // Funciones para subir imagen
  const convertirAWebP = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/webp",
          0.8 // calidad
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const subirACloudinary = async (webpBlob, originalName) => {
  const baseName = originalName.split(".").slice(0, -1).join(".");
  const webpFileName = `${baseName}.webp`;

  const formData = new FormData();
  formData.append("file", webpBlob, webpFileName);
  formData.append("upload_preset", "carrito_upload");
  formData.append("folder", "e-shop");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dujru85ae/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (data.secure_url) {
    return { url: data.secure_url, public_id: data.public_id }; // ✅ devolvemos ambos
  } else {
    console.error("Error al subir:", data);
    return null;
  }
};

  // Esta es la función que sube la imagen y luego crea la categoria
const onSubmit = async (data) => {
  const filtro = categorias.some(c => c.categoria[0].toUpperCase() + c.categoria.slice(1) === data.categoria[0].toUpperCase() + data.categoria.slice(1))
  if(filtro){
    setTextoError('Categoria ya creada')
    setIsError(true);
    return;
  }
  
  if (!archivoOriginal) {
    setMensageErrorImagen('Debe seleccionar una imagen')
    return;
  }else{
    setMensageErrorImagen(null)
  }

  try {
    const webpBlob = await convertirAWebP(archivoOriginal);
    const resultado = await subirACloudinary(webpBlob, archivoOriginal.name);

    if (!resultado) {
      setTextoError('Error al subir la imagen')
      setIsError(true);
      return;
    }

    const nuevaCategoria = {
      categoria: data.categoria,
      urlImg: resultado.url,
      public_id: resultado.public_id, // ✅ usamos directamente el valor devuelto
    };

    await crearCategorias(nuevaCategoria);

    reset();
    setAchivoOriginal(null);
    setTextoConfirm('Categoria creada con exito');
    setIsConfirm(true);

  } catch (error) {
    setTextoError('Error al crear la categoria')
    setIsError(true);
  }
};

  const CrearCategorias = () => {
    
    return (
      <div className="container-general">
        <div className='header-general'>
          <h4>Crear Categorias</h4>
      </div>
      <section className='container-crear-categorias'>      
        <form 
          className='form-productos'
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            type="text" 
            placeholder="Nombre de la categoría"
            {...register('categoria', {
              required: {
                value: true,
                message:'Campo Obligatorio'
              }
            })
            }
          />
          { errors.categoria?.message && <p style={{color:'red'}}>{errors.categoria.message}</p> }

          <label>Ingrese una imagen descriptiva</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setAchivoOriginal(e.target.files[0]);
              setMensageErrorImagen(null);
            }}
          />
          {archivoOriginal && (
            <p>Archivo seleccionado: {archivoOriginal.name}</p>
          )}
          {
            mensageErrorImagen && (
              <p style={{color:'red'}}>{mensageErrorImagen}</p>
            )
          }
          <input type="submit" value="CARGAR" />
        </form>
        <ul className='lista-categorias'>
          {categorias.length === 0 ? (
            <li>No hay categorías aún</li>
          ) : (
            categorias.map(c => (
              <li key={c.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px'}}>
                <div style={{display:'flex', alignItems:'center'}}>
                  <img src={c.urlImg} alt={c.categoria} style={{width:'40px', height:'40px', marginRight:'8px', objectFit:'cover', borderRadius:'4px'}}/>
                  <span>{c.categoria}</span>
                </div>
                <div>
                  <button
                    className="btn-categorias"
                    onClick={() => { 
                      setIsEditCategorias((prev) => !prev);
                      setIdCategoria(c.id); 
                      setNombreCategoria(c.categoria)
                    }}
                    title="Editar categoría"
                    style={{marginRight:'4px'}}
                  >
                    {/* ícono editar */}
                    <svg xmlns="http://www.w3.org/2000/svg" 
                      height="24px" 
                      viewBox="0 -960 960 960" 
                      width="24px" 
                      fill="black">
                      <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                    </svg>
                  </button>
                  {/* borrar categoria */}
                  <button
                    className='btn-categorias'
                    onClick={() => {
                      eliminarImagen('Categoria borrada con exito',c.public_id);
                      borrarCategoria('categorias', c.id);
                    }
                    }
                    title="Borrar categoría"
                  >
                    {/* ícono borrar */}
                    <svg xmlns="http://www.w3.org/2000/svg" 
                      height="24px" 
                      viewBox="0 -960 960 960" 
                      width="24px" 
                      fill="black">
                      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                    </svg>
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
        </section>
      </div>
    )
  };

  const ActualizarEmailContraseña = () => {
    const actualizar = async (data) => {
      //console.log(data)
      //console.log('usuario actual ', usuarioActual)
      const resultado = await cambiarContrasena(usuarioActual, data.contraseña, data.contraseñaNueva)
      if(resultado.ok){
        setTextoConfirm('Contraseña Actualizada');
        setIsConfirm(true);
      }else{
        setIsError(true);
        setTextoError('Contraseña Anterior Incorrecta')
        
      }
      //await cambiarCorreo(usuarioActual, data.contraseña, data.correoNuevo)
    }

    return (
      <div className="contenedor-actualizar">        
        <FormAuth 
          titulo={'Cambio de Contraseña'}
          subMitLogin={actualizar}
          actualizar={true}
        />
      </div>
    ) 
  }

  const Login = () => {

    const subMitLogin = async (data) => {
      const result = await loginConMail (data)
      if(!result.ok){
        if(result.error === 'auth/invalid-email'){
          setTextoError('Correo Incorrecto');          
          setIsError(true)
        } else if(result.error === 'auth/invalid-credential'){
          setTextoError('Contraseña Invalida');          
          setIsError(true)
        }
      }
      reset();
    }

    return (
      <div className='container-general'>      
        <FormAuth
          titulo={'Iniciar Sesion'}
          subMitLogin={subMitLogin}
        />
      </div>
    )
  };
 
  const CostoDeEnvio =  () => {
     const cargarEnvio = async (data) => {
      //console.log(data)
      const resultado = await guardarPrecioEnvio(data)
      if(resultado.ok){
        setTextoConfirm('Costo De Envio Cargado');
        setIsConfirm(true);
        reset();
      }else{
        alert('No se cargo el costo de envio');
      }
  }

    return (
      <div className="contenedor-envio">
        <h4>Ingrese el valor del envio</h4>
        <p>Actual: ${valorDeEnvio?.[0]?.envio?.envio}</p>
        <form 
        className="costo-envio-form"
        onSubmit={handleSubmit(cargarEnvio)}>
          <span className="costo-envio-input">$
            <input type="text" 
            {...register('envio', {
            required: {
              value: true,
              message:'Campo obligatorio',
            },
            pattern: {
              value: /^[0-9]+([.][0-9]+)?$/,
              message:'Ingrese solo números'
            }
          })}
          />
          </span>
          { errors.envio?.message && <p style={{color:'red'}}>{errors.envio.message}</p>}
          <button className="btn-envio"type="submit">CARGAR</button>
        </form>
      </div>
    )
  }

  const InitButon = () => {
    return (
      <>
        <h3 style={{display:'flex', justifyContent:'space-around', alignItems:'center',backgroundColor:'black', color: 'white'}}>Menu Principal
          <button
          onClick={() => { setMenu((prev) => !prev)}}
            type="button"
            style={{backgroundColor:'transparent',  rigth:'1rem'}}
          >
            <svg xmlns="http://www.w3.org/2000/svg" 
              height="24px" 
              viewBox="0 -960 960 960"
              width="24px" 
              fill="white">
               <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
            </svg>
          </button>

        </h3>
        
        <div className="contenedor-btn">
          <button 
          style={menu ? styleBlock : styleNone}
          onClick={() => {
            setMenu(false);
            setAdd(false);
            setIsCarrito(false);
            setIsActualizar(false);
            setIsEnvio(false);
            setIsDatosBancarios(false)
            setIsCompartir(false);
            setIsCategorias((prev) => !prev);
             }} 
             title="Crear/editar/borrar Catgorias">
              Categorias
          </button>
          <button 
          style={menu ? styleBlock : styleNone}
          onClick={() => {
            setMenu(false);
            setIsCarrito(false);
            setIsEnvio(false);
            setIsActualizar(false);
            setIsCategorias(false);
            setIsDatosBancarios(false);
            setIsCompartir(false);
            setAdd((prev) => !prev);            
             }} title="Ingresar productos">
              Crear productos
          </button>
          <button 
          title="Lista de Productos"
          style={menu ? styleBlock : styleNone}
          onClick={() => {
            setMenu(false); 
            setIsActualizar(false);
            setIsCategorias(false);
            setAdd(false); 
            setIsEnvio(false);
            setIsDatosBancarios(false);
            setIsCompartir(false);
            setIsCarrito((prev) => !prev)
             }}>
              Lista de productos
          </button>
          <button 
          style={menu ? styleBlock : styleNone}
          onClick={() => {
            setMenu(false); 
            setIsCategorias(false);
            setAdd(false); 
            setIsCarrito(false)
            setIsEnvio(false)
            setIsDatosBancarios(false);
            setIsCompartir(false);
            setIsActualizar((prev) => !prev)
             }}>
              Cambio de contraseña
          </button>
          <button 
          title="Costo de Envio"
          style={menu ? styleBlock : styleNone}
          onClick={() => {
            setMenu(false);
            setIsCategorias(false);
            setAdd(false); 
            setIsCarrito(false);
            setIsActualizar(false);
            setIsDatosBancarios(false);
            setIsCompartir(false);
            setIsEnvio((prev) => !prev) ;
             }}>
              Costo de envio
          </button>
          <button 
          style={menu ? styleBlock : styleNone}
          onClick={() => {
            setMenu(false);
            setAdd(false);
            setIsCarrito(false);
            setIsActualizar(false);
            setIsEnvio(false);
            setIsCategorias(false);
            setIsCompartir(false);
            setIsDatosBancarios((prev) => !prev);
             }} 
             title="Datos Bancarios">
              Datos Bancarios
          </button>
          <button 
          style={menu ? styleBlock : styleNone}
          onClick={() => {
            setMenu(false);
            setAdd(false);
            setIsCarrito(false);
            setIsActualizar(false);
            setIsEnvio(false);
            setIsDatosBancarios(false)
            setIsCategorias(false);
            setIsCompartir((prev) => !prev);
             }} 
             title="Compartir Pagina">
              Compartir
          </button>
          <button 
          style={menu ? styleBlock : styleNone}
          onClick={() => {
            setIsDatosBancarios(false);
            setMenu(false); 
            setIsCategorias(false);
            setAdd(false); 
            setIsCarrito(false);
            setIsActualizar(false);
            setIsEnvio(false);
            setIsCompartir(false);
            setInitBtn((prev) => !prev); 
            setIsLogin((prev) => !prev) 
            cerrarSesion();
             }}>
              Cerrar Sesion
            <img
              src={usuario.photoURL ? usuario.photoURL : '/icons/icon-192x192.png'}
              alt="Imagen de perfil"
              title={usuario.displayName}
              width={30}
              height={30}
              style={{
                borderRadius: '50%',
                marginLeft: '8px',
                verticalAlign: 'middle'
              }}
            />
          </button>
        </div>
        
      </>
    )
  }

  return (
    <div className="container-app">
        <InstallPrompt /> 
      {
        sharedLink && 
        <SharedConfirm />
      }   
      {
        isConfirmBorrado &&
          <ConfirmBorrado 
          isConfirmBorrado={isConfirmBorrado}
          setIsConfirmBorrado={setIsConfirmBorrado}
          borrar={borrar}
          setBorrar={setBorrar}
          />
      }
      { 
        isConfirm && 
          <Confirm 
          setIsConfirm={setIsConfirm}
          textoConfirm={textoConfirm}
          setTextoConfirm={setTextoConfirm}
          />
      }
      
      {
        isError && 
          <Error
          setIsError={setIsError}
          setTextoError={setTextoError}
          textoError={textoError}
          />
      }
      <header>
        { initBtn && <InitButon /> }
      </header>
      <main>
        { isLogin && <Login /> }
        { isEnvio && <CostoDeEnvio /> }
        { isActualizar && <ActualizarEmailContraseña /> }
        {
          isCompartir &&
          <Compartir 
          setSharedLink={setSharedLink}
          setOnQr={setOnQr}
          />
        }
        {
        onQr &&
        <VerQr
        setOnQr={setOnQr}
        onQr={onQr} 
        />
      }
        { isCategorias && 
          <CrearCategorias 
          categorias={categorias}
        />
        }
        {
          isEditCategorias &&
          <EditarCategoria 
            setIsEditCategorias={setIsEditCategorias}
            nombreCategoria={nombreCategoria}
            idCategoria={idCategoria}
            setIsConfirm={setIsConfirm}
            textoConfirm={textoConfirm}
            setTextoConfirm={setTextoConfirm}
            categorias={categorias}
          />
        }
           
        { add && <SubirImagenWebP 
          setInitBtn={setInitBtn}
          setAdd={setAdd}
          categorias={categorias}
          isActivate={isActivate}
          setIsActivate={setIsActivate}
          setIsCategorias={setIsCategorias}
          setIsConfirm={setIsConfirm}
          textoConfirm={textoConfirm}
          setTextoConfirm={setTextoConfirm}
        />
        }
        { isCarrito &&
          <Carrito 
            setInitBtn={setInitBtn}
            setIsCarrito={setIsCarrito}
            user={user}
            categorias={categorias}
            setCategorias={setCategorias}
            setIsEditProducto={setIsEditProducto}
            setProductos={setProductos}
            productos={productos}
            productoEditar={productoEditar}
            setProductoEditar={setProductoEditar}
            eliminarImagen={eliminarImagen}
            setIsActivate={setIsActivate}
            isActivate={isActivate}
            isConfirmBorrado={isConfirmBorrado}
            setIsConfirmBorrado={setIsConfirmBorrado}
            borrar={borrar}
            setBorrar={setBorrar}
          />
        }
        { isEditProducto && 
          <EditarProducto 
            setIsEditProducto={setIsEditProducto}
            productoEditar={productoEditar}
            categorias={categorias}
            eliminarImagen={eliminarImagen}
            setIsConfirm={setIsConfirm}
            setTextoConfirm={setTextoConfirm}
            textoConfirm={textoConfirm}
            setIsError={setIsError}
            setTextoError={setTextoError}
            textoError={textoError}
          />
        }

        {
          isDatosBancarios &&
            <DatosBancarios 
              guardarDatosbancarios={guardarDatosbancarios}
              datosDeBanco={datosDeBanco}
              setIsConfirm={setIsConfirm}
              setTextoConfirm={setTextoConfirm}
              setIsError={setIsError}
              setTextoError={setTextoError}
            />
        }
      </main>      
    </div>
  )
}

export default App;
