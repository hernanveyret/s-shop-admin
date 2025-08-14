import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { editarCategoria } from '../firebase/auth.js';

const EditarCategoria = ({
  setIsEditCategorias,
  nombreCategoria,
  idCategoria,
  setIsConfirm,
  textoConfirm,
  setTextoConfirm,
  categorias
}) => {

  const [archivoOriginal, setArchivoOriginal] = useState(null);
  const [categoriaElejida, setCategoriaElejida] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  // Obtener la categoría actual al montar
  useEffect(() => {
    if (categorias && idCategoria) {
      const filtro = categorias.find(c => c.id === idCategoria);
      setCategoriaElejida(filtro);
    }
  }, [categorias, idCategoria]);

  const subirACloudinary = async (webpBlob, originalName) => {
    const baseName = originalName.split('.').slice(0, -1).join('.');
    const webpFileName = `${baseName}.webp`;

    const formData = new FormData();
    formData.append('file', webpBlob, webpFileName);
    formData.append('upload_preset', 'carrito_upload');
    formData.append('folder', 'productos');

    const res = await fetch('https://api.cloudinary.com/v1_1/dujru85ae/image/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.secure_url) {
      return {
        url: data.secure_url,
        public_id: data.public_id,
      };
    } else {
      console.error('❌ Error al subir imagen:', data);
      return null;
    }
  };

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
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/webp', 0.8);
      };

      reader.readAsDataURL(file);
    });
  };

  const eliminarImagenAnterior = async () => {
    try {
      const res = await fetch('https://m3p-server.vercel.app/api/eliminar-imagen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: categoriaElejida?.public_id }),
      });

      const data = await res.json();

      if (data.resultado?.result === 'ok') {
        //console.log('✅ Imagen anterior eliminada');
      } else {
        console.warn('⚠️ No se pudo eliminar la imagen anterior:', data);
      }
    } catch (error) {
      console.error('🛑 Error al eliminar imagen anterior:', error);
    }
  };

  const subMit = async (data) => {
    let nuevaUrl = categoriaElejida?.urlImg;
    let nuevoPublicId = categoriaElejida?.public_id;

    if (archivoOriginal) {
      const webpBlob = await convertirAWebP(archivoOriginal);
      const subida = await subirACloudinary(webpBlob, archivoOriginal.name);

      if (subida) {
        await eliminarImagenAnterior();
        nuevaUrl = subida.url;
        nuevoPublicId = subida.public_id;
      }
    }

    const dataActualizada = {
      categoria: data.categoria,
      urlImg: nuevaUrl,
      public_id: nuevoPublicId
    };

    const result = await editarCategoria(idCategoria, dataActualizada);

    if (result.ok) {
      reset();
      setTextoConfirm('Categoría editada con éxito');
      setIsConfirm(true);
      setIsEditCategorias(false);
    } else {
      console.warn('❌ No se pudo editar la categoría');
    }
  };

  return (
    <div className="contenedor-edit-producto">
      <div className="conatiner-edit-categoria">
        <button onClick={() => setIsEditCategorias(false)}>X</button>
        <h3>Editar Categoría</h3>
        <form onSubmit={handleSubmit(subMit)}>
          <input
            type="text"
            id="categorias"
            name="categorias"
            defaultValue={nombreCategoria}
            {...register('categoria', {
              required: { value: true, message: 'Campo obligatorio' }
            })}
          />
          {errors.categoria?.message && <p>{errors.categoria.message}</p>}

          <input
            type="file"
            id="archivo"
            name='archivo'
            accept="image/*"
            onChange={(e) => setArchivoOriginal(e.target.files[0])}
          />

          <input type="submit" value="EDITAR" />
        </form>
      </div>
    </div>
  );
};

export default EditarCategoria;
