// =================================================================
//                 SCRIPT COMPLETO: details.js
// =================================================================

// Importamos todas las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// -----------------------------------------------------------------
//               Paso 1: Configuración de Firebase
// -----------------------------------------------------------------
// ¡¡MUY IMPORTANTE!! Reemplaza este objeto con la configuración
// de tu propio proyecto de Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyBCDpQ98kebAy8ByjjmiK9ql3_oo-U1dgE",
  authDomain: "bar-app-mati.firebaseapp.com",
  projectId: "bar-app-mati",
  storageBucket: "bar-app-mati.firebasestorage.app",
  messagingSenderId: "203540017989",
  appId: "1:203540017989:web:a2b35d48ecc8900580c42c"
};

// Inicializamos los servicios de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// -----------------------------------------------------------------
//        Paso 2: Funciones para Cargar y Mostrar Datos
// -----------------------------------------------------------------

/**
 * Obtiene el ID del bar de los parámetros de la URL.
 * @returns {string|null} El ID del bar o null si no se encuentra.
 */
function getBarId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

/**
 * Renderiza las estrellas de puntuación en formato SVG.
 * @param {number} rating - La puntuación (ej: 4.5).
 * @param {number} size - El tamaño en píxeles de cada estrella.
 * @returns {string} El HTML de las estrellas.
 */
function renderStars(rating, size) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const weight = i <= rating ? 'fill' : 'regular';
        const color = i <= rating ? 'text-[#e92932]' : 'text-[#d6aeb0]';
        starsHTML += `
            <div class="${color}" data-icon="Star" data-size="${size}px" data-weight="${weight}">
                <svg xmlns="http://www.w3.org/2000/svg" width="${size}px" height="${size}px" fill="currentColor" viewBox="0 0 256 256"><path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path></svg>
            </div>`;
    }
    return starsHTML;
}

/**
 * Carga una vista previa de las reseñas de un bar.
 * @param {string} barId - El ID del bar del que cargar las reseñas.
 * @returns {Promise<string>} El HTML de la vista previa de las reseñas.
 */
async function cargarResenasPreview(barId) {
    let reviewsHTML = '<p>No hay reseñas todavía.</p>';
    try {
        // Creamos una consulta para obtener las 2 últimas reseñas por fecha
        const reviewsQuery = query(
            collection(db, `bars/${barId}/reviews`), 
            orderBy('fecha', 'desc'), 
            limit(2)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        
        if (!reviewsSnapshot.empty) {
            reviewsHTML = ''; // Limpiamos el mensaje por defecto
            reviewsSnapshot.forEach(doc => {
                const review = doc.data();
                reviewsHTML += `
                    <div class="flex flex-col gap-3 bg-[#fcf8f8] mb-6 border-b border-gray-200 pb-4">
                        <div class="flex items-center gap-3">
                            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style='background-image: url("${review.autorImagenURL || 'https://via.placeholder.com/40'}");'></div>
                            <div class="flex-1">
                                <p class="text-[#1b0e0e] text-base font-medium">${review.autorNombre}</p>
                                <p class="text-[#994d51] text-sm font-normal">${new Date(review.fecha.seconds * 1000).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div class="flex gap-0.5">${renderStars(review.puntuacion, 20)}</div>
                        <p class="text-[#1b0e0e] text-base font-normal line-clamp-3">${review.texto}</p>
                    </div>
                `;
            });
        }
        return reviewsHTML;
    } catch (error) {
        console.error("Error al cargar la vista previa de reseñas: ", error);
        return '<p>Error al cargar las reseñas.</p>';
    }
}


/**
 * Función principal que carga todos los detalles del bar y los muestra en la página.
 */
async function cargarDetallesDelBar() {
    const contentContainer = document.getElementById('bar-details-content');
    const barId = getBarId();

    if (!barId) {
        contentContainer.innerHTML = '<p class="p-4 text-red-600">Error: No se ha especificado un bar.</p>';
        return;
    }

    try {
        // Obtenemos la referencia al documento del bar específico
        const barRef = doc(db, "bars", barId);
        const barSnap = await getDoc(barRef);

        if (barSnap.exists()) {
            const barData = barSnap.data();
            
            // Cargamos el HTML de la vista previa de reseñas
            const reviewsPreviewHtml = await cargarResenasPreview(barId);

            // Creamos el enlace a la página de todas las reseñas
            const allReviewsLink = `<div class="px-4 pt-2"><a href="reviews.html?id=${barId}" class="text-[#e92932] font-bold hover:underline">Ver todas las ${barData.reviews || 0} reseñas</a></div>`;
            
            // Creamos todo el HTML del contenido de la página
            const contentHTML = `
                <div class="@container">
                    <div class="@[480px]:px-4 @[480px]:py-3">
                        <div class="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#fcf8f8] @[480px]:rounded-lg min-h-[218px]" style='background-image: url("${barData.imagenURL}");'></div>
                    </div>
                </div>
                <h1 class="text-[#1b0e0e] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">${barData.nombre}</h1>
                <p class="text-[#1b0e0e] text-base font-normal leading-normal pb-3 pt-1 px-4">${barData.descripcion || 'No hay descripción disponible.'}</p>
                
                <h3 class="text-[#1b0e0e] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Location</h3>
                <div class="flex px-4 py-3">
                    <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg object-cover" style='background-image: url("https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(barData.direccion)}&zoom=16&size=600x300&maptype=roadmap&markers=color:red%7C${encodeURIComponent(barData.direccion)}&key=TU_Maps_API_KEY");'></div>
                </div>
                
                <h3 class="text-[#1b0e0e] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Reviews</h3>
                <div class="p-4">${reviewsPreviewHtml}</div>
                ${barData.reviews > 0 ? allReviewsLink : ''}
            `;
            
            // Insertamos el HTML generado en la página
            contentContainer.innerHTML = contentHTML;

        } else {
            contentContainer.innerHTML = '<p class="p-4 text-red-600">Error: Este bar no existe.</p>';
        }
    } catch (error) {
        console.error("Error al cargar detalles del bar: ", error);
        contentContainer.innerHTML = '<p class="p-4 text-red-600">Error al cargar la información. Revisa la consola para más detalles.</p>';
    }
}

// -----------------------------------------------------------------
//               Paso 3: Ejecutar la Carga de la Página
// -----------------------------------------------------------------

cargarDetallesDelBar();