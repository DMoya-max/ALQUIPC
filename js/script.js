// Constantes de negocio
const VALOR_DIARIO_POR_EQUIPO = 35000;
const RECARGO_FUERA_CIUDAD = 0.05;
const DESCUENTO_ESTABLECIMIENTO = 0.05;
const DESCUENTO_DIAS_ADICIONALES_POR_DIA = 0.02;
const MAX_DIAS_ADICIONALES = 10;
const MAX_DESCUENTO_DIAS_ADICIONALES = 0.20;

// Selectores del DOM
const invoiceForm = document.getElementById('invoiceForm');
const inputNombre = document.getElementById('nombre');
const inputIdCliente = document.getElementById('idCliente');
const inputTelefono = document.getElementById('telefono');
const inputEmail = document.getElementById('email');
const inputEquipos = document.getElementById('equipos');
const inputDiasIniciales = document.getElementById('diasIniciales');
const inputDiasAdicionales = document.getElementById('diasAdicionales');
const selectTipoAlquiler = document.getElementById('tipoAlquiler');
const btnGenerar = document.getElementById('btnGenerar');
const btnLimpiar = document.getElementById('btnLimpiar');
const invoicePlaceholder = document.getElementById('invoicePlaceholder');
const invoiceContent = document.getElementById('invoiceContent');
const invoiceBody = document.getElementById('invoiceBody');

// Formateador de moneda COP
const formatoPesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
});

const TIPOS_ALQUILER = {
  CIUDAD: 'Dentro de la ciudad (sin recargo)',
  FUERA: 'Fuera de la ciudad (+5% recargo)',
  ESTABLECIMIENTO: 'Dentro del establecimiento (-5% descuento)',
};

// Inicialización de eventos
function init() {
  invoiceForm.addEventListener('submit', (event) => event.preventDefault());
  btnGenerar.addEventListener('click', generarFactura);
  btnLimpiar.addEventListener('click', limpiarFormulario);

  inputNombre.addEventListener('input', validarNombre);
  inputIdCliente.addEventListener('input', validarIdCliente);
  inputTelefono.addEventListener('input', validarTelefono);
  inputEmail.addEventListener('input', validarCorreo);
  inputEquipos.addEventListener('input', validarEquipos);
  inputDiasIniciales.addEventListener('input', validarDias);
  inputDiasAdicionales.addEventListener('input', validarDiasAdicionales);
  selectTipoAlquiler.addEventListener('change', validarTipoAlquiler);
}

// Validaciones individuales
function validarNombre() {
  const valor = inputNombre.value;
  const valorLimpio = valor.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
  inputNombre.value = valorLimpio;

  if (!valorLimpio.trim()) {
    return establecerError(inputNombre, 'El nombre es obligatorio.');
  }

  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(valorLimpio.trim())) {
    return establecerError(inputNombre, 'Solo se permiten letras y espacios.');
  }

  return limpiarError(inputNombre);
}

function validarIdCliente() {
  const valor = inputIdCliente.value.replace(/[^0-9]/g, '');
  inputIdCliente.value = valor;

  if (!valor) {
    return establecerError(inputIdCliente, 'El ID del cliente es obligatorio.');
  }

  return limpiarError(inputIdCliente);
}

function validarTelefono() {
  const valor = inputTelefono.value.replace(/[^0-9]/g, '');
  inputTelefono.value = valor;

  if (!valor) {
    return establecerError(inputTelefono, 'El teléfono es obligatorio.');
  }

  if (valor.length < 10 || valor.length > 15) {
    return establecerError(inputTelefono, 'El teléfono debe tener entre 10 y 15 dígitos.');
  }

  return limpiarError(inputTelefono);
}

function validarCorreo() {
  const valor = inputEmail.value.trim();
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!valor) {
    return establecerError(inputEmail, 'El correo electrónico es obligatorio.');
  }

  if (!regexEmail.test(valor) || (valor.match(/@/g) || []).length !== 1) {
    return establecerError(inputEmail, 'Ingrese un correo electrónico válido.');
  }

  return limpiarError(inputEmail);
}

function validarEquipos() {
  const valor = Number(inputEquipos.value);
  if (!Number.isFinite(valor) || valor < 2) {
    return establecerError(inputEquipos, 'La cantidad debe ser mínimo 2 equipos.');
  }
  return limpiarError(inputEquipos);
}

function validarDias() {
  const valor = Number(inputDiasIniciales.value);
  if (!Number.isFinite(valor) || valor < 1) {
    return establecerError(inputDiasIniciales, 'Debe alquilar al menos 1 día.');
  }

  if (valor > 30) {
    inputDiasIniciales.value = 30;
  }

  const diasAdicionales = Number(inputDiasAdicionales.value) || 0;
  if (diasAdicionales > valor) {
    inputDiasAdicionales.value = valor;
  }

  return limpiarError(inputDiasIniciales);
}

function validarDiasAdicionales() {
  const valor = Number(inputDiasAdicionales.value);
  if (!Number.isFinite(valor) || valor < 0) {
    return establecerError(inputDiasAdicionales, 'Días adicionales no pueden ser negativos.');
  }

  const diasIniciales = Number(inputDiasIniciales.value) || 1;
  if (valor > diasIniciales) {
    inputDiasAdicionales.value = diasIniciales;
  }

  if (valor > MAX_DIAS_ADICIONALES) {
    inputDiasAdicionales.value = MAX_DIAS_ADICIONALES;
  }

  return limpiarError(inputDiasAdicionales);
}

function validarTipoAlquiler() {
  if (!selectTipoAlquiler.value) {
    return establecerError(selectTipoAlquiler, 'Seleccione un tipo de alquiler.');
  }
  return limpiarError(selectTipoAlquiler);
}

function validarFormulario() {
  const nombreValido = validarNombre();
  const idValido = validarIdCliente();
  const telefonoValido = validarTelefono();
  const correoValido = validarCorreo();
  const equiposValidos = validarEquipos();
  const diasValidos = validarDias();
  const diasAdicionalesValidos = validarDiasAdicionales();
  const tipoValido = validarTipoAlquiler();

  return nombreValido && idValido && telefonoValido && correoValido && equiposValidos && diasValidos && diasAdicionalesValidos && tipoValido;
}

function establecerError(elemento, mensaje) {
  const contenedor = elemento.closest('.field-group');
  if (!contenedor) return false;
  const mensajeError = contenedor.querySelector('.field-error');
  if (mensajeError) {
    mensajeError.textContent = mensaje;
  }
  elemento.classList.add('input-error');
  return false;
}

function limpiarError(elemento) {
  const contenedor = elemento.closest('.field-group');
  if (!contenedor) return true;
  const mensajeError = contenedor.querySelector('.field-error');
  if (mensajeError) {
    mensajeError.textContent = '';
  }
  elemento.classList.remove('input-error');
  return true;
}

function calcularSubtotal(cantidad, dias) {
  return cantidad * dias * VALOR_DIARIO_POR_EQUIPO;
}

function calcularDiasAdicionales(cantidad, diasIniciales, diasAdicionales) {
  const diasAdicionalesAplicados = Math.min(Math.max(diasAdicionales, 0), MAX_DIAS_ADICIONALES);
  const diasAdicionalesValidos = Math.min(diasAdicionalesAplicados, diasIniciales);
  const valorInicial = cantidad * diasIniciales * VALOR_DIARIO_POR_EQUIPO;
  const valorAdicionales = cantidad * diasAdicionalesValidos * VALOR_DIARIO_POR_EQUIPO;
  const subtotalSinDescuento = valorInicial + valorAdicionales;
  const descuentoPorcentaje = Math.min(diasAdicionalesValidos * DESCUENTO_DIAS_ADICIONALES_POR_DIA, MAX_DESCUENTO_DIAS_ADICIONALES);
  const descuento = subtotalSinDescuento * descuentoPorcentaje;

  return {
    valorInicial,
    valorAdicionales,
    subtotalSinDescuento,
    descuento,
    valorFinal: subtotalSinDescuento - descuento,
    descuentoPorcentaje,
  };
}

function calcularIncrementos(subtotal, tipoAlquiler) {
  return tipoAlquiler === 'FUERA' ? subtotal * RECARGO_FUERA_CIUDAD : 0;
}

function calcularDescuentos(subtotal, tipoAlquiler) {
  return tipoAlquiler === 'ESTABLECIMIENTO' ? subtotal * DESCUENTO_ESTABLECIMIENTO : 0;
}

function calcularTotal(subtotal, diasAdicionalesFinal, incremento, descuentoEstablecimiento) {
  return subtotal + diasAdicionalesFinal + incremento - descuentoEstablecimiento;
}

function formatearMoneda(valor) {
  return formatoPesos.format(Math.round(valor));
}

function generarFactura() {
  if (!validarFormulario()) {
    return;
  }

  const cantidadEquipos = Number(inputEquipos.value);
  const diasIniciales = Number(inputDiasIniciales.value);
  const diasAdicionales = Number(inputDiasAdicionales.value);
  const tipoAlquiler = selectTipoAlquiler.value;

  const subtotal = calcularSubtotal(cantidadEquipos, diasIniciales);
  const diasAdicionalesData = calcularDiasAdicionales(cantidadEquipos, diasIniciales, diasAdicionales);
  const incremento = calcularIncrementos(diasAdicionalesData.subtotalSinDescuento, tipoAlquiler);
  const descuentoEstablecimiento = calcularDescuentos(diasAdicionalesData.subtotalSinDescuento, tipoAlquiler);
  const total = calcularTotal(diasAdicionalesData.subtotalSinDescuento, 0, incremento, descuentoEstablecimiento) - diasAdicionalesData.descuento;

  invoiceBody.innerHTML = renderFactura({
    tipoAlquiler,
    cantidadEquipos,
    diasIniciales,
    diasAdicionales,
    subtotal,
    incremento,
    descuentoEstablecimiento,
    diasAdicionalesData,
    total,
  });

  invoicePlaceholder.classList.add('hidden');
  invoiceContent.classList.remove('hidden');
}

function renderFactura(datos) {
  const descuentoDiasAdicionales = datos.diasAdicionales > 0 ? `
    <div class="invoice-row">
      <span class="label">Descuento días adicionales (${(datos.diasAdicionalesData.descuentoPorcentaje * 100).toFixed(0)}%)</span>
      <span class="value">-${formatearMoneda(datos.diasAdicionalesData.descuento)}</span>
    </div>
  ` : '';

  const recargoDomicilio = datos.incremento > 0 ? `
    <div class="invoice-row">
      <span class="label">Recargo domicilio (5%)</span>
      <span class="value">${formatearMoneda(datos.incremento)}</span>
    </div>
  ` : '';

  const descuentoEstablecimiento = datos.descuentoEstablecimiento > 0 ? `
    <div class="invoice-row">
      <span class="label">Descuento establecimiento (5%)</span>
      <span class="value">-${formatearMoneda(datos.descuentoEstablecimiento)}</span>
    </div>
  ` : '';

  return `
    <div class="invoice-header">
      <div>
        <p class="label">Tipo de alquiler</p>
        <p class="value">${TIPOS_ALQUILER[datos.tipoAlquiler]}</p>
      </div>
      <div class="invoice-chip">Factura ALQUIPC</div>
    </div>

    <div class="invoice-row">
      <span class="label">Precio por equipo</span>
      <span class="value">${formatearMoneda(VALOR_DIARIO_POR_EQUIPO)} / día</span>
    </div>
    <div class="invoice-row">
      <span class="label">Cantidad de equipos</span>
      <span class="value">${datos.cantidadEquipos} unidad(es)</span>
    </div>
    <div class="invoice-row">
      <span class="label">Días iniciales</span>
      <span class="value">${datos.diasIniciales} día(s)</span>
    </div>
    <div class="invoice-row">
      <span class="label">Días adicionales</span>
      <span class="value">${datos.diasAdicionales} día(s)</span>
    </div>

    <div class="invoice-divider"></div>

    <div class="invoice-row">
      <span class="label">Subtotal</span>
      <span class="value">${formatearMoneda(datos.diasAdicionalesData.subtotalSinDescuento)}</span>
    </div>

    ${descuentoDiasAdicionales}
    ${recargoDomicilio}
    ${descuentoEstablecimiento}

    <div class="invoice-divider"></div>

    <div class="invoice-row total">
      <span class="label">Valor total a pagar</span>
      <span class="value">${formatearMoneda(datos.total)}</span>
    </div>
  `;
}

function limpiarFormulario() {
  invoiceForm.reset();
  inputEquipos.value = 2;
  inputDiasIniciales.value = 1;
  inputDiasAdicionales.value = 0;
  invoiceContent.classList.add('hidden');
  invoiceContent.style.removeProperty('display');
  invoicePlaceholder.classList.remove('hidden');
  invoicePlaceholder.style.removeProperty('display');
  invoiceBody.innerHTML = '';
  limpiarError(inputNombre);
  limpiarError(inputIdCliente);
  limpiarError(inputTelefono);
  limpiarError(inputEmail);
  limpiarError(inputEquipos);
  limpiarError(inputDiasIniciales);
  limpiarError(inputDiasAdicionales);
  limpiarError(selectTipoAlquiler);
}

init();
