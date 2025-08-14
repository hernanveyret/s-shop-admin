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
  } = useForm();

  const [isOfertaEdit, setIsOfertaEdit] = useState(productoEditar.oferta);
  const [archivoOriginal, setArchivoOriginal] = useState(null);

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

  const subirACloudinary = async (webpBlob, originalName) => {
    const baseName = originalName.split('.').slice(0, -1).join('.');
    const webpFileName = `${baseName}.webp`;

    
    const formData = new FormData();
    formData.append('file', webpBlob, webpFileName);
    formData.append('upload_preset', 'carrito_upload');
    formData.append('folder', 'productos');

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
    const res = await fetch('https://m3p-server.vercel.app/api/eliminar-imagen', {
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
