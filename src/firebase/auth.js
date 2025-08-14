import { GoogleAuthProvider,
         onAuthStateChanged,
         signInWithPopup,
         signOut,
         signInWithEmailAndPassword,
         createUserWithEmailAndPassword } from "firebase/auth";

import { collection,
         onSnapshot, 
         addDoc,
         deleteDoc,
         doc, 
         setDoc,
         updateDoc, 
         getDocs,
         arrayUnion, 
         arrayRemove,
        } from "firebase/firestore";

import { 
        updatePassword, 
        EmailAuthProvider, 
        reauthenticateWithCredential 
        } from "firebase/auth";

import { 
        updateEmail, 
       
        
      } from "firebase/auth";

import { auth, db } from "./config.js";

const provider = new GoogleAuthProvider();

// Login con google
export const loginWhihtGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('Logeado usuario: ', user);
    return user;
  } catch (error) {
    console.log('Error al iniciar sesion: ', error);
  }
}

// Login con mail y contraseña
export const loginConMail = async(dataUser) => {
  try {
    const userLogin = await signInWithEmailAndPassword(auth,dataUser.correo, dataUser.contraseña);
    return userLogin.user
  } catch (error) {
    //console.log(error.code)
    return { ok: false, error: error.code }  
}
}
// Cerrar sesion
export const cerrarSesion = async () => {
  signOut(auth).then(() => {
    //console.log('Sesion finalizada')
  })
}

// Crear cuenta de correo
export const crearCuentaEmail = async (datosUser) => {
  try {
    const result = await createUserWithEmailAndPassword(auth,datosUser.correo,datosUser.contraseña);
    const user = result.user;
    return user;
  } catch (error) {
    console.log('No se pudo cargar el nuevo usuario: ', error);
  }
}

//Escuchar en tiempo real y ver las categorias
export const getDataCategorias = (callback) => {
  try {
    const unsubscribe = onSnapshot(collection(db,'categorias'), snapshot => {
      const usuarios = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
    callback(usuarios);
    //console.log(usuarios)
  })
  return unsubscribe;
  } catch (error) {
    callback([]);
  }
};

// Escuchar cambios en tiempo real y descargarlos
export const getData = (callback) => {
  try {
    const unsubscribe = onSnapshot(collection(db,'productos'), snapshot => {
      const usuarios = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
    callback(usuarios);
  })
  return unsubscribe;
  } catch (error) {
    callback([]);
  }
};

// Escuchar cambios en tiempo real y descargarlos datos bancarios
export const getDataDatosBancarios = (callback) => {
  try {
    const unsubscribe = onSnapshot(collection(db,'datosBancarios'), snapshot => {
      const usuarios = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
    callback(usuarios);
  })
  return unsubscribe;
  } catch (error) {
    callback([]);
  }
};

export const crearCategorias = async (producto) => {
  const categorias = {
    categoria: producto.categoria,
    urlImg: producto.urlImg,
    public_id: producto.public_id
  }
  try {
    const docRef = await addDoc(collection(db, 'categorias'), {
      ...categorias
    
    });
  } catch (error) {
    console.error("⛔ Error al guardar producto:", error);
  }
};

export const guardarProducto = async (producto) => {
  try {
    const docRef = await addDoc(collection(db, 'productos'), {
      ...producto      
    });
  } catch (error) {
    console.error("⛔ Error al guardar producto:", error);
  }
};
// Borra la categoria o el prodructo seleccionada/o por ID
export const borrarCategoria = async (nombreColeccion,id) => {
  try {
    const docRef = doc(db,nombreColeccion, id);
    await deleteDoc(docRef);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export const editarProducto = async (idProducto, update) => {
  try {
    const docRef = doc(db,"productos", idProducto);
    const result = await setDoc(docRef, update);
    return { ok: true }
  } catch (error) {
    return { ok: false, message: 'Error al editar el producto'}
  }
}

export const editarCategoria = async (idCategoria, dataActualizada) => {  
  try {
    const docRef = doc(db, 'categorias', idCategoria);
    await updateDoc(docRef, dataActualizada);
    return { ok: true };    
  } catch (error) {
    console.error('Error al editar la categoría:', error);
    return { ok: false, message: 'Error al editar la categoría' };
  }
};

export const editActivate = async (idproducto, update) => {
  try {
    const docRef = doc(db, 'productos', idproducto);
    await setDoc(docRef, {activate: update}, { merge: true }); // al poner merge true solo actualiza activate
  } catch (error) {
    console.log('Error al actualizar Activate:', error)
  }
}
 
export const guardarPrecioEnvio = async (costo) => {
  const envio = {
    envio: costo,
  };

  try {
    // Documento con ID fijo "precio"
    const envioRef = doc(db, 'envio', 'precio');
    // Crea o actualiza ese documento
    const resultado = await setDoc(envioRef, envio);
    return { ok: true }
  } catch (error) {
    console.error("⛔ Error al guardar el precio de envío:", error);
    return { ok: false, error: error }
  }
};

export const guardarDatosbancarios = async (datos) => {
  try {
    const bancoRef = doc(db,'datosBancarios', 'banco');
    await setDoc(bancoRef, datos);
    return { ok: true }
  } catch (error) {
    console.log('No se pudieron guardar los datos bancarios: ', error)
    return { ok: false, error: error }
  }
}

// cambiar contraseña
export const cambiarContrasena = async (user, contraseñaActual, nuevaContrasena) => {

  try {
    // Reautenticar al usuario con la contraseña actual
    const credencial = EmailAuthProvider.credential(user.email, contraseñaActual);
    await reauthenticateWithCredential(user, credencial);

    // Actualizar la contraseña
    const resultado = await updatePassword(user, nuevaContrasena);
    return { ok: true }
  } catch (error) {
    console.log(error.code)
    return { ok: false, error: error }
  }
};

// Escucha si hay un usuario autenticado

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✅ UID del admin:", user.uid);
  } else {
    console.log("⛔ No hay usuario logueado");
  }
});