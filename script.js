// ===============================
// 🔥 FIREBASE IMPORTS
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ===============================
// 🔥 FIREBASE CONFIG
// ===============================

const firebaseConfig = {
   apiKey: "AIzaSyBrKdneunW58FUIpWAsm-eIz36ZC31rEi4",
  authDomain: "gap-rankers.firebaseapp.com",
  projectId: "gap-rankers",
  storageBucket: "gap-rankers.firebasestorage.app",
  messagingSenderId: "936445895161",
  appId: "1:936445895161:web:f5d82b219a64de07b51d28"
};


// ===============================
// 🔥 INITIALIZE FIREBASE
// ===============================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ===============================
// 🔐 GOOGLE LOGIN
// ===============================

window.googleLogin = async function () {

    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(auth, provider);
        document.getElementById("name").value = result.user.displayName;
        alert("Logged in successfully");
    } catch (error) {
        alert("Login failed");
    }
};


// ===============================
// 💾 SAVE USER PROFILE
// ===============================

window.saveUser = async function () {

    if (!auth.currentUser) {
        alert("Please login first");
        return;
    }

    const name = document.getElementById("name").value;

    if (!name) {
        alert("Enter name");
        return;
    }

    const newUser = {
        name: name,
        fei: 0,
        sessions: [],
        createdAt: new Date()
    };

    await setDoc(
        doc(db, "users", auth.currentUser.uid),
        newUser
    );

    alert("Profile Saved");
};


// ===============================
// ⏱ FOCUS SPRINT
// ===============================

let timer;
let timeLeft = 60;

window.startSprint = function () {

    timeLeft = 60;
    document.getElementById("timeLeft").innerText = timeLeft;

    timer = setInterval(async function () {

        timeLeft--;
        document.getElementById("timeLeft").innerText = timeLeft;

        if (timeLeft <= 0) {

            clearInterval(timer);

            let accuracy = Math.floor(Math.random() * 100);
            document.getElementById("accuracy").innerText = accuracy;

            let fei = Math.floor(accuracy * 1.2);
            document.getElementById("fei").innerText = fei;

            alert("Sprint Finished!");

            if (auth.currentUser) {

                const userRef = doc(db, "users", auth.currentUser.uid);
                const userSnap = await getDoc(userRef);
                const oldData = userSnap.data();

                await updateDoc(userRef, {
                    fei: fei,
                    sessions: [...(oldData.sessions || []), fei]
                });
            }
        }

    }, 1000);
};


// ===============================
// 🏆 SHOW LEADERBOARD
// ===============================

window.showLeaderboard = async function () {

    const querySnapshot = await getDocs(collection(db, "users"));

    let html = "<h3>Leaderboard</h3>";

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        html += `<p>${data.name} - FEI: ${data.fei}</p>`;
    });

    document.getElementById("leaderboard").innerHTML = html;
};


// ===============================
// 📊 SHOW MY STATS
// ===============================

window.showMyStats = async function () {

    if (!auth.currentUser) {
        alert("Login first");
        return;
    }

    const userSnap = await getDoc(
        doc(db, "users", auth.currentUser.uid)
    );

    const data = userSnap.data();

    alert("Name: " + data.name + "\nFEI: " + data.fei);
};


// ===============================
// 📜 SHOW SESSION HISTORY
// ===============================

window.showSessionHistory = async function () {

    if (!auth.currentUser) {
        alert("Login first");
        return;
    }

    const userSnap = await getDoc(
        doc(db, "users", auth.currentUser.uid)
    );

    const data = userSnap.data();

    if (!data.sessions || data.sessions.length === 0) {
        alert("No sessions yet");
        return;
    }

    let history = "Session History:\n";

    data.sessions.forEach((session, index) => {
        history += `Session ${index + 1} - FEI: ${session}\n`;
    });

    alert(history);
};


// ===============================
// 🔁 RESET MY DATA
// ===============================

window.resetMyData = async function () {

    if (!auth.currentUser) {
        alert("Login first");
        return;
    }

    await updateDoc(
        doc(db, "users", auth.currentUser.uid),
        {
            fei: 0,
            sessions: []
        }
    );

    alert("Data Reset Successfully");
};