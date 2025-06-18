import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, collection, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

function getBarId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

const form = document.getElementById('add-review-form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const barId = getBarId();
    if (!barId) return alert('Error: no bar ID specified.');

    const submitButton = document.getElementById('submit-review-button');
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    const puntuacion = parseInt(form.rating.value);
    const texto = form['review-text'].value;
    
    // Referencia al documento del bar principal
    const barRef = doc(db, 'bars', barId);
    // Referencia a un *nuevo* documento en la subcolección de reseñas
    const reviewRef = doc(collection(db, `bars/${barId}/reviews`));

    try {
        // Ejecutamos una transacción para garantizar la consistencia de los datos
        await runTransaction(db, async (transaction) => {
            const barDoc = await transaction.get(barRef);
            if (!barDoc.exists()) {
                throw "El bar no existe.";
            }

            // Calculamos la nueva puntuación media
            const oldRating = barDoc.data().rating;
            const oldCount = barDoc.data().reviews;
            const newCount = oldCount + 1;
            const newRating = (oldRating * oldCount + puntuacion) / newCount;

            // 1. Actualizamos el documento principal del bar
            transaction.update(barRef, {
                rating: newRating,
                reviews: newCount
            });

            // 2. Creamos el nuevo documento de la reseña
            transaction.set(reviewRef, {
                puntuacion: puntuacion,
                texto: texto,
                fecha: serverTimestamp(), // Usamos la hora del servidor
                autorNombre: "Usuario Anónimo" // Más adelante, esto vendrá del usuario logueado
            });
        });

        alert("¡Reseña añadida con éxito!");
        window.location.href = `reviews.html?id=${barId}`;

    } catch (error) {
        console.error("Error en la transacción: ", error);
        alert("Error al enviar la reseña.");
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar Reseña';
    }
});