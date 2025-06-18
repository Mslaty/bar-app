// Importamos las funciones que vamos a necesitar
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// ¡USA TU PROPIA CONFIGURACIÓN DE FIREBASE!
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
const storage = getStorage(app);

// Obtenemos los elementos del DOM
const form = document.getElementById('add-bar-form');
const imageUploadInput = document.getElementById('bar-image-upload');
const imagePreviewContainer = document.getElementById('image-preview-container');

let imageFile = null; // Variable para guardar el archivo de imagen

// Evento para mostrar la vista previa de la imagen seleccionada
imageUploadInput.addEventListener('change', (event) => {
    imageFile = event.target.files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreviewContainer.innerHTML = `<img src="${e.target.result}" alt="Vista previa" class="w-full h-auto rounded-lg object-cover">`;
        };
        reader.readAsDataURL(imageFile);
    }
});

// Evento para gestionar el envío del formulario
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevenimos que la página se recargue

    const submitButton = document.getElementById('submit-button');
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
        // 1. Recogemos los datos del formulario
        const nombre = document.getElementById('bar-name').value;
        const direccion = document.getElementById('bar-address').value;
        const descripcion = document.getElementById('bar-description').value;

        if (!imageFile) {
            throw new Error('Por favor, selecciona una imagen para el bar.');
        }

        // 2. Subimos la imagen a Firebase Storage
        const imageRef = ref(storage, `bar-images/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);

        // 3. Obtenemos la URL de la imagen subida
        const imagenURL = await getDownloadURL(imageRef);

        // 4. Creamos el objeto con los datos del bar
        const newBarData = {
            nombre: nombre,
            direccion: direccion,
            descripcion: descripcion,
            imagenURL: imagenURL,
            // Añadimos valores por defecto para otros campos
            rating: 0,
            reviews: 0,
            tipo: 'nuevo',
            horario: 'Horario no disponible',
            distancia: 0
        };

        // 5. Añadimos el nuevo documento a la colección "bars" en Firestore
        await addDoc(collection(db, "bars"), newBarData);

        // 6. Damos feedback al usuario y redirigimos
        alert('¡Bar añadido con éxito!');
        window.location.href = 'index.html'; // Redirigimos a la página principal

    } catch (error) {
        console.error("Error al añadir el bar: ", error);
        alert(`Error: ${error.message}`);
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
    }
});