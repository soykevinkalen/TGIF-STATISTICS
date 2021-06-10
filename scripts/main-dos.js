function main(){

    // Dibuja los estados del select
    dibujaEstados();
    
    let arrayPartidosCheckeados = [];
    let miembrosAMostrar = [];
    let estadosFiltrados = [];
    let estados = "All"
    let partidos = []
    let cont = 0;
    const form = document.getElementById('ingreso');
    let selectState = document.querySelector("#select-states")

    
    // Estados
    selectState.addEventListener("change", (e)=>{
        estados = e.target.value
    })
    
    // Partidos
    form.addEventListener("change",(e)=>{
    
    })
}

const members = data.results[0].members;

function filtraDatos(filtroEstados, filtroPartidos) {
    var mostrar = [];
    for (let i = 0; i < filtroPartidos.length; i++) {
        members.forEach(member =>{
            if(filtroPartidos[i] == member.party && filtroEstados == member.state){
                mostrar.push(member)
            }
        })
    }
    
}