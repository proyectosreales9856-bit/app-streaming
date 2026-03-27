// API Base URL
const API_URL = '/api';

// Estado de la aplicación
let tiposCuenta = [];

// Elementos del DOM - Ventas
const ventaForm = document.getElementById('venta-form');
const ventaFormTitle = document.getElementById('venta-form-title');
const ventaIdInput = document.getElementById('venta-id');
const numeroOrdenInput = document.getElementById('numero-orden');
const tipoCuentaSelect = document.getElementById('tipo-cuenta');
const precioTiendaInput = document.getElementById('precio-tienda');
const precioPublicoInput = document.getElementById('precio-publico');
const whatsappInput = document.getElementById('whatsapp');
const fechaExpiracionInput = document.getElementById('fecha-expiracion');
const renovableCheckbox = document.getElementById('renovable');
const cancelarVentaBtn = document.getElementById('cancelar-venta');
const ventasTbody = document.getElementById('ventas-tbody');

// Elementos del DOM - Cuentas
const cuentaForm = document.getElementById('cuenta-form');
const cuentaFormTitle = document.getElementById('cuenta-form-title');
const cuentaIdInput = document.getElementById('cuenta-id');
const nombreCuentaInput = document.getElementById('nombre-cuenta');
const cuentaPrecioTiendaInput = document.getElementById('cuenta-precio-tienda');
const cuentaPrecioPublicoInput = document.getElementById('cuenta-precio-publico');
const cancelarCuentaBtn = document.getElementById('cancelar-cuenta');
const cuentasTbody = document.getElementById('cuentas-tbody');

// Tabs
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadTiposCuenta();
    loadVentas();
    loadCuentas();
    setupEventListeners();
});

// Configurar Tabs
function initTabs() {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Event Listeners
function setupEventListeners() {
    ventaForm.addEventListener('submit', handleVentaSubmit);
    cancelarVentaBtn.addEventListener('click', resetVentaForm);
    
    cuentaForm.addEventListener('submit', handleCuentaSubmit);
    cancelarCuentaBtn.addEventListener('click', resetCuentaForm);
    
    tipoCuentaSelect.addEventListener('change', autoFillPrecios);
}

// Auto-fill precios cuando se selecciona tipo de cuenta
function autoFillPrecios() {
    const selectedId = tipoCuentaSelect.value;
    const tipoCuenta = tiposCuenta.find(tc => tc._id === selectedId);
    
    if (tipoCuenta) {
        precioTiendaInput.value = tipoCuenta.precio_tienda;
        precioPublicoInput.value = tipoCuenta.precio_publico;
    }
}

// ==================== FUNCIONES DE CUENTAS ====================

// Cargar tipos de cuenta
async function loadTiposCuenta() {
    try {
        const response = await fetch(`${API_URL}/cuentas`);
        tiposCuenta = await response.json();
        populateTipoCuentaSelect();
    } catch (error) {
        console.error('Error cargando tipos de cuenta:', error);
        showNotification('Error al cargar tipos de cuenta', 'error');
    }
}

// Poblar select de tipos de cuenta
function populateTipoCuentaSelect() {
    const currentValue = tipoCuentaSelect.value;
    tipoCuentaSelect.innerHTML = '<option value="">Seleccionar tipo...</option>';
    
    tiposCuenta.forEach(tc => {
        const option = document.createElement('option');
        option.value = tc._id;
        option.textContent = tc.nombre;
        tipoCuentaSelect.appendChild(option);
    });
    
    if (currentValue) {
        tipoCuentaSelect.value = currentValue;
    }
}

// Cargar cuentas en la tabla
async function loadCuentas() {
    try {
        const response = await fetch(`${API_URL}/cuentas`);
        const cuentas = await response.json();
        renderCuentasTable(cuentas);
    } catch (error) {
        console.error('Error cargando cuentas:', error);
        showNotification('Error al cargar cuentas', 'error');
    }
}

// Renderizar tabla de cuentas
function renderCuentasTable(cuentas) {
    if (cuentas.length === 0) {
        cuentasTbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <p>No hay tipos de cuenta registrados</p>
                </td>
            </tr>
        `;
        return;
    }

    cuentasTbody.innerHTML = cuentas.map(cuenta => `
        <tr>
            <td>${cuenta._id.substring(0, 8)}...</td>
            <td>${escapeHtml(cuenta.nombre)}</td>
            <td>$${formatNumber(cuenta.precio_tienda)}</td>
            <td>$${formatNumber(cuenta.precio_publico)}</td>
            <td class="action-buttons">
                <button class="btn btn-success" onclick="editCuenta('${cuenta._id}')">Editar</button>
                <button class="btn btn-danger" onclick="deleteCuenta('${cuenta._id}')">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// Manejar submit de cuenta
async function handleCuentaSubmit(e) {
    e.preventDefault();
    
    const id = cuentaIdInput.value;
    const data = {
        nombre: nombreCuentaInput.value,
        precio_tienda: parseFloat(cuentaPrecioTiendaInput.value),
        precio_publico: parseFloat(cuentaPrecioPublicoInput.value)
    };

    try {
        const url = id ? `${API_URL}/cuentas/${id}` : `${API_URL}/cuentas`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        showNotification(id ? 'Cuenta actualizada' : 'Cuenta creada', 'success');
        resetCuentaForm();
        loadCuentas();
        loadTiposCuenta();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Editar cuenta
async function editCuenta(id) {
    try {
        const response = await fetch(`${API_URL}/cuentas/${id}`);
        const cuenta = await response.json();
        
        cuentaIdInput.value = cuenta._id;
        nombreCuentaInput.value = cuenta.nombre;
        cuentaPrecioTiendaInput.value = cuenta.precio_tienda;
        cuentaPrecioPublicoInput.value = cuenta.precio_publico;
        
        cuentaFormTitle.textContent = 'Editar Tipo de Cuenta';
        nombreCuentaInput.focus();
    } catch (error) {
        showNotification('Error al cargar cuenta', 'error');
    }
}

// Eliminar cuenta
async function deleteCuenta(id) {
    if (!confirm('¿Estás seguro de eliminar este tipo de cuenta?')) return;
    
    try {
        const response = await fetch(`${API_URL}/cuentas/${id}`, { method: 'DELETE' });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }
        
        showNotification('Cuenta eliminada', 'success');
        loadCuentas();
        loadTiposCuenta();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Reset formulario cuenta
function resetCuentaForm() {
    cuentaForm.reset();
    cuentaIdInput.value = '';
    cuentaFormTitle.textContent = 'Agregar Tipo de Cuenta';
}

// ==================== FUNCIONES DE VENTAS ====================

// Cargar ventas
async function loadVentas() {
    try {
        const response = await fetch(`${API_URL}/ventas`);
        const ventas = await response.json();
        renderVentasTable(ventas);
    } catch (error) {
        console.error('Error cargando ventas:', error);
        showNotification('Error al cargar ventas', 'error');
    }
}

// Renderizar tabla de ventas
function renderVentasTable(ventas) {
    if (ventas.length === 0) {
        ventasTbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <p>No hay ventas registradas</p>
                </td>
            </tr>
        `;
        return;
    }

    ventasTbody.innerHTML = ventas.map(venta => `
        <tr class="${venta.renovable ? '' : 'no-renovable'}">
            <td>${venta.numero_orden}</td>
            <td>${escapeHtml(venta.tipo_cuenta_nombre || 'N/A')}</td>
            <td>$${formatNumber(venta.precio_tienda)}</td>
            <td>$${formatNumber(venta.precio_publico)}</td>
            <td>${escapeHtml(venta.whatsapp)}</td>
            <td>${formatDate(venta.fecha_expiracion)}</td>
            <td>
                <span class="${venta.renovable ? 'renewable-yes' : 'renewable-no'}">
                    ${venta.renovable ? 'Sí' : 'No'}
                </span>
            </td>
            <td class="action-buttons">
                <button class="btn btn-success" onclick="editVenta('${venta._id}')">Editar</button>
                <button class="btn btn-danger" onclick="deleteVenta('${venta._id}')">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// Manejar submit de venta
async function handleVentaSubmit(e) {
    e.preventDefault();
    
    const id = ventaIdInput.value;
    const data = {
        numero_orden: parseInt(numeroOrdenInput.value),
        tipo_cuenta_id: tipoCuentaSelect.value,
        precio_tienda: parseFloat(precioTiendaInput.value),
        precio_publico: parseFloat(precioPublicoInput.value),
        whatsapp: whatsappInput.value,
        fecha_expiracion: fechaExpiracionInput.value,
        renovable: renovableCheckbox.checked
    };

    try {
        const url = id ? `${API_URL}/ventas/${id}` : `${API_URL}/ventas`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        showNotification(id ? 'Venta actualizada' : 'Venta creada', 'success');
        resetVentaForm();
        loadVentas();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Editar venta
async function editVenta(id) {
    try {
        const response = await fetch(`${API_URL}/ventas/${id}`);
        const venta = await response.json();
        
        ventaIdInput.value = venta._id;
        numeroOrdenInput.value = venta.numero_orden;
        tipoCuentaSelect.value = venta.tipo_cuenta_id;
        precioTiendaInput.value = venta.precio_tienda;
        precioPublicoInput.value = venta.precio_publico;
        whatsappInput.value = venta.whatsapp;
        fechaExpiracionInput.value = venta.fecha_expiracion;
        renovableCheckbox.checked = venta.renovable;
        
        ventaFormTitle.textContent = 'Editar Venta';
        numeroOrdenInput.focus();
        
        // Scroll al formulario
        document.querySelector('#ventas .form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showNotification('Error al cargar venta', 'error');
    }
}

// Eliminar venta
async function deleteVenta(id) {
    if (!confirm('¿Estás seguro de eliminar esta venta?')) return;
    
    try {
        const response = await fetch(`${API_URL}/ventas/${id}`, { method: 'DELETE' });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }
        
        showNotification('Venta eliminada', 'success');
        loadVentas();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Reset formulario venta
function resetVentaForm() {
    ventaForm.reset();
    ventaIdInput.value = '';
    ventaFormTitle.textContent = 'Agregar Venta';
}

// ==================== UTILIDADES ====================

function formatNumber(num) {
    return parseFloat(num).toFixed(2);
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type) {
    // Eliminar notificaciones existentes
    const existing = document.querySelector('.alert');
    if (existing) existing.remove();

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(alert, container.firstChild);
    
    setTimeout(() => alert.remove(), 3000);
}
