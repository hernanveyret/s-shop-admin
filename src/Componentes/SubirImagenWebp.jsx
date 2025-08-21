import { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { guardarProducto } from "../firebase/auth.js";

function SubirImagenWebP({setAdd,
                         setInitBtn, 
                         categorias, 
                         isActivate, 
                         setIsCategorias, 
                         setIsActivate,
                         setIsConfirm,
                         textoConfirm,
                         setTextoConfirm
                        }) {
  const [ url, setUrl] = useState(null);
  const [ nuevoProducto, setNuevoProducto ] = useState();
  const [ archivoOriginal, setAchivoOriginal ] = useState(null)
  const [ isOferta, setIsOferta ] = useState(false);
  const [ isTallesNumericos, setIsTallesNumericos ] = useState(false);
  const [ isTallesLetras, setIsTallesLetras ] = useState(false);
  const [ isColor, setIsColor ] = useState(false);
  const [ isMarca, setIsMarca ] = useState(false);
  const [ tallesLetras, setTallesLetras ] = useState([]);
  const [ publicId, setIsPublicId ] = useState(null);
  const [ mensageErrorImagen, setMensageErrorImagen ] = useState(null)
  

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue
  } = useForm();

  const handleChange = async (e) => {        
    if (!archivoOriginal) return;
    //console.log('cargando el archivo: ', archivoOriginal)
    const webpBlob = await convertirAWebP(archivoOriginal);
    const urlWebP = await subirACloudinary(webpBlob, archivoOriginal.name);
    setUrl(urlWebP);    
  };

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
    // Reemplazar la extensión por .webp
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
      setIsPublicId(data.public_id)
      return data.secure_url;
    } else {
      console.error("Error al subir:", data);
      return null;
    }
  };

useEffect(() => {
  if (url && publicId) {
    const productoNuevo = {
      titulo: watch('titulo'),
      descripcion: watch('descripcion'),
      precio: Number(watch('precio')),
      precioUnitario: Number(watch('precio')),
      oferta: isOferta,
      porcentajeOff: isOferta ? Number(watch('porcentaje')): null,
      urlImg: url,
      categoria: watch('categoria'),
      public_id: publicId,
      favorito: false,
      activate: isActivate,
      tallesNumericosDesde: isTallesNumericos ? Number(watch('talleDesde')): '',
      tallesNumericosHasta: isTallesNumericos ? Number(watch('talleHasta')): '',
      tallesLetras: tallesLetras ? tallesLetras : '',
      color: watch('color') ? watch('color') : '',
      marca: watch('marca') ? watch('marca') : ''
    };
    guardarProducto(productoNuevo);
    reset();
    setTextoConfirm('Nuevo producto creado')
    setIsConfirm(true);
    setIsOferta(false);
    setIsTallesNumericos(false);
    setIsTallesLetras(false);
    setIsColor(false);
    setIsMarca(false);
  }
}, [url, publicId]);

  const cargarTallesLetras = () => {
    setTallesLetras([...tallesLetras, watch('talleLetra')]);
    setValue('talleLetra', '');
  }

  const onSubmit = async (data) => {
  if (!archivoOriginal) {
    setMensageErrorImagen('Debe seleccionar una imagen')
    return;
  }
  //console.log("Datos del producto:", data); // data trae lo que esta en el input
  await handleChange(); // subir imagen
  // Aquí podrías guardar también el producto con la imagen subida

};

  return (
    <div className="container-general">
      <div className="header-general">
        <h4>Crear Productos</h4>
      </div>
      <form className="form-productos" onSubmit={handleSubmit(onSubmit)}>
        <select 
          id="selectCategoria"
          {...register('categoria', {
            required: {
              value: true,
              message:'Campo Obligatorio'
            }
          })}
          >            
          <option value="">Seleccione una categoria</option>
          { categorias && 
            categorias.map(c => (
              <option key={c.id} value={c.categoria}>{c.categoria}</option>
            ))
          }
        </select>
        { errors.categoria?.message && <p style={{color:'red'}}>{errors.categoria.message}</p>}
        <input type="text" placeholder="Ingrese titulo del producto" 
          {...register('titulo', {
            required: {
              value: true,
              message:'Campo obligatorio'
            }
          })}
        />
        { errors.titulo?.message && <p style={{color:'red'}}>{errors.titulo.message}</p>}

        <input type="text" placeholder="Ingrese una descripcion" 
          {...register('descripcion', {
            required:{
              value: true,
              message:'Campo obligatorio'
            }
          })}
        />
        { errors.descripcion?.message && <p style={{color:'red'}}>{errors.descripcion.message}</p>}

        <label>$<input type="text" placeholder="precio"
          {...register('precio', {
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
        </label>
          { errors.precio?.message && <p style={{color:'red'}}>{errors.precio.message}</p>}

        <label>
          Marca
          <input type="checkbox" onChange={(e) => { setIsMarca((prev) => !prev)}}/>
        </label>
        {
          isMarca &&
            <label className="lebel-talles-letras">
          <div className="contenedor-input-talles">
        <input type="text" placeholder="Marca" 
          className='input-talles-color'
          {...register('marca', {
            required:{
              value: false,
              message:'Campo obligatorio'
            },
            pattern: {
              value: /^[A-Za-z/*\-+_.\\]+$/, 
              message:'Ingrese solo Letras'
            }
          })}
        />
        </div>
        </label>
        }

        <label>
          Color
          <input type="checkbox" onChange={(e) => { setIsColor((prev) => !prev)}}/>
        </label>
        {
          isColor &&
        <label className="lebel-talles-letras">
          <div className="contenedor-input-talles">
        <input type="text" placeholder="Color" 
          className='input-talles-color'
          {...register('color', {
            required:{
              value: false,
              message:'Campo obligatorio'
            },
            pattern: {
              value: /^[A-Za-z/*\-+_.\\]+$/, 
              message:'Ingrese solo Letras'
            }
          })}
        />
        </div>
        </label>
        }

          <label>
          Talles
          <input type="checkbox" onChange={(e) => { setIsTallesLetras((prev) => !prev)}}/>
        </label>
        { isTallesLetras && 
        <label className="lebel-talles-letras">
          <div className="contenedor-input-talles">
        <input type="text" placeholder="Talle" 
          className='input-talles-letras'
          {...register('talleLetra', {
            required:{
              value: false,
              message:'Campo obligatorio'
            },
            pattern: {
              value: /^[A-Za-z]+$/,
              message:'Ingrese solo Letras'
            }
          })}
        />
        <button
          className="btn-cargar"
          type="button"
          onClick={() => { cargarTallesLetras()}}
        >Cargar</button>
        </div>
        <div className="contenedor-lista-talles">
          {
            tallesLetras && 
              tallesLetras.map((talle, i) => (
                <button type="button" key={i}>{talle}</button>
              ))
          }
        </div>
        </label>          
        }

        <label>
          Talles Numéricos
          <input type="checkbox" onChange={(e) => { setIsTallesNumericos((prev) => !prev)}}/>
        </label>
        { isTallesNumericos && 
        <label>
        <input type="text" placeholder="Desde" 
          {...register('talleDesde', {
            required:{
              value: true,
              message:'Campo obligatorio'
            },
            pattern: {
              value: /^[0-9]+([.][0-9]+)?$/,
              message:'Ingrese solo numeros'
            }
          })}
        />
         <input type="text" placeholder="Hasta" 
          {...register('talleHasta', {
            required:{
              value: true,
              message:'Campo obligatorio'
            },
            pattern: {
              value: /^[0-9]+([.][0-9]+)?$/,
              message:'Ingrese solo numeros'
            }
          })}
        />
        </label>  
        }

        <label>
          Oferta
          <input type="checkbox" onChange={(e) => { setIsOferta((prev) => !prev)}}/>
        </label>
        { isOferta && 
        <label> %
        <input type="text" placeholder="Ingrese porsetaje" 
          {...register('porcentaje', {
            required:{
              value: true,
              message:'Campo obligatorio'
            },
            pattern: {
              value: /^[0-9]+([.][0-9]+)?$/,
              message:'Ingrese solo numeros'
            }
          })}
        />
        </label>  
        }
      
      <label>Ingrese una imagen del producto</label>
      <input type="file" accept="image/*" 
        onChange={(e) => { 
          setAchivoOriginal(e.target.files[0]);
          setMensageErrorImagen(null);
        }} 
      />
      {
        mensageErrorImagen && 
          <p style={{color:'red'}}>Debe seleccionar una imagen</p>
      }
      <label>Activar el producto<input type="checkbox" checked={isActivate} onChange={(e) => { setIsActivate((prev) => !prev)}}/></label>
      <input type="submit" />
      </form>
    </div>
  );
}

export default SubirImagenWebP;