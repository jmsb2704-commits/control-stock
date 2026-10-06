let salidaIdx = -1;

function abrirModalSalida(indexReal) {
    salidaIdx = indexReal; 
    const p = inventario[salidaIdx];
    
    document.getElementById('modal-titulo-prod').innerText = "Salida: " + p.nombre + " (" + p.color + ")";
    const st = document.getElementById('modal-talla'); 
    st.innerHTML = '';
    
    ['CH','M','G','XG','XXG'].forEach(tl => {
        st.innerHTML += '<option value="' + tl + '">' + tl + ' (Stock: ' + p.tallas[tl] + ')</option>';
    });
    
    document.getElementById('modal-precio-venta').value = p.venta || 0;
    document.getElementById('modal-cantidad').value = 1;
    document.getElementById('modal-motivo').value = "VENTA";
    document.getElementById('modal-precio-row').style.display = "block";
    document.getElementById('modal-salida').style.display = "flex";
}

function cerrarModalSalida() { 
    document.getElementById('modal-salida').style.display = "none"; 
    salidaIdx = -1; 
}

function alternarCampoPrecioModal() {
    const m = document.getElementById('modal-motivo').value;
    document.getElementById('modal-precio-row').style.display = (m === "MERMA") ? "none" : "block";
}

function ejecutarSalidaFinanciera() {
    if (salidaIdx === -1) return;
    const p = inventario[salidaIdx];
    const tl = document.getElementById('modal-talla').value;
    const cant = parseInt(document.getElementById('modal-cantidad').value) || 0;
    const mot = document.getElementById('modal-motivo').value;
    const prcVnt = parseFloat(document.getElementById('modal-precio-venta').value) || 0;

    if (cant <= 0) return alert("Cantidad inválida.");
    if (p.tallas[tl] < cant) return alert("No hay suficiente stock disponible.");

    p.tallas[tl] -= cant;
    let u = document.getElementById('usuario-activo').value, msg = "";

    if (mot === "VENTA") {
        let ganNeta = (prcVnt * cant) - ((p.costo || 0) * cant);
        let est = ganNeta > 0 ? " -> 💰 Ganancia Real: $" + ganNeta : (ganNeta === 0 ? " -> ⚖️ Salió Tablas" : " -> 🔴 Pérdida: -$" + Math.abs(ganNeta));
        msg = 'registró VENTA (-' + cant + ' pzas) talla ' + tl + ' de "' + p.nombre + '" a $' + prcVnt + ' c/u' + est;
    } else {
        msg = 'registró MERMA (-' + cant + ' pzas) talla ' + tl + ' de "' + p.nombre + '" (' + p.color + ') -> ⚠️ Pérdida Costo: -$' + ((p.costo || 0) * cant);
    }

    historial.push({ hora: obtenerFechaHora(), usuario: u, accion: msg });
    cerrarModalSalida(); 
    guardarTodo();
}
