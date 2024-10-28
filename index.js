'use strict'

const inputArchivo = document.getElementById('archivo');
const btnEjecutar = document.getElementById('btn-ejecutar');
const txtContent = document.getElementById('txt-content');
const txtTitle = document.getElementById('txttitle'); 
const tbodyA = document.getElementById('tbodyA');
const vectorQ = document.getElementById('vectorQ');
const vectorA = document.getElementById('vectorA');
const vectorE = document.getElementById('vectorE');
const txt = document.getElementById('txt');
const btnReset = document.getElementById('reset');
const matrizTransicion = document.getElementById('matriz');
let title = '';


inputArchivo.addEventListener('change', function() {
  const archivo = inputArchivo.files[0]; 

  if (archivo) {
    const extension = archivo.name.split('.').pop().toLowerCase();
    title = 'Contenido de archivo ' + archivo.name;


    if (extension === 'txt') {
      btnEjecutar.disabled = false;
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


btnEjecutar.addEventListener('click', function () {
  event.preventDefault();
  const archivo = inputArchivo.files[0];
  const lector = new FileReader();
  txtTitle.textContent = title;

  lector.onload = async function (event) {
    txtContent.value = event.target.result; 
    const lines = txtContent.value.split('\n').map(line => line.trim());
    const QLINE = lines[0];
    const ZLINE = lines[1];
    const iLINE = lines[2];
    const ALINE = lines[3];
    const WLINE = lines[4];

    let vQ = await validaQ(QLINE);
    let vZ = await validaZ(ZLINE);
    let vI = await validaI(iLINE);
    let vA = await validaA(ALINE);
    let vW = await validaW(WLINE);

    if(vQ){
      if(vZ){
        if(vI){
          if(vA){
            if(vW){
              // Se define el vector de estados
              const Q = await LIMPIARCOMA(QLINE);
              // Se define el vector del alfabeto
              const Z = await LIMPIARCOMA(ZLINE);
              const arri = iLINE.split('=');
              // Se define el vector de estado inicial
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
                btnReset.style.display ='block';
                btnEjecutar.style.display='none';
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
                btnReset.style.display ='block';
                btnEjecutar.style.display='none';
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
                btnReset.style.display ='block';
                btnEjecutar.style.display='none';
                return;
              }
              const A = await LIMPIARCOMA(ALINE);
              let verificaAEnQ = await validarElementosQ(Q,A);
              
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
                btnReset.style.display ='block';
                btnEjecutar.style.display='none';
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
                btnReset.style.display ='block';
                btnEjecutar.style.display='none';
                return;                
              }
              const W = await LIMPIARW(WLINE);
              // console.log(A,Q,Z);
              let tA = A.length;
              let tQ = Q.length;
              let tZ = Z.length;
              let max_vector_row = Math.max(tA,tQ,tZ);
              agregarFilasVector(A,'tbodyA',max_vector_row);
              agregarFilasVector(Q,'tbodyQ',max_vector_row);
              agregarFilasVector(Z,'tbodyZ',max_vector_row);
              agregarAlfabetoMatriz(Z,'alfabeto');
              // console.log("W:", W);
              let errmat = await imprimirMatriz(Q,Z,W);
              if(errmat == 'error'){
                txt.style.display='block';
                btnReset.style.display ='block';
                btnEjecutar.style.display='none';
                return;
              }
              vectorA.style.display='block';
              vectorQ.style.display='block';
              vectorE.style.display='block';
              txt.style.display='block';
              btnReset.style.display='block';
              matrizTransicion.style.display='block';
              document.getElementById('carga-archivo-form').style.display = 'none';
            }else{
              Swal.fire({
                title: 'Error!',
                html: 'Problema con el formato de entrada de w<br><br>' +
                      'Cadena encontrada: ' + WLINE + '<br>' +
                      'Formato aceptable: w={(A,a,B);(A,a,A);(A,b,A);(B,a,B);(B,b,A)}',
                icon: 'error',
                confirmButtonText: 'Ok',
                customClass: {
                    confirmButton: 'custom-confirm-button' 
                }
              });
              txt.style.display='block';
              btnReset.style.display ='block';
              btnEjecutar.style.display='none';
            }
          }else{

            Swal.fire({
              title: 'Error!',
              html: 'Problema con el formato de entrada de A<br><br>' +
                    'Cadena encontrada: ' + ALINE + '<br>' +
                    'Formato aceptable: A = {A,B}',
              icon: 'error',
              confirmButtonText: 'Ok',
              customClass: {
                  confirmButton: 'custom-confirm-button' 
              }
            });
            txt.style.display='block';
            btnReset.style.display ='block';
            btnEjecutar.style.display='none';
          }
        }else{
          Swal.fire({
            title: 'Error!',
            html: 'Problema con el formato de entrada de i<br><br>' +
                  'Cadena encontrada: ' + iLINE + '<br>' +
                  'Formato aceptable: i = A',
            icon: 'error',
            confirmButtonText: 'Ok',
            customClass: {
                confirmButton: 'custom-confirm-button' 
            }
          });
          txt.style.display='block';
          btnReset.style.display ='block';
          btnEjecutar.style.display='none';
        }
      }else{
        Swal.fire({
          title: 'Error!',
          html: 'Problema con el formato de entrada de Z<br><br>' +
                'Cadena encontrada: ' + ZLINE + '<br>' +
                'Formato aceptable: Z={a,b}',
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: {
              confirmButton: 'custom-confirm-button' 
          }
        });
        txt.style.display='block';
        btnReset.style.display ='block';
        btnEjecutar.style.display='none';
      }
    }else{
      Swal.fire({
        title: 'Error!',
        html: 'Problema con el formato de entrada de Q<br><br>' +
              'Cadena encontrada: ' + QLINE + '<br>' +
              'Formato aceptable: Q={A,B}',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
            confirmButton: 'custom-confirm-button' 
        }
      });
      
      txt.style.display='block';
      btnReset.style.display ='block';
      btnEjecutar.style.display='none';
    }
  };

  lector.readAsText(archivo); 
});

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
    // th1.setAttribute('scope', 'row');
    th1.textContent = vector[i];
    tr1.appendChild(th1);
    tbody.appendChild(tr1);
    rows--;
  }
  if(rows>0){
    for (let i = 0; i < rows; i++) {
      let tr1 = document.createElement('tr');
      let th1 = document.createElement('th');
      // th1.setAttribute('scope', 'row');
      th1.textContent = '\u00A0';
      tr1.appendChild(th1);
      tbody.appendChild(tr1);
    }
  }
}

function agregarAlfabetoMatriz(alfabeto, trA) {
  const tr = document.getElementById(trA);
  for (let i = 0; i < alfabeto.length; i++) {
    let th1 = document.createElement('th');
    // th1.setAttribute('scope', 'row');
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
    // th1.setAttribute('scope', 'row');
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
          return; // Salir del método actual
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
        // th1.setAttribute('scope', 'row');
        th1.textContent = jointransition;
        tr.appendChild(th1);
      }else{
        let th1 = document.createElement('th');
        // th1.setAttribute('scope', 'row');
        th1.textContent = '\u00A0';
        tr.appendChild(th1);
      }
    }
    tbody.appendChild(tr);
  }
  if(errorTransicion>0){
    Swal.fire({
      title: 'Error!',
      html: 'Hay estados de transición que no coinciden con elementos del alfabeto o la definición de estados<br><br>',      
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

async function validaA(strA){
  const regex = /^A\s*=\s*\{([A-Z0-9]+(,[A-Z0-9]+)*)\}$/;
  return regex.test(strA);
}

async function validaQ(strQ){
  const regex = /^Q\s*=\s*\{([A-Z0-9]+(,[A-Z0-9]+)*)\}$/;
  return regex.test(strQ)
}

async function validaZ(strZ){
  const regex = /^Z\s*=\s*\{([^\s,{}]+(,[^\s,{}]+)*)\}$/;
  return regex.test(strZ);
}

async function validaI(strI){
  const regex = /^i\s*=\s*[A-Z0-9]$/;
  return regex.test(strI);
}

async function validaW(strW){
  const regex = /^w\s*=\s*\{(\((\d+|[A-Z]),[a-z0-9]+,(\d+|[A-Z])\)(;\((\d+|[A-Z]),[a-z0-9]+,(\d+|[A-Z])\))*)\}$/;


  return regex.test(strW);

}

async function validarElementosQ(Q, A) {
  for (let elemento of A) {
      if (!Q.includes(elemento)) {
          return false;
      }
  }
  return true;
}


async function arrDuplicidad(arr) {
  return new Set(arr).size !== arr.length;
}