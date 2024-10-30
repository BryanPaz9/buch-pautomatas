'use strict'
let title = '';
const inputArchivo = document.getElementById('documento');
const txtContent = document.getElementById('txt-content');
const txtTitle = document.getElementById('txttitle'); 
const bodyEstadosAceptacion = document.getElementById('bodyEstadosAceptacion');
const vectorEstados = document.getElementById('vectorEstados');
const vectorEstadosAceptacion = document.getElementById('vectorEstadosAceptacion');
const vectorAlfabeto = document.getElementById('vectorAlfabeto');
const txt = document.getElementById('txt');
const reloadDiv = document.getElementById('reload');
const matTransicion = document.getElementById('matriz');



inputArchivo.addEventListener('change', function() {
  const archivo = inputArchivo.files[0]; 

  if (archivo) {
    const extension = archivo.name.split('.').pop().toLowerCase();
    title = 'Contenido de archivo ' + archivo.name;


    if (extension === 'txt') {
      ejecutar();
    } else {
      Swal.fire({
        title: 'Error!',
        html: 'El formato del archivo no es compatible con esta función. Solo se aceptan archivos .txt.',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
            confirmButton: 'custom-confirm-button' 
        }
      }).then((res)=>{
        if(res.isConfirmed){
          window.location.reload();  
        }else{
          window.location.reload();  
        }
      });
    }
  }
});


async function ejecutar() {
  event.preventDefault();
  const archivo = inputArchivo.files[0];
  const contenidoArchivo = new FileReader();
  txtTitle.textContent = title;

  contenidoArchivo.onload = async function (event) {
    txtContent.value = event.target.result; 
    const lineasTxt = txtContent.value.split('\n').map(line => line.trim());
    const LINEA_ESTADOS = lineasTxt[0];
    const regexQ = /^Q\s*=\s*\{([A-Z0-9]+(,[A-Z0-9]+)*)\}$/;
    if(!regexQ.test(LINEA_ESTADOS)){
      Swal.fire({
        title: 'Error!',
        html: 'Problema con el formato de entrada de Q<br><br>' +
              'Cadena encontrada: ' + LINEA_ESTADOS + '<br>' +
              'Formato aceptable: Q={A,B}',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
            confirmButton: 'custom-confirm-button' 
        }
      });
      txt.style.display='block';       
      return;
    }
    const regexZ = /^Z\s*=\s*\{([^\s,{}]+(,[^\s,{}]+)*)\}$/;
    const LINEA_ALFABETO = lineasTxt[1];
    if(!regexZ.test(LINEA_ALFABETO)){
      Swal.fire({
        title: 'Error!',
        html: 'Problema con el formato de entrada de Z<br><br>' +
              'Cadena encontrada: ' + LINEA_ALFABETO + '<br>' +
              'Formato aceptable: Z={a,b}',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
            confirmButton: 'custom-confirm-button' 
        }
      });
      txt.style.display='block';      
      return;
    }
    const LINEA_ESTADO_INICIAL = lineasTxt[2];
    const regexI = /^i\s*=\s*[A-Z0-9]$/;
    if(!regexI.test(LINEA_ESTADO_INICIAL)){
      Swal.fire({
        title: 'Error!',
        html: 'Problema con el formato de entrada de i<br><br>' +
              'Cadena encontrada: ' + LINEA_ESTADO_INICIAL + '<br>' +
              'Formato aceptable: i = A',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
            confirmButton: 'custom-confirm-button' 
        }
      });
      txt.style.display='block';
      return;
    }
    const ESTADOS_ACEPTACION_LINEA = lineasTxt[3];
    const regexA = /^A\s*=\s*\{([A-Z0-9]+(,[A-Z0-9]+)*)\}$/;
    if(!regexA.test(ESTADOS_ACEPTACION_LINEA)){
      Swal.fire({
        title: 'Error!',
        html: 'Problema con el formato de entrada de A<br><br>' +
              'Cadena encontrada: ' + ESTADOS_ACEPTACION_LINEA + '<br>' +
              'Formato aceptable: A = {A,B}',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
            confirmButton: 'custom-confirm-button' 
        }
      });
      txt.style.display='block';      
      return;
    }
    const LINEA_TRANSICIONES = lineasTxt[4];
    const regexW = /^w\s*=\s*\{(\((\d+|[A-Z]),[a-z0-9]+,(\d+|[A-Z])\)(;\((\d+|[A-Z]),[a-z0-9]+,(\d+|[A-Z])\))*)\}$/;
    if(!regexW.test(LINEA_TRANSICIONES)){
      Swal.fire({
        title: 'Error!',
        html: 'Problema con el formato de entrada de w<br><br>' +
              'Cadena encontrada: ' + LINEA_TRANSICIONES + '<br>' +
              'Formato aceptable: w={(A,a,B);(A,a,A);(A,b,A);(B,a,B);(B,b,A)}',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
            confirmButton: 'custom-confirm-button' 
        }
      });
      txt.style.display='block';
      return;
    }
      const Q = await LIMPIARCOMA(LINEA_ESTADOS);
      const Z = await LIMPIARCOMA(LINEA_ALFABETO);
      const arri = LINEA_ESTADO_INICIAL.split('=');
      const i = arri[1].trim();
      if(!Q.some(e => e.includes(i))){
        Swal.fire({
          title: 'Error!',
          html: 'El estado inicial no es ninguno de los estados definidos en Q<br><br>',      
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: {
              confirmButton: 'custom-confirm-button' 
          }
        });
        txt.style.display='block';

        
        return;
      }
      const duplicidadQ = await arrDuplicidad(Q);
      const duplicidadZ = await arrDuplicidad(Z);

      if(duplicidadQ){
        Swal.fire({
          title: 'Error!',
          html: 'Existen uno o mas estados duplicados en Q<br><br>',      
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: {
              confirmButton: 'custom-confirm-button' 
          }
        });
        txt.style.display='block';

        return;
      }
      if(duplicidadZ){
        Swal.fire({
          title: 'Error!',
          html: 'Existen uno o más elementos del alfabeto duplicados<br><br>',      
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: {
              confirmButton: 'custom-confirm-button' 
          }
        });
        txt.style.display='block';

        
        return;
      }
      const A = await LIMPIARCOMA(ESTADOS_ACEPTACION_LINEA);
      let verificaAEnQ = await validarEstados(Q,A);
      
      const duplicidadA = await arrDuplicidad(A);
      if(duplicidadA){
        Swal.fire({
          title: 'Error!',
          html: 'Existen uno o mas estados de aceptación duplicados<br><br>',      
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: {
              confirmButton: 'custom-confirm-button' 
          }
        });
        txt.style.display='block';

        
        return;
      }

      if(!verificaAEnQ){
        Swal.fire({
          title: 'Error!',
          html: 'Alguno de los estados de aceptación no se encuentra definido en los estados Q<br><br>',      
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: {
              confirmButton: 'custom-confirm-button' 
          }
        });
        txt.style.display='block';

        
        return;                
      }
      const W = await LIMPIARW(LINEA_TRANSICIONES);
      let tA = A.length;
      let tQ = Q.length;
      let tZ = Z.length;
      let max_vector_row = Math.max(tA,tQ,tZ);
      agregarFilasVector(A,'bodyEstadosAceptacion',max_vector_row);
      agregarFilasVector(Q,'tbodyQ',max_vector_row);
      agregarFilasVector(Z,'tbodyZ',max_vector_row);
      zAMatriz(Z,'alfabeto');
      let errmat = await imprimirMatriz(Q,Z,W);
      if(errmat == 'error'){
        txt.style.display='block';

        
        return;
      }
      vectorEstadosAceptacion.style.display='block';
      vectorEstados.style.display='block';
      vectorAlfabeto.style.display='block';
      txt.style.display='block';
      
      matTransicion.style.display='block';

    document.getElementById('carga-archivo-form').style.display = 'none';
  };

  contenidoArchivo.readAsText(archivo); 
}

async function LIMPIARCOMA(str){
  const contenido = str.match(/\{([^}]*)\}/)[1];
  const arrayElementos = contenido.split(',');
  return arrayElementos;
}

async function LIMPIARW(str) {
  const match = str.match(/\{([^}]*)\}/);

  if (match && match[1].trim() !== "") {
    const contenido = match[1].trim(); 
    const arrayElementos = contenido.split(';').map(e => e.trim());

    return arrayElementos;
  } else {
    return [];
  }
}


function agregarFilasVector(vector, tbodyV,tvector) {
  let rows = tvector;
  const tbody = document.getElementById(tbodyV);
  for (let i = 0; i < vector.length; i++) {
    let tr1 = document.createElement('tr');
    let th1 = document.createElement('th');
    th1.textContent = vector[i];
    tr1.appendChild(th1);
    tbody.appendChild(tr1);
    rows--;
  }
  if(rows>0){
    for (let i = 0; i < rows; i++) {
      let tr1 = document.createElement('tr');
      let th1 = document.createElement('th');
      th1.textContent = '\u00A0';
      tr1.appendChild(th1);
      tbody.appendChild(tr1);
    }
  }
}

function zAMatriz(alfabeto, trA) {
  const tr = document.getElementById(trA);
  for (let i = 0; i < alfabeto.length; i++) {
    let th1 = document.createElement('th');
    th1.setAttribute('class','table-active')
    th1.textContent = alfabeto[i];
    tr.appendChild(th1);
  }

}


async function imprimirMatriz(estados,alfabeto,transiciones){
  let errorTransicion= 0;
  const tbody = document.getElementById('matrix');
  for(let i = 0; i<estados.length;i++) {
    let tr = document.createElement('tr');
    tr.id = `row-${i}`;
    let th1 = document.createElement('th');
    th1.textContent = estados[i];
    tr.appendChild(th1);
    for (let j = 0; j < alfabeto.length; j++) {
      let transition ='';
      transiciones.forEach(e => {
        let [current_status, element, next_status] = e.replace(/[()]/g, '').split(',');
        let exist_current_status = estados.some(e => e.includes(current_status));
        let exist_element = alfabeto.some(e => e.includes(element));
        let exist_next_status = estados.some(e => e.includes(next_status));
        
        if (!exist_current_status || !exist_element || !exist_next_status) {
          errorTransicion++;
        }
        
        if(current_status == estados[i]){
          if(alfabeto[j] == element){
            transition+=next_status;
          }
        }
      });
      if(transition != ''){
        let jointransition = transition.split('').sort().join(',');
        let th1 = document.createElement('th');
        th1.textContent = jointransition;
        tr.appendChild(th1);
      }else{
        let th1 = document.createElement('th');
        th1.textContent = '\u00A0';
        tr.appendChild(th1);
      }
    }
    tbody.appendChild(tr);
  }
  if(errorTransicion>0){
    Swal.fire({
      title: 'Error!',
      html: 'Hay estados de transición que no coinciden con las definiciones de alfabeto y estados<br><br>',      
      icon: 'error',
      confirmButtonText: 'Ok',
      customClass: {
          confirmButton: 'custom-confirm-button' 
      }
    });
    return 'error';
  }
  return 'ok'
}
async function validarEstados(Q, A) {
  for (let elemento of A) {
      if (!Q.includes(elemento)) {
          return false;
      }
  }
  return true;
}


async function arrDuplicidad(arrlist) {
  return new Set(arrlist).size !== arrlist.length;
}