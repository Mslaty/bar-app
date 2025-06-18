// Paso 1: Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Paso 2: Configuración de Firebase
// PEGA AQUÍ EL OBJETO firebaseConfig QUE COPIASTE DE TU PROYECTO
const firebaseConfig = {
  apiKey: "AIzaSyBCDpQ98kebAy8ByjjmiK9ql3_oo-U1dgE",
  authDomain: "bar-app-mati.firebaseapp.com",
  projectId: "bar-app-mati",
  storageBucket: "bar-app-mati.firebasestorage.app",
  messagingSenderId: "203540017989",
  appId: "1:203540017989:web:a2b35d48ecc8900580c42c"
};

// Paso 3: Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Paso 4: Función para cargar y mostrar los bares
async function cargarBares() {
  // Seleccionamos los contenedores del HTML
  const featuredContainer = document.getElementById('featured-bars-container');
  const nearbyContainer = document.getElementById('nearby-bars-container');

  // Limpiamos los contenedores por si acaso
  featuredContainer.innerHTML = 'Cargando bares...';
  nearbyContainer.innerHTML = '';

  try {
    // Obtenemos los documentos de la colección "bars"
    const querySnapshot = await getDocs(collection(db, "bars"));
    
    let featuredHTML = '';
    let nearbyHTML = '';

    querySnapshot.forEach((doc) => {
      // Por cada bar en la base de datos, obtenemos sus datos
      const bar = doc.data();

      // Creamos la tarjeta HTML para un bar destacado
      if (bar.tipo === 'destacado') {
        featuredHTML += `
          <div class="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
            <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col" style='background-image: url("${bar.imagenURL}");'></div>
            <div>
              <p class="text-[#1b0e0e] text-base font-medium leading-normal">${bar.nombre}</p>
              <p class="text-[#994d51] text-sm font-normal leading-normal">${bar.rating} · ${bar.reviews} reviews</p>
            </div>
          </div>
        `;
      }

      // Creamos la tarjeta HTML para un bar cercano
      // (Podrías tener otro "tipo" o simplemente mostrarlos todos)
      nearbyHTML += `
        <div class="flex items-stretch justify-between gap-4 rounded-lg">
          <div class="flex flex-col gap-1 flex-[2_2_0px]">
            <p class="text-[#994d51] text-sm font-normal leading-normal">${bar.horario}</p>
            <p class="text-[#1b0e0e] text-base font-bold leading-tight">${bar.nombre}</p>
            <p class="text-[#994d51] text-sm font-normal leading-normal">${bar.rating} · ${bar.reviews} reviews · ${bar.distancia} mi</p>
          </div>
          <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1" style='background-image: url("${bar.imagenURL}");'></div>
        </div>
      `;

    });

    // Insertamos el HTML generado en los contenedores
    featuredContainer.innerHTML = featuredHTML;
    nearbyContainer.innerHTML = nearbyHTML;

  } catch (error) {
    console.error("Error al cargar los bares: ", error);
    featuredContainer.innerHTML = 'Error al cargar los bares.';
    nearbyContainer.innerHTML = '';
  }
}

// Paso 5: Llamar a la función cuando la página se cargue
cargarBares();