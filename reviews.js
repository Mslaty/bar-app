import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCDpQ98kebAy8ByjjmiK9ql3_oo-U1dgE",
  authDomain: "bar-app-mati.firebaseapp.com",
  projectId: "bar-app-mati",
  storageBucket: "bar-app-mati.firebasestorage.app",
  messagingSenderId: "203540017989",
  appId: "1:203540017989:web:a2b35d48ecc8900580c42c"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Funciones Principales ---

function getBarId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadPage() {
    const barId = getBarId();
    if (!barId) {
        document.body.innerHTML = "Error: No se especificó un bar.";
        return;
    }

    // Actualizar enlaces de navegación con el ID del bar
    document.getElementById('back-button').href = `details.html?id=${barId}`;
    document.getElementById('write-review-button').href = `add-review.html?id=${barId}`;

    const barRef = doc(db, "bars", barId);
    const barSnap = await getDoc(barRef);

    if (barSnap.exists()) {
        const barData = barSnap.data();
        document.getElementById('bar-name-header').textContent = barData.nombre;
        
        const reviewsQuery = query(collection(db, `bars/${barId}/reviews`), orderBy('fecha', 'desc'));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        
        renderSummary(barData, reviewsSnapshot.docs);
        renderReviewsList(reviewsSnapshot.docs);
    } else {
        document.body.innerHTML = "Error: El bar no existe.";
    }
}

// --- Funciones de Renderizado ---

function renderSummary(barData, reviewDocs) {
    // Aquí podrías calcular los porcentajes de cada puntuación si los tuvieras
    const summaryHTML = `
        <div class="flex flex-wrap gap-x-8 gap-y-6">
            <div class="flex flex-col gap-2">
                <p class="text-[#1b0e0e] text-4xl font-black">${barData.rating.toFixed(1)}</p>
                <div class="flex gap-0.5">${renderStars(barData.rating, 18)}</div>
                <p class="text-[#1b0e0e] text-base font-normal">${barData.reviews} reviews</p>
            </div>
            </div>`;
    document.getElementById('reviews-summary').innerHTML = summaryHTML;
}

function renderReviewsList(reviewDocs) {
    const container = document.getElementById('reviews-list-container');
    if (reviewDocs.length === 0) {
        container.innerHTML = "<p>No hay reseñas todavía. ¡Sé el primero!</p>";
        return;
    }

    let reviewsHTML = '';
    reviewDocs.forEach(doc => {
        const review = doc.data();
        reviewsHTML += `
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-3">
                    <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style='background-image: url("${review.autorImagenURL || 'https://via.placeholder.com/40'}");'></div>
                    <div class="flex-1">
                        <p class="text-[#1b0e0e] text-base font-medium">${review.autorNombre}</p>
                        <p class="text-[#994d51] text-sm font-normal">${new Date(review.fecha.seconds * 1000).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="flex gap-0.5">${renderStars(review.puntuacion, 20)}</div>
                <p class="text-[#1b0e0e] text-base font-normal">${review.texto}</p>
            </div>`;
    });
    container.innerHTML = reviewsHTML;
}

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

// Cargar todo al iniciar la página
loadPage();