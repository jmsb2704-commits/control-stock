let inventario = JSON.parse(localStorage.getItem('inventario')) || [];
let historial = JSON.parse(localStorage.getItem('historial')) || [];
let usuarios = JSON.parse(localStorage.getItem('usuariosApp')) || ["Mitzy", "Michel", "➕ Nuevo Usuario..."];
let editIdx = -1, prevFoto = "";

function inicializarUsuarios() {
    const s = document.getElementById('usuario-activo'); if (!s) return; s.innerHTML = '';
    usuarios.forEach(u => s.innerHTML += '<option value="' + u + '">' + u + '</option>');
    let ult = localStorage.getItem('usuarioActivo') || "Mitzy";
    s.value = usuarios.includes(ult) ? ult : "Mitzy";
}

function evaluarSeleccionUsuario() {
    const s = document.getElementById('usuario-activo');
    if (s.value === "➕ Nuevo Usuario...") {
        const n = prompt("Nombre:");
        if (n && n.trim() !== "") {
            usuarios.splice(usuarios.length - 1, 0, n.trim());
            localStorage.setItem('usuariosApp', JSON.stringify(usuarios));
            inicializarUsuarios(); s.value = n.trim(); localStorage.setItem('usuarioActivo', n.trim());
        } else { s.value = localStorage.getItem('usuarioActivo') || "Mitzy"; }
    } else { localStorage.setItem('usuarioActivo', s.value); }
}

function eliminarUsuarioActivo() {
    const s = document.getElementById('usuario-activo');
    if (s.value === "➕ Nuevo Usuario..." || s.value === "Mitzy" || s.value === "Michel") return alert("No permitido.");
    if (confirm("¿Eliminar a " + s.value + "?")) {
        usuarios.splice(usuarios.indexOf(s.value), 1);
        localStorage.setItem('usuariosApp', JSON.stringify(usuarios));
        localStorage.setItem('usuarioActivo', "Mitzy");
        inicializarUsuarios(); actualizarInterfaz();
    }
}

function obtenerFechaHora() { return new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); }
function detTxt(p) { return (p.color || "Sin color") + " | " + (p.manga || "Manga Corta") + " | V: " + (p.version || "Fan"); }

function actualizarInterfaz() {
    const t = document.getElementById('tabla-productos'); if (!t) return; t.innerHTML = '';
    if (inventario.length === 0) {
        t.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#888;">No hay modelos registrados.</td></tr>';
    } else {
        inventario.forEach((p, i) => {
            let img = p.foto ? '<img src="' + p.foto + '" class="img-prod">' : '<div class="img-prod">👕</div>';
            let etiquetaDinero = '<span class="badge-dinero">Costo: $' + (p.costo||0) + ' | Sugerido: $' + (p.venta||0) + '</span>';
            
            t.innerHTML += '<tr>' +
                '<td><div class="col-prod-container">' + img + '<div class="col-prod">' + p.nombre + '<small>📝 ' + detTxt(p) + '</small>' + etiquetaDinero + '</div></div></td>' +
                ['CH','M','G','XG','XXG'].map(tl => '<td class="col-talla"><span class="badge-stock">' + p.tallas[tl] + '</span></td>').join('') +
                '<td><div class="row-actions">' +
                    '<button class="btn-row-action btn-out-panel" onclick="abrirModalSalida(' + i + ')">💸 Salida</button>' +
                    '<button class="btn-row-action btn-edit" onclick="activarEdicion(' + i + ')">✏️ Editar</button>' +
                    '<button class="btn-row-action btn-delete" onclick="eliminarProducto(' + i + ')">🗑️ Borrar</button>' +
                '</div></td>' +
            '</tr>';
        });
    }
    const lh = document.getElementById('lista-historial'); if (!lh) return; lh.innerHTML = '';
    if (historial.length === 0) lh.innerHTML = '<li>No hay movimientos.</li>';
    else historial.slice().reverse().forEach(l => lh.innerHTML += '<li>⏱️ ' + l.hora + ' - <strong>' + l.usuario + '</strong> ' + l.accion + '</li>');
}

function activarEdicion(i) {
    editIdx = i; const p = inventario[i];
    document.getElementById('titulo-formulario').innerText = "✏️ Editando Producto";
    const bg = document.getElementById('btn-guardar-principal');
    bg.innerText = "💾 Actualizar Cambios"; bg.classList.add('btn-edit-mode');
    document.getElementById('nombre').value = p.nombre;
    document.getElementById('color').value = p.color || "";
    document.getElementById('manga').value = p.manga || "Manga Corta";
    document.getElementById('version').value = p.version || "Fan";
    document.getElementById('p-costo').value = p.costo || 0;
    document.getElementById('p-venta').value = p.venta || 0;
    ['CH','M','G','XG','XXG'].forEach(tl => document.getElementById('talla-' + tl).value = p.tallas[tl] || 0);
    prevFoto = p.foto || "";
    document.getElementById('preview-container').style.display = prevFoto ? "block" : "none";
    if (prevFoto) document.getElementById('foto-preview').src = prevFoto;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function procesarLoteConFoto() {
    const n = document.getElementById('nombre'); if (!n || n.value.trim() === '') return alert('Escribe el nombre.');
    const f = document.getElementById('foto');
    if (f && f.files && f.files.length > 0) {
        const r = new FileReader(); r.onload = (e) => guardarLoteFinal(e.target.result); r.readAsDataURL(f.files);
    } else { guardarLoteFinal(editIdx !== -1 ? prevFoto : ""); }
}

function guardarLoteFinal(f64) {
    const n = document.getElementById('nombre').value.trim().toUpperCase();
    const c = (document.getElementById('color').value || "SIN COLOR").trim().toUpperCase();
    const m = document.getElementById('manga').value, v = document.getElementById('version').value;
    const cos = parseFloat(document.getElementById('p-costo').value) || 0, ven = parseFloat(document.getElementById('p-venta').value) || 0;

    const model = {
        nombre: n, color: c, manga: m, version: v, costo: cos, venta: ven, foto: f64,
        tallas: {
            CH: parseInt(document.getElementById('talla-CH').value) || 0,
            M: parseInt(document.getElementById('talla-M').value) || 0,
            G: parseInt(document.getElementById('talla-G').value) || 0,
            XG: parseInt(document.getElementById('talla-XG').value) || 0,
            XXG: parseInt(document.getElementById('talla-XXG').value) || 0
        }
    };
    const u = document.getElementById('usuario-activo').value;
    if (editIdx === -1) {
        inventario.push(model);
        historial.push({ hora: obtenerFechaHora(), usuario: u, accion: 'añadió lote de "' + n + '" (' + c + ') - C: $' + cos + ' | V.Sug: $' + ven });
    } else {
        inventario[editIdx] = model;
        historial.push({ hora: obtenerFechaHora(), usuario: u, accion: 'MODIFICÓ los datos de "' + n + '" (' + c + ')' });
        editIdx = -1; prevFoto = "";
        document.getElementById('titulo-formulario').innerText = "Añadir Nuevo Uniforme";
        const bg = document.getElementById('btn-guardar-principal');
        bg.innerText = "📦 Guardar Lote Completo"; bg.classList.remove('btn-edit-mode');
        document.getElementById('preview-container').style.display = "none";
    }
    document.getElementById('nombre').value = ''; document.getElementById('color').value = '';
    document.getElementById('p-costo').value = '0'; document.getElementById('p-venta').value = '0';
    if (document.getElementById('foto')) document.getElementById('foto').value = '';
    ['CH','M','G','XG','XXG'].forEach(tl => document.getElementById('talla-' + tl).value = '0');
    guardarTodo();
}

function eliminarProducto(i) {
    const p = inventario[i];
    if (confirm("¿Eliminar \"" + p.nombre + "\"?")) {
        historial.push({ hora: obtenerFechaHora(), usuario: document.getElementById('usuario-activo').value, accion: 'ELIMINÓ el modelo "' + p.nombre + '".' });
        inventario.splice(i, 1); guardarTodo();
    }
}

function guardarTodo() {
    localStorage.setItem('inventario', JSON.stringify(inventario));
    localStorage.setItem('historial', JSON.stringify(historial));
    localStorage.setItem('usuariosApp', JSON.stringify(usuarios));
    actualizarInterfaz();
}

inicializarUsuarios(); actualizarInterfaz();
