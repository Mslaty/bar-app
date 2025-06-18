// Importamos las funciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ¡USA TU PROPIA CONFIGURACIÓN DE FIREBASE!
const firebaseConfig = {
  apiKey: "AIzaSyBCDpQ98kebAy8ByjjmiK9ql3_oo-U1dgE",
  authDomain: "bar-app-mati.firebaseapp.com",
  projectId: "bar-app-mati",
  storageBucket: "bar-app-mati.firebasestorage.app",
  messagingSenderId: "203540017989",
  appId: "1:203540017989:web:a2b35d48ecc8900580c42c"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para obtener el ID del bar desde la URL
function getBarId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Función para cargar los detalles del bar
async function cargarDetallesDelBar() {
    const barId = getBarId();
    if (!barId) {
        document.getElementById('bar-details-content').innerHTML = '<p class="p-4">No se ha especificado un bar.</p>';
        return;
    }

    try {
        // Obtenemos la referencia al documento del bar específico
        const barRef = doc(db, "bars", barId);
        const barSnap = await getDoc(barRef);

if (barSnap.exists()) {
    const barData = barSnap.data();
    
    // Obtenemos el HTML de la vista previa de reseñas
    const reviewsPreviewHtml = await cargarResenas(barId);

    // Creamos el enlace a la página de todas las reseñas
    const allReviewsLink = `<div class="px-4 pt-2"><a href="reviews.html?id=${barId}" class="text-[#e92932] font-semibold">Ver todas las ${barData.reviews || 0} reseñas</a></div>`;

    // Creamos todo el HTML con los datos del bar
    const contentHTML = `
        {/* ... el resto del HTML para la imagen, nombre, descripción, etc. ... */}
        
        <h3 class="text-[#1b0e0e] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Reviews</h3>
        <div class="p-4">${reviewsPreviewHtml}</div>
        ${barData.reviews > 0 ? allReviewsLink : ''} {/* Mostramos el enlace solo si hay reseñas */}
    `;
    
    // Insertamos el HTML en la página
    document.getElementById('bar-details-content').innerHTML = contentHTML;

        } else {
            document.getElementById('bar-details-content').innerHTML = '<p class="p-4">Este bar no existe.</p>';
        }
    } catch (error) {
        console.error("Error al cargar detalles del bar: ", error);
        document.getElementById('bar-details-content').innerHTML = '<p class="p-4">Error al cargar la información.</p>';
    }
}

// Función para cargar las reseñas de un bar específico
async function cargarResenas(barId) {
    let reviewsHTML = '<p>No hay reseñas todavía.</p>';
    try {
        const reviewsRef = collection(db, `bars/${barId}/reviews`);
        const reviewsSnapshot = await getDocs(reviewsRef);
        
        if (!reviewsSnapshot.empty) {
            reviewsHTML = ''; // Limpiamos el mensaje por defecto
            reviewsSnapshot.forEach(doc => {
                const review = doc.data();
                reviewsHTML += `
                    <div class="flex flex-col gap-3 bg-[#fcf8f8] mb-6">
                        <div class="flex items-center gap-3">
                            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style='background-image: url("${review.autorImagenURL || 'https://via.placeholder.com/40'}");'></div>
                            <div class="flex-1">
                                <p class="text-[#1b0e0e] text-base font-medium leading-normal">${review.autorNombre}</p>
                                <p class="text-[#994d51] text-sm font-normal leading-normal">${review.fecha}</p>
                            </div>
                        </div>
                        <p class="text-[#1b0e0e] text-base font-normal leading-normal">${review.texto}</p>
                    </div>
                `;
            });
        }
        return reviewsHTML;
    } catch (error) {
        console.error("Error al cargar reseñas: ", error);
        return '<p>Error al cargar las reseñas.</p>';
    }
}


// Ejecutamos la función principal al cargar la página
cargarDetallesDelBar();