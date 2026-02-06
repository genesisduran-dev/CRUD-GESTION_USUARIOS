
function validarFormulario(playload){
  if(!playload.nombre)return "Nombre es obligatorio";
  if(!playload.apellido)return "Apellido es obligatorio";
  if(!playload.telefono)return "Telefono es obligatorio";
  return null;
}

function limpiarFormulario(){
  document.getElementById("nombre").value = "";
  document.getElementById("apellido").value = "";
  document.getElementById("direccion").value = "";
  document.getElementById("telefono").value = "";
  document.getElementById("municipio").value = "";
  document.getElementById("nombre").focus();
}

const API = "http://localhost:3000/api/personas";

const $ = (id) => document.getElementById(id);
const tbody = document.querySelector("#tabla tbody");

function getValue(id){
  return document.getElementById(id).value.trim();
}

function mostrarMensaje(texto, tipo = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = texto;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3800);
}

async function listar() {
  const res = await fetch(API);
  const personas = await res.json();

  tbody.innerHTML = "";

personas.forEach((p, i) => {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${i + 1}</td>
    <td>${p.id}</td>
    <td>${p.nombre}</td>
    <td>${p.apellido}</td>
    <td>${p.direccion || ""}</td>
    <td>${p.telefono}</td>
    <td>${p.municipio || ""}</td>
  `;

  // click para seleccionar
  tr.addEventListener("click", () => {
    $("id").value = p.id; // el ID real (para editar/eliminar)
    $("nombre").value = p.nombre;
    $("apellido").value = p.apellido;
    $("direccion").value = p.direccion || "";
    $("telefono").value = p.telefono;
    $("municipio").value = p.municipio || "";
    showToast(`Seleccionado ID ${p.id}`, "info");
  });

  tbody.appendChild(tr);
});

}



async function grabar() {
  const data = {
    nombre: getValue("nombre"),
    apellido: getValue("apellido"),
    direccion: getValue("direccion"),
    telefono: getValue("telefono"),
    municipio: getValue("municipio"),
  };

  const error = validarFormulario(data);
  if (error) {
    alert(error);
    return;
  }

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    mostrarError(result.error);
    return;
  }

  await listar();
  limpiarFormulario();
  mostrarMensaje("Guardado ✅", "success");
}




 
async function editar() {
  const id = $("id").value;
  if (!id) return alert("Selecciona una persona de la tabla.");
  const data = {
    nombre: $("nombre").value,
    apellido: $("apellido").value,
    direccion: $("direccion").value,
    telefono: $("telefono").value,
    municipio: $("municipio").value
  };
  await fetch(`${API}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  listar();
}

async function eliminar() {
  const id = $("id").value;

  if (!id) {
    alert("Selecciona una persona de la tabla.");
    return;
  }

  const res = await fetch(`${API}/${id}`, { method: "DELETE" });

  
  let result = {};
  try {
    result = await res.json();
  } catch (_) {
    
  }

  if (!res.ok) {
    mostrarMensaje(result.error || "No se pudo eliminar.", "error");
    return;
  }

  await listar();             
  limpiarFormulario();
  mostrarMensaje("Eliminado 🗑️", "info");
}


$("btn-grabar").addEventListener("click", grabar);
$("btn-editar").addEventListener("click", editar);
$("btn-eliminar").addEventListener("click", eliminar);
$("btn-consultar").addEventListener("click", listar);

listar(); 
