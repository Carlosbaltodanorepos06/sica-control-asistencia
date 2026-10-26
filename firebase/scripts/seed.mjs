// Carga los datos ficticios de SICA en Firebase.
//
// Crea las 11 colecciones de SICA. Antes de ejecutarlo debes haber:
//   1) Creado en Authentication el usuario admin@sica-demo.test
//   2) Creado a mano en Firestore el documento usuarios/<UID del admin> con rol "admin"
//   3) Puesto SEED_PASSWORD en el archivo .env
//
// Ejecutar (Node 20 o superior):
//   node --env-file=.env scripts/seed.mjs

import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc, Timestamp, serverTimestamp } from "firebase/firestore";

const ADMIN_EMAIL = "admin@sica-demo.test";
const PASSWORD = process.env.SEED_PASSWORD;

if (!PASSWORD || PASSWORD.length < 6) {
  console.error("Falta SEED_PASSWORD en .env (mínimo 6 caracteres).");
  process.exit(1);
}

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

const data = JSON.parse(readFileSync(new URL("../seed-data.json", import.meta.url), "utf8"));

// ---------- Paso 1: obtener el UID de cada usuario ----------
const uidPorCodigo = {};

for (const u of data.usuarios) {
  if (u.correo === ADMIN_EMAIL) continue; // el admin se procesa al final
  let cred;
  try {
    cred = await createUserWithEmailAndPassword(auth, u.correo, PASSWORD);
    console.log("Cuenta creada:", u.correo);
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      cred = await signInWithEmailAndPassword(auth, u.correo, PASSWORD);
      console.log("Cuenta ya existía:", u.correo);
    } else {
      throw e;
    }
  }
  uidPorCodigo[u.codigoEmpleado] = cred.user.uid;
}

// ---------- Paso 2: entrar como admin (quien tiene permiso de escribir) ----------
const adminCred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, PASSWORD);
const adminUid = adminCred.user.uid;
const adminData = data.usuarios.find((u) => u.correo === ADMIN_EMAIL);
uidPorCodigo[adminData.codigoEmpleado] = adminUid;
console.log("Sesión iniciada como admin.");

// ---------- Paso 3: escribir los datos ----------
for (const s of data.sucursales) {
  const { id, ...resto } = s;
  await setDoc(doc(db, "sucursales", id), resto);
}
console.log("Sucursales:", data.sucursales.length);

for (const h of data.horarios) {
  const { id, ...resto } = h;
  await setDoc(doc(db, "horarios", id), resto);
}
console.log("Horarios:", data.horarios.length);

for (const u of data.usuarios) {
  const uid = uidPorCodigo[u.codigoEmpleado];
  await setDoc(doc(db, "usuarios", uid), {
    uid,
    ...u,
    esDemo: true,
    fechaCreacion: serverTimestamp(),
  });
}
console.log("Usuarios:", data.usuarios.length);

for (const m of data.marcas) {
  const { id, codigo, fechaHoraServidor, ...resto } = m;
  await setDoc(doc(db, "marcas", id), {
    marcaId: id,
    usuarioId: uidPorCodigo[codigo],
    codigoEmpleado: codigo,
    fechaHoraServidor: Timestamp.fromDate(new Date(fechaHoraServidor)),
    esDemo: true,
    ...resto,
  });
}
console.log("Marcas:", data.marcas.length);

for (const i of data.incidencias_solicitudes) {
  const { id, codigo, revisadoPor, ...resto } = i;
  await setDoc(doc(db, "incidencias_solicitudes", id), {
    solicitudId: id,
    usuarioId: uidPorCodigo[codigo],
    codigoEmpleado: codigo,
    revisadoPor: revisadoPor ? uidPorCodigo[revisadoPor] : null,
    esDemo: true,
    ...resto,
  });
}
console.log("Incidencias:", data.incidencias_solicitudes.length);

for (const a of data.auditoria_logs) {
  const { id, ...resto } = a;
  await setDoc(doc(db, "auditoria_logs", id), {
    logId: id,
    actorUid: adminUid,
    fechaHoraServidor: serverTimestamp(),
    esDemo: true,
    ...resto,
  });
}
console.log("Auditoría:", data.auditoria_logs.length);


// Convierte "2026-10-19T07:56:00-06:00" en Timestamp (o null)
const ts = (v) => (v ? Timestamp.fromDate(new Date(v)) : null);

for (const a of data.asignaciones_horario) {
  const { id, codigo, fechaInicio, fechaFin, creadoPor, ...resto } = a;
  await setDoc(doc(db, "asignaciones_horario", id), {
    usuarioId: uidPorCodigo[codigo],
    codigoEmpleado: codigo,
    fechaInicio: ts(fechaInicio),
    fechaFin: ts(fechaFin),
    creadoPor: uidPorCodigo[creadoPor],
    esDemo: true,
    ...resto,
  });
}
console.log("Asignaciones de horario:", data.asignaciones_horario.length);

for (const j of data.jornadas) {
  const { id, codigo, primeraEntrada, ultimaSalida, ...resto } = j;
  await setDoc(doc(db, "jornadas", id), {
    jornadaId: id,
    usuarioId: uidPorCodigo[codigo],
    codigoEmpleado: codigo,
    sucursalId: data.usuarios.find((u) => u.codigoEmpleado === codigo).sucursalId,
    primeraEntrada: ts(primeraEntrada),
    ultimaSalida: ts(ultimaSalida),
    esDemo: true,
    ...resto,
  });
}
console.log("Jornadas:", data.jornadas.length);

for (const h of data.horas_extras_autorizadas) {
  const { id, codigo, autorizadoPor, ...resto } = h;
  await setDoc(doc(db, "horas_extras_autorizadas", id), {
    autorizacionId: id,
    usuarioId: uidPorCodigo[codigo],
    codigoEmpleado: codigo,
    sucursalId: data.usuarios.find((u) => u.codigoEmpleado === codigo).sucursalId,
    autorizadoPor: uidPorCodigo[autorizadoPor],
    esDemo: true,
    ...resto,
  });
}
console.log("Horas extras:", data.horas_extras_autorizadas.length);

for (const c of data.cierres_periodo) {
  const { id, ...resto } = c;
  await setDoc(doc(db, "cierres_periodo", id), { periodoId: id, esDemo: true, ...resto });
}
console.log("Cierres de período:", data.cierres_periodo.length);

for (const e of data.integraciones_eventos) {
  const { id, ...resto } = e;
  await setDoc(doc(db, "integraciones_eventos", id), {
    eventoId: id,
    recibidoEn: serverTimestamp(),
    esDemo: true,
    ...resto,
  });
}
console.log("Eventos de integración:", data.integraciones_eventos.length);

console.log("\nListo. Se crearon las 11 colecciones. Revisa Firestore en la consola de Firebase.");
process.exit(0);
