// const members = data.results[0].members;
function shed(archive, condicion) {
    fetch(`https://api.propublica.org/congress/v1/113/${archive}/members.json`, {
        method: 'GET',
        headers: {
            'X-API-Key': '8JPRorAuqBaPurPgjkDLpSKOJC6FjwaUBjQclqTn'
        }
    })
    .then(res => res.json())
    .then(data =>{ 
        if(archive === 'house' && condicion === 'congressHouse'){
            main(data.results[0].members);
        }else if(archive === 'senate' && condicion === 'congressSenate'){
            main(data.results[0].members);
        }else if(archive === 'senate' && condicion === 'senate'){
            ultimasPaginas(data.results[0].members)
        }else if(archive === 'house' && condicion === 'house'){
            ultimasPaginas(data.results[0].members)
        }
    })
    .catch(error => console.log(error))
    
}



function myProgram() {
    if(document.getElementById('home')){
        leerMas(); 
    }else if(document.getElementById('congressHouse')){
        shed('house', 'congressHouse')
    }else if(document.getElementById('congressSenate')){
        shed('senate', 'congressSenate')
    }
    else if(document.title === 'Attendance - House' || document.title === 'Party loyalty - House'){
        shed('house', 'house')
    }else if(document.title === 'Attendance - Senate' || document.title === 'Party loyalty - Senate'){
        shed('senate', 'senate')
    }
    console.log()
}

myProgram()
let selectState = document.querySelector("#select-states")

// Boton read more
function leerMas(){
    let span = document.querySelector('#readMore')
    let button = document.querySelector('#button')
    button.addEventListener('click', ()=>{
        if(span.className === 'd-none'){
            span.className = 'd-inline'
            button.innerHTML = 'Read Less'
        }else{
            span.className = 'd-none'
            button.innerHTML = 'Read More'
        }
    })
}
    
function dibujarTabla(miembros) {
    var cuerpoTabla = document.querySelector("#members-data"); 
    cuerpoTabla.innerHTML = "";
    miembros.forEach(miembro => {
        const fullName = `${miembro.last_name}, ${miembro.first_name} ${miembro.middle_name || ""} `
        cuerpoTabla.innerHTML += `
        <tr><td><a class = "text-decoration-none text-info w-auto" href="${miembro.url}"> ${fullName} </a></td>
        <td>${miembro.party}</td>
        <td>${miembro.state}</td>
        <td>${miembro.seniority}</td>
        <td>${miembro.votes_with_party_pct} % </td></tr>    
      `
    })
}

function filtrarDatos(array,partidos) {
    let miembrosDatos = [];
    for (let i = 0; i < partidos.length; i++) {
        for (let x = 0; x < array.length; x++) {
            if(partidos[i] == array[x].party){
                miembrosDatos.push(array[x]);
            }
        }        
    }
    return miembrosDatos;
}

function dibujaEstados(members){
    let estados = [];
    members.forEach(miembro =>{
        if(!estados.includes(miembro.state)){
            estados.push(miembro.state);
        }
    });
    estados.sort()
    estados.forEach(estado =>{
        selectState.innerHTML += `<option value="${estado}">${estado}</option>`;
    });
}

function main(members){
    console.log(members)
    let estadistica = new Statistics(members)
    // Dibuja los estados del select
    dibujaEstados(estadistica.obtenerTodosLosMiembros());
    let arrayPartidosCheckeados = [];
    let miembrosAMostrar = [];
    let estadosFiltrados = [];
    let cont = 0;
    const form = document.getElementById('ingreso');
    // Estados
    selectState.addEventListener("change", ()=>{
        if(estadosFiltrados.length > 0){
            estadosFiltrados = [];
        }
        estadistica.filtraEstados(estadosFiltrados);
        if(!arrayPartidosCheckeados.length){
            if(!cont){
                arrayPartidosCheckeados = ['R', 'D', 'ID'];
            }
        }
        miembrosAMostrar = filtrarDatos(estadosFiltrados, arrayPartidosCheckeados);
        dibujarTabla(miembrosAMostrar);
    })
    // Partidos
    form.addEventListener("change",(event)=>{
        if(arrayPartidosCheckeados.length > 0){
            arrayPartidosCheckeados = [];
        }
        event.preventDefault();
        const arrayNodosPartidos = document.querySelectorAll('.party');
        arrayNodosPartidos.forEach(partido =>{
            if(partido.checked){
                arrayPartidosCheckeados.push(partido['id']);
                cont ++;
            }
        })
        if(!estadosFiltrados.length){
            miembrosAMostrar = filtrarDatos(members, arrayPartidosCheckeados);    
        }else{
            miembrosAMostrar = filtrarDatos(estadosFiltrados, arrayPartidosCheckeados);
        }
        dibujarTabla(miembrosAMostrar);
    })
    if(!(estadosFiltrados.length && arrayPartidosCheckeados.length)){
        dibujarTabla(estadistica.obtenerTodosLosMiembros());
    }
}

class Statistics{
    constructor(todosLosMiembros){
        this.todosLosMiembros = JSON.parse(JSON.stringify(todosLosMiembros));
    }
    diezPorciento(){
       return Math.round(((this.todosLosMiembros).length * 10) / 100);
    }
    filtraLosCeros(){
        let todosLosMiembrosFiltrados = this.todosLosMiembros.filter((member) => member.total_votes !== 0);
        return todosLosMiembrosFiltrados;
    }
    ordenaElArray(esteDato,array,condicion){
        let miembrosOrdenados = null;
        if(esteDato == 'missed_votes_pct'){
            miembrosOrdenados = array.sort((a,b) => (condicion == 'mayor')?  b.missed_votes_pct - a.missed_votes_pct : a.missed_votes_pct - b.missed_votes_pct);
        }else if(esteDato == 'votes_with_party_pct'){
            miembrosOrdenados = array.sort((a,b) => condicion == 'mayor' ?  b.votes_with_party_pct - a.votes_with_party_pct : a.votes_with_party_pct - b.votes_with_party_pct);
        }
        return miembrosOrdenados;
    }
    devuelveElDiezPorcientoDelArray(array){
        let nuevoArray = array.slice(0, this.diezPorciento());
        return nuevoArray;
    }
    conectamosConLaTablaConElId(nombreId){
        let dom =  document.getElementById(nombreId);
        return dom;
    }
    dibujaTabla(miembros, tabla, condicion){
        miembros.forEach(miembro =>{
            const cuenta = Math.round((miembro.votes_with_party_pct * miembro.total_votes) / 100);
            const fullName = `${miembro.last_name}, ${miembro.first_name} ${miembro.middle_name || ""} `;
            tabla.innerHTML += `
            <tr>
            <td><a class = "text-decoration-none text-info w-auto" href="${miembro.url}"> ${fullName}</a></td>
            <td>${(condicion === 'votes_with_party_pct')? cuenta : miembro.missed_votes}</td>
            <td>${miembro[condicion]}%</td>        
            </tr>
            `
        })
    }
    filtraEstados(array){
        this.todosLosMiembros.forEach(function(member){
            if(member.state == selectState.value){
                array.push(member);
            }
        });
    }
    obtenerTodosLosMiembros(){
        return this.todosLosMiembros;
    }
}
function primera_tabla(members){
    const partidos = ['D', 'R', 'ID'];
    let primerTabla = document.getElementById("primer-tabla")
    var totalMiembros = 0;
    partidos.forEach(partido =>{
        let miembros = filtrarDatos(members, [partido]);
        let cuentita = 0;
        miembros.forEach(member =>{
            cuentita += (member.votes_with_party_pct)
        })    
        let cuenta = 0;
        if(miembros.length){
            cuenta = (cuentita / miembros.length).toFixed(2)
        }
        let nombrePartido = "";
        if(partido == 'R'){ 
            nombrePartido = 'Republicans'
        }else if(partido == 'D'){
            nombrePartido = 'Democrats'
        }else{ 
            nombrePartido = 'Independents'
        }
        totalMiembros += miembros.length
        primerTabla.innerHTML += `
        <tr>
        <td>${nombrePartido}</td>
        <td>${miembros.length}</td>
        <td>${cuenta}%</td>
        </tr>`
    })
    primerTabla.innerHTML += `
    <tr>
        <td>Total</td>
        <td>${totalMiembros}</td>
        <td></td>
    </tr>
    `
}

function ultimasTablas(nombreDeLaTabla, ordenDeLaTabla, members) {
    let estadisticas = new Statistics(members);
    let miembrosFiltrados = estadisticas.filtraLosCeros();
    let miembrosOrdenados = null;
    if(nombreDeLaTabla == 'least-loyal' || nombreDeLaTabla == 'tercer-tabla'){
        miembrosOrdenados = estadisticas.ordenaElArray(ordenDeLaTabla, miembrosFiltrados,'menor');
    }else if(nombreDeLaTabla == 'most-loyal' || nombreDeLaTabla == 'segunda-tabla'){
        miembrosOrdenados = estadisticas.ordenaElArray(ordenDeLaTabla, miembrosFiltrados,'mayor');}
    let miembrosOrdenadosDiezPorciento = estadisticas.devuelveElDiezPorcientoDelArray(miembrosOrdenados);
    let tabla = estadisticas.conectamosConLaTablaConElId(nombreDeLaTabla);
    estadisticas.dibujaTabla(miembrosOrdenadosDiezPorciento, tabla, ordenDeLaTabla);
}

function ultimasPaginas(members) {
    primera_tabla(members);
    if(document.getElementById('segunda-tabla')){
        ultimasTablas('segunda-tabla', 'missed_votes_pct', members)
        ultimasTablas('tercer-tabla', 'missed_votes_pct',members)
    }else if(document.getElementById('most-loyal')){
        ultimasTablas('most-loyal', 'votes_with_party_pct',members)
        ultimasTablas('least-loyal', 'votes_with_party_pct',members)
    }
}
