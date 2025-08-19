import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { editarProducto } from '../firebase/auth.js';
import './edit-producto.css';

const EditarProducto = ({ setIsEditProducto, 
                          productoEditar, 
                          categorias,
                          setIsConfirm,
                          setTextoConfirm,
                          textoConfirm,
                          setIsError,
                          setTextoError,
                          textoError
                        }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue
  } = useForm();

  const [isOfertaEdit, setIsOfertaEdit] = useState(productoEditar.oferta);
  const [archivoOriginal, setArchivoOriginal] = useState(null);
  const [ isTallesNumericos, setIsTallesNumericos ] = useState(false);
  const [ isTallesLetras, setIsTallesLetras ] = useState(false);
  const [ isColor, setIsColor ] = useState(false);
  const [ isMarca, setIsMarca ] = useState(false);
  const [ tallesLetras, setTallesLetras ] = useState([]);

  const convertirAWebP = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      const img = new Image();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/webp',
          0.8
        );
      };

      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    console.log(productoEditar)
  },[productoEditar])

  const subirACloudinary = async (webpBlob, originalName) => {
    const baseName = originalName.split('.').slice(0, -1).join('.');
    const webpFileName = `${baseName}.webp`;
    
    const formData = new FormData();
    formData.append('file', webpBlob, webpFileName);
    formData.append('upload_preset', 'carrito_upload');
    formData.append('folder', 'e-shop');

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/dujru85ae/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await res.json();

    if (data.secure_url) {
      return {
        url: data.secure_url,
        public_id: data.public_id,
      };
    } else {
      console.error('Error al subir imagen:', data);
      return null;
    }
  };
const eliminarImagenAnterior = async () => {
  try {
    const res = await fetch('https://e-shop-server-kappa.vercel.app/api/eliminar-imagen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_id: productoEditar.public_id }),
    });

    const data = await res.json();

    if (data.resultado?.result !== 'ok') {
      console.warn('❌ No se pudo eliminar imagen anterior:', data);
    } else {
      //console.log('✅ Imagen anterior eliminada con éxito');
    }
  } catch (error) {
    console.error('🛑 Error al eliminar imagen anterior:', error);
  }
};

  const cargarTallesLetras = () => {
    setTallesLetras([...tallesLetras, watch('talleLetra')]);
    setValue('talleLetra', '');
  }

  useEffect(() => {
    console.log(tallesLetras)
  },[tallesLetras])

  const onSubmit = async (data) => {
    let nuevaUrl = productoEditar.urlImg;
    let nuevoPublicId = productoEditar.public_id;

    if (archivoOriginal) {
      const webpBlob = await convertirAWebP(archivoOriginal);
      const subida = await subirACloudinary(webpBlob, archivoOriginal.name);
      if (subida) {
        await eliminarImagenAnterior();
        nuevaUrl = subida.url;
        nuevoPublicId = subida.public_id;
      }
    }

    const productoActualizado = {
      activate: productoEditar.activate,
      titulo: data.titulo || productoEditar.titulo,
      descripcion: data.descripcion || productoEditar.descripcion,
      precio: Number(data.precio) || Number(productoEditar.precio),
      precioUnitario: Number(data.precio) || Number(productoEditar.precio),
      oferta: isOfertaEdit,
      porcentajeOff: isOfertaEdit ? Number(data.porcentaje) : 0,
      urlImg: nuevaUrl ? nuevaUrl : productoEditar.urlImg,
      public_id: nuevoPublicId ? nuevoPublicId : productoEditar.public_id,
      categoria: data.categoria || productoEditar.categoria,
      tallesLetras: tallesLetras.length > 0 ? tallesLetras : productoEditar.tallesLetras,
      color: watch('color') ? watch('color') : productoEditar.color,
      tallesNumericosDesde: watch('talleDesde') ? watch('talleDesde') : productoEditar.tallesNumericosDesde,
      tallesNumericosHasta: watch('talleHasta') ? watch('talleHasta') : productoEditar.tallesNumericosHasta, 
      marca: watch('marca') ? watch('marca') : productoEditar.marca
    };

    const result = await editarProducto(productoEditar.id, productoActualizado);
    if(result.ok){
      setTextoConfirm('Producto actualizado con exito');
      setIsConfirm(true)
      reset();
      setIsEditProducto(false);
    }else{
      setTextoError('Error al actualizar el producto');
      setIsError(true);
    }
  };

  return (
    <div className="contenedor-edit-producto">
      <form 
      className="edit-producto-form"
      onSubmit={handleSubmit(onSubmit)}>
        <button
          type="button"
          className="btn"
          onClick={() => setIsEditProducto(false)}
        >
          X
        </button>

        <select
          defaultValue={productoEditar.categoria}
          {...register('categoria', {
            required: { value: true, message: 'Campo obligatorio' },
          })}
        >
          {categorias &&
            categorias.map((cat) => (
              <option key={cat.id} value={cat.categoria}>
                {cat.categoria}
              </option>
            ))}
        </select>

        <input
          type="text"
          id="titulo"
          name="titulo"
          defaultValue={productoEditar.titulo}
          {...register('titulo', {
            required: { value: true, message: 'Campo obligatorio' },
          })}
        />
        {errors.titulo && <p>{errors.titulo.message}</p>}

        <input
          type="text"
          id="descripcion"
          name="descripcion"
          defaultValue={productoEditar.descripcion}
          {...register('descripcion', {
            required: { value: true, message: 'Campo obligatorio' },
          })}
        />
        {errors.descripcion && <p>{errors.descripcion.message}</p>}

        <label>
          $
          <input
            type="text"
            id="precio"
            name="precio"
            defaultValue={productoEditar.precio}
            {...register('precio', {
              required: { value: true, message: 'Campo obligatorio' },
              pattern: {
                value: /^[0-9]+([.][0-9]+)?$/,
                message: 'Ingrese solo números',
              },
            })}
          />
        </label>
        {errors.precio && <p>{errors.precio.message}</p>}

        <label>
          Marca
          <input type="checkbox" checked={productoEditar.marca ? true : false } onChange={(e) => { setIsMarca((prev) => !prev)}}/>
        </label>
        {
          isMarca || productoEditar.marca ?
            <label className="lebel-talles-letras">
          <div className="contenedor-input-talles">
        <input type="text" placeholder="Marca" 
          defaultValue={productoEditar.marca}
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
        :
        ''
        }

        <label>
          Color
          <input type="checkbox" checked={productoEditar.color ? true : false } onChange={(e) => { setIsColor((prev) => !prev)}}/>
        </label>
        {
           isColor || productoEditar.color ?
        <label className="lebel-talles-letras">
          <div className="contenedor-input-talles">
        <input type="text" placeholder="Color" 
        defaultValue={productoEditar.color ? productoEditar.color : 'Color'}
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
        :
        ''
        }

         <label>
          Talles
          <input type="checkbox" checked={productoEditar.tallesLetras.length > 0 ? true : false }onChange={(e) => { setIsTallesLetras((prev) => !prev)}}/>
        </label>
        { 
        isTallesLetras || productoEditar.tallesLetras.length > 0 ? 
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
            productoEditar.tallesLetras.length > 0 && 
              productoEditar.tallesLetras.map((talle, i) => (
                <button type="button" key={i}>{talle}</button>
              ))
          }
        </div>
        </label>
        :
        ''       
        }
        <label>
          Talles Numéricos
          <input type="checkbox" checked={productoEditar.tallesNumericosDesde ? true : false} onChange={(e) => { setIsTallesNumericos((prev) => !prev)}}/>
        </label>
        { isTallesNumericos || productoEditar.tallesNumericosDesde && 
        <label>
        <input type="text" placeholder="Desde" 
        defaultValue={productoEditar.tallesNumericosDesde}
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
         defaultValue={productoEditar.tallesNumericosHasta}
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
          <input
            type="checkbox"
            id="check"
            name="check"
            checked={isOfertaEdit}
            onChange={() => setIsOfertaEdit((prev) => !prev)}
          />
        </label>

        {isOfertaEdit && (
          <label> %
            <input
              type="text"
              id="porcentaje"
              name="porcentaje"
              defaultValue={productoEditar.porcentajeOff}
              {...register('porcentaje', {
                required: { value: true, message: 'Campo obligatorio' },
                pattern: {
                  value: /^[0-9]+([.][0-9]+)?$/,
                  message: 'Ingrese solo números',
                },
              })}
            />
            {errors.porcentaje && <p>{errors.porcentaje.message}</p>}
          </label>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setArchivoOriginal(e.target.files[0])}
        />

        <input type="submit" value="Guardar" />
      </form>
    </div>
  );
};

export default EditarProducto;
