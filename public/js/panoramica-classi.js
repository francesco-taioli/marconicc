var debug = true;

var arrayClassi = null;


function populate(listaClassi) {
    arrayClassi = listaClassi;
}

/**
 *
 * @param nomeClasse
 * @returns {Array|*} Studenti della classe
 */
function getStudentsOfClass(nomeClasse){
    for (var i=0; i < arrayClassi.length; i++){
        if(arrayClassi[i].nome == nomeClasse){
            return arrayClassi[i].alunni;
        }
    }
}

/**
 *
 * @param nomeClasse
 * @returns {number} Media voti della classe
 */
function getMediaOfClass(nomeClasse){
    var studentiOfClass = getStudentsOfClass(nomeClasse);
    var somma = 0;
    for (var i=0; i < studentiOfClass.length; i++){
        somma = somma + studentiOfClass[i].media_voti;
    }
    var result =  somma/studentiOfClass.length;
    var approx = result.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    return approx;
}


function getNumberOfDifferentNationalityOfClass(nomeClasse){
    var studentiOfClass = getStudentsOfClass(nomeClasse);
    //todo manca nel db il campo nazionalità
}


function getNumberOfFemmineOfClass(nomeClasse) {
    var studentiOfClass = getStudentsOfClass(nomeClasse);
    var count = 0;
    for (var i=0; i < studentiOfClass.length; i++){
        if (studentiOfClass[i].sesso == "F"){
            count += 1;
        }
    }
    return count;
}

function getStudentsNumber(nomeClasse) {
    var studentiOfClass = getStudentsOfClass(nomeClasse);
    return studentiOfClass.length;
}

function updateStatistiche(classe){

    $('#femmine'+classe).text("femmine: " + getNumberOfFemmineOfClass(classe));
    $('#media'+classe).text("media: " + getMediaOfClass(classe));
    $('#alunni'+classe).text("alunni: " + getStudentsNumber(classe));

}

/**
 *
 * @param cf
 * @param fromClass
 * @param toClass
 */
function moveStudent(cf,fromClass,toClass){

    var removedStudent = null;

    for (var i=0; i < arrayClassi.length; i++){
        if (arrayClassi[i].nome == fromClass){
            var alunni = arrayClassi[i].alunni;
            for (var j=0; i < alunni.length; j++ ){
                if (alunni[j].cf == cf){
                    removedStudent = alunni.splice( alunni.indexOf(alunni[j]) , 1 )[0];

                    if(debug){
                        console.log(fromClass);
                        console.log(getNumberOfFemmineOfClass(fromClass));
                        console.log(arrayClassi[i].alunni);
                    }

                    break;
                }
            }
            break;
        }
    }

    for (var i=0; i < arrayClassi.length; i++){
        if (arrayClassi[i].nome == toClass){
            arrayClassi[i].alunni.push(removedStudent);

            if(debug) {
                console.log(toClass);
                console.log(getNumberOfFemmineOfClass(toClass));
                console.log(arrayClassi[i].alunni);
            }

            break;
        }
    }

    updateStatistiche(fromClass);
    updateStatistiche(toClass);

}

$(document).ready(function() {
    /**
     * Richiesta ajax che compone la pagina con le classi. Inizialmente sono settate nascoste
     */
    $.ajax({
        url: '/get-classi-composte',
        data: {
            format: 'json'
        },
        error: function () {
            alert('Errore di scaricamento dei dati /get-classi-composte');
        },
        dataType: 'json',

        success: function (listaClassi) {

            populate(listaClassi);
            classi_json = listaClassi;

            for (var i = 0; i < listaClassi.length; i++) {

                var nomeClasse = listaClassi[i].nome;
                var proprieta = listaClassi[i].proprieta;
                var arrayStudenti = listaClassi[i].alunni;

                var wrapperClasse = $('<div/>', {
                    'id': nomeClasse,
                    'class': 'wrapperClasse',
                }).appendTo('#rowForInsertClasses').hide();

                $('<a/>', {
                    'class': 'item',
                    'text': nomeClasse
                }).appendTo($('#selezioneClassi'));


                var settingClasse = $('<div/>', {
                    'class': 'ui raised segment wrapperSettingClasse',
                    'html': '<a class="ui red ribbon label">' + nomeClasse + '</a>'
                }).appendTo(wrapperClasse);


                for (var prop in proprieta) {
                    if (prop != "residenza" && prop != "iniziale" && prop != "bocciati") {
                        var li = $('<div/>')
                            .attr('id',prop + nomeClasse)
                            .addClass("ui info message")
                            .text(prop + ": " + proprieta[prop])
                            .appendTo(settingClasse);
                    }
                }

                var div = $('<ul/>', {
                    'class': 'contenitoreClasse ui vertical menu'
                }).appendTo(wrapperClasse);


                for (var j = 0; j < arrayStudenti.length; j++) {
                    if (arrayStudenti[j] !== undefined) {
                        var cognomeStudente = arrayStudenti[j].cognome;
                        var nomeStudente = arrayStudenti[j].nome;
                        var cf = arrayStudenti[j].cf;

                        var tag;

                        if (arrayStudenti[j].sesso == "M") {
                            var container = $('<div/>')
                                .addClass('ui segment tooltip guys')
                                .attr('id', cf)
                                .html(cognomeStudente + " " + nomeStudente)
                        }
                        else {
                            var container = $('<div/>')
                                .addClass('ui segment tooltip girl')
                                .attr('id', cf)
                                .html(cognomeStudente + " " + nomeStudente)
                        }
                        if (arrayStudenti[j].tag != null) {
                            //contiene il tag studente
                            tag = $('<div/>')
                                .addClass('floating ui grey  label')
                                .html(arrayStudenti[j].tag)
                                .appendTo(container)
                        }
                        //tooltip
                        var tooltip = $('<span/>')
                            .addClass('tooltiptext')
                            .html('Media : ' + arrayStudenti[j].media_voti)
                            .appendTo(container);

                        var li = $('<li/>')
                            .html(container)
                            .appendTo(div);
                    }
                }
            }
            var oldList, newList, item;
            $(".contenitoreClasse").sortable({
                connectWith: ".contenitoreClasse",
                start: function (event, ui) {
                    item = ui.item;
                    newList = oldList = ui.item.parent().parent();
                },
                stop: function (event, ui) {
                    var cf_studente_spostato = item[0].childNodes[0].id;
                    var classFrom = oldList.attr('id');
                    var classTo = newList.attr('id');

                    moveStudent(cf_studente_spostato,classFrom,classTo);

                },
                change: function (event, ui) {
                    if (ui.sender) newList = ui.placeholder.parent().parent();
                }
            }).disableSelection();
        },
        type: 'GET'
    });


    /**
     * Osservatore per gestire la visualizzazione delle classi
     */
    $('#selezioneClassi')
        .on('click', '.item', function () {

            if ($(this)[0].id != "contenitoreCheckBox") { //faccio questo controllo per evitare che venga considerato click anche lo switch per mostrare le classi(ho dovuto dargli classe item se no non era in linea)
                if ($(this).hasClass('active')) {
                    $(this).removeClass('active');

                    var classe = $(this).text();

                    //nascondo l'elemento


                    //bisogna fare il controllo per quando si preme tante volte
                    $('#' + classe).hide();

                } else {
                    $(this).addClass('active');
                    var classe = $(this).text();

                    //visualizzo l'elemento
                    $('#' + classe).show();
                }
                //attivo il doppio scroll che non funziona bisognerà indagare
                $('#wrapper').doubleScroll();
            }
        });

    /**
     * Osservatore per gestire il visualizzza tutto
     */
    $('#checkBox').checkbox({
        onChecked: function () {
            //visualizzo tutto lasciando in selezione gli altri item
            $('.wrapperClasse').show();
        },
        onUnchecked: function () {
            //prima di pulire tutto controllo gli item già attivi per portare alla situazione precendente le visualizzazioni
            $('#selezioneClassi > .item').each(function (i, obj) {
                if (!$(this).hasClass('active')) {
                    try {
                        var id = $(this).text();
                        $('#' + id).hide();
                    } catch (e) {
                        //mi serviva per fare il controllo perchè il riquadro attorno allo switch viene considerato active allora passa l'id ma va in eccezione perchè non si riferisce a nessuna classe
                    }

                }

            });
        }

    });

});