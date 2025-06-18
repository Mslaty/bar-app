// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuración de Firebase
// ¡USA TU PROPIA CONFIGURACIÓN AQUÍ!
const firebaseConfig = {
  apiKey: "AIzaSyBCDpQ98kebAy8ByjjmiK9ql3_oo-U1dgE",
  authDomain: "bar-app-mati.firebaseapp.com",
  projectId: "bar-app-mati",
  storageBucket: "bar-app-mati.firebasestorage.app",
  messagingSenderId: "203540017989",
  appId: "1:203540017989:web:a2b35d48ecc8900580c42c"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para cargar y mostrar los bares
async function cargarBares() {
  const featuredContainer = document.getElementById('featured-bars-container');
  const nearbyContainer = document.getElementById('nearby-bars-container');

  featuredContainer.innerHTML = 'Cargando bares...';
  nearbyContainer.innerHTML = '';

  try {
    const querySnapshot = await getDocs(collection(db, "bars"));
    
    let featuredHTML = '';
    let nearbyHTML = '';

    querySnapshot.forEach((doc) => {
      const bar = doc.data();
      const barId = doc.id; // Obtenemos el ID único del documento

      // ---- INICIO DE LA MODIFICACIÓN ----

      // Envolvemos toda la tarjeta en una etiqueta <a>
      // que redirige a details.html pasando el ID del bar como parámetro en la URL
      const link = `details.html?id=${barId}`;

      if (bar.tipo === 'destacado') {
        featuredHTML += `
          <a href="${link}" class="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 no-underline">
            <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col" style='background-image: url("${bar.imagenURL}");'></div>
            <div>
              <p class="text-[#1b0e0e] text-base font-medium leading-normal">${bar.nombre}</p>
              <p class="text-[#994d51] text-sm font-normal leading-normal">${bar.rating} · ${bar.reviews} reviews</p>
            </div>
          </a>
        `;
      }
      
      nearbyHTML += `
        <a href="${link}" class="flex items-stretch justify-between gap-4 rounded-lg no-underline">
          <div class="flex flex-col gap-1 flex-[2_2_0px]">
            <p class="text-[#994d51] text-sm font-normal leading-normal">${bar.horario}</p>
            <p class="text-[#1b0e0e] text-base font-bold leading-tight">${bar.nombre}</p>
            <p class="text-[#994d51] text-sm font-normal leading-normal">${bar.rating} · ${bar.reviews} reviews · ${bar.distancia} mi</p>
          </div>
          <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1" style='background-image: url("${bar.imagenURL}");'></div>
        </a>
      `;
      // ---- FIN DE LA MODIFICACIÓN ----
    });

    featuredContainer.innerHTML = featuredHTML;
    nearbyContainer.innerHTML = nearbyHTML;

  } catch (error) {
    console.error("Error al cargar los bares: ", error);
    featuredContainer.innerHTML = 'Error al cargar los bares.';
    nearbyContainer.innerHTML = '';
  }
}

cargarBares();