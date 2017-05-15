var debug = false;
var saveRealTimeOnDb = true;


var barChartArray = [];//reference to barChart
var pieChartArray = [];//reference to pieChart

//FILTER
var votiCheckBoxArray = []; //array for filter voto
var arrayStudentiVoti = [];
var nazionalitaCheckBoxArray = [];//array for filter nazionalità
var desiderataNonRispettato = false;
var desiderataNotRespectedItems = [];
var bocciati = false;
var bocciatiItems = [];
var nazionalitaItems = [];


//chart
var informationArray = [];//reference to information
var cfArray = []; //serve per i desiderata e per non rompere i coglioni
var arrayClassi = null;
var iconJson = {
    'media': {
        'color': 'floating mini ui green label',
        'icon': 'write icon'
    },
    'bocciati': {
        'color': 'floating mini ui red label',
        'icon': 'configure icon'
    },
    'alunni': {
        'color': 'floating mini ui blue  label',
        'icon': 'student icon'
    }

};


var flagJson = {
    ITALIANA: {iso: 'it', color: '#16db60'},
    CINGALESE: {iso: 'lk', color: '#609C35'},
    BANGLADESE: {iso: 'bd', color: '#B18F3C'},
    ROMENA: {iso: 'ro', color: '#A03753'},
    CINESE: {iso: 'cn', color: '#5C368D'},
    MAROCCHINA: {iso: 'ma', color: '#008b8b'},
    PARAGUAIANA: {iso: 'py', color: '#C05F30'},
    TUNISINA: {iso: 'tn', color: '#122D85'},
    FILIPPINA: {iso: 'ph', color: '#bdb76b'},
    ALBANESE: {iso: 'al', color: '#556b2f'},
    MOLDAVA: {iso: 'md', color: '#d90368'},
    LETTONE: {iso: 'lv', color: '#e9967a'},
    BRASILIANA: {iso: 'br', color: '#2e294e'},
    NIGERIANA: {iso: 'ng', color: '#ffd400'},
    GHANESE: {iso: 'gh', color: '#f0e68c'},
    PERUVIANA: {iso: 'pe', color: '#a99985'},
    CUBANA: {iso: 'cu', color: '#2F3F73'},
    CROATA: {iso: 'hr', color: '#048ba8'},
    SENEGALESE: {iso: 'sn', color: '#a4036f'}
};


function populate(listaClassi) {
    arrayClassi = listaClassi;
}

/**
 * @param nomeClasse
 * @returns {{}} oggetto che rappresenta la situazione stranieri nella classe
 */
function getNationalityOfClass(nomeClasse) {
    var alunni = getStudentsOfClass(nomeClasse);

    var nazionalita = {};
    for (var i = 0; i < alunni.length; i++) {
        nazionalita[alunni[i].nazionalita] = 0;
    }

    for (var prop in nazionalita) {
        for (i = 0; i < alunni.length; i++) {
            if (alunni[i].nazionalita == prop) {
                nazionalita[prop] += 1;
            }
        }
    }
    return nazionalita;
}

/**
 *
 * @param a
 * @param b
 * @returns {number}
 */
function compare(a, b) {
    if (a.cognome < b.cognome)
        return -1;
    if (a.cognome > b.cognome)
        return 1;
    return 0;
}


/**
 *
 * @param nomeClasse
 * @returns {Array|*} Studenti della classe
 */
function getStudentsOfClass(nomeClasse) {
    for (var i = 0; i < arrayClassi.length; i++) {
        if (arrayClassi[i].nome == nomeClasse) {
            return arrayClassi[i].alunni;
        }
    }
}

/**
 * ritorna un json con il numero dei voti di una classe
 * {
 *  6:3,
 *  7:8,
 *  8:2....}
 * @param className
 */
function numerOfVotiOfClass(className) {
    for (var i = 0; i < arrayClassi.length; i++) {
        if (arrayClassi[i].nome == className) {
            var jsonVoti = {};
            for (var studenti = 0; studenti < arrayClassi[i].alunni.length; studenti++) {
                var voto = arrayClassi[i].alunni[studenti].voto;
                if (jsonVoti[voto] === undefined) jsonVoti[voto] = 1;
                else jsonVoti[voto] = jsonVoti[voto] + 1;
            }
        }
    }
    if (debug) {
        console.log(className + "json voti->");
        console.log(jsonVoti);
    }

    if (jsonVoti[6] === undefined) jsonVoti[6] = 0;
    if (jsonVoti[7] === undefined) jsonVoti[7] = 0;
    if (jsonVoti[8] === undefined) jsonVoti[8] = 0;
    if (jsonVoti[9] === undefined) jsonVoti[9] = 0;
    if (jsonVoti[10] === undefined) jsonVoti[10] = 0;

    return jsonVoti;
}


/**
 * ritorna un json con il numero dei voti di tutte le prime
 * {
 *  6:3,
 *  7:8,
 *  8:2....}
 */
function totalVotiOfAllClass() {
    var jsonVoti = {};
    for (var i = 0; i < arrayClassi.length; i++) {
        for (var studenti = 0; studenti < arrayClassi[i].alunni.length; studenti++) {
            var voto = arrayClassi[i].alunni[studenti].voto;
            if (jsonVoti[voto] === undefined) jsonVoti[voto] = 1;
            else jsonVoti[voto] = jsonVoti[voto] + 1;
        }

    }
    return jsonVoti;
}


/**
 * return the number of student of one class
 * @param className
 */
function totalNumberOfStudent(className) {
    for (var i = 0; i < arrayClassi.length; i++) {
        if (arrayClassi[i].nome == className) {
            return arrayClassi[i].alunni.length;
        }
    }
}

/**
 * return the number of student of all class
 */
function totalNumberOfStudentOfAllClass() {
    var number = 0;
    for (var i = 0; i < arrayClassi.length; i++) {
        number += arrayClassi[i].alunni.length;
    }
    return number;
}

function approxNum(num) {
    try {
        return num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    } catch (e) {
        console.log(e);
        return num;
    }


}

/**
 * update a  pie chart for a specific chart
 * @param newClassName
 */
function updateChartPie(className) {
    var position = className[1].charCodeAt(0) - 65;//65 is the first ASCII letter
    var chart = pieChartArray[position];

    var stranieri = getNationalityOfClass(className);
    var labels = [];
    var data = [];


    for (var prop in stranieri) {
        labels.push(flagTag(prop));
        data.push(stranieri[prop]);
    }

    var colorArray = getColorOfNationalitiesByLabelArray(labels);

    chart.data.datasets[0].data = data;
    chart.data.datasets[0].hoverBackgroundColor = colorArray;
    chart.data.datasets[0].backgroundColor = colorArray;
    chart.data.labels = labels;
    chart.update();
}


/**
 * update a  bar chart for a specific chart
 * @param newClassName
 */
function updateChartBar(newClassName) {
    //json voti di questa classe
    var jsonVoti = numerOfVotiOfClass(newClassName);
    var position = newClassName[1].charCodeAt(0) - 65;//65 is the first ASCII letter
    var barChart = barChartArray[position];
    var numerOfStudent = totalNumberOfStudent(newClassName);
    barChart.data.datasets[0].data[0] = approxNum((jsonVoti[6] / numerOfStudent) * 100);
    barChart.data.datasets[0].data[1] = approxNum((jsonVoti[7] / numerOfStudent) * 100);
    barChart.data.datasets[0].data[2] = approxNum((jsonVoti[8] / numerOfStudent) * 100);
    barChart.data.datasets[0].data[3] = approxNum((jsonVoti[9] / numerOfStudent) * 100);
    barChart.data.datasets[0].data[4] = approxNum((jsonVoti[10] / numerOfStudent) * 100);
    barChart.update();
}


/**
 * count bocciati of one class
 * @param className
 * @returns {number}
 */
function countBocciatiOfClass(className) {
    var bocciati = 0;
    for (var i = 0; i < arrayClassi.length; i++) {
        if (arrayClassi[i].nome == className) {
            for (var studente = 0; studente < arrayClassi[i].alunni.length; studente++) {
                if (arrayClassi[i].alunni[studente].classe_precedente != "") bocciati += 1;
            }
        }
    }
    return bocciati;
}

/**
 * ritorna un json con le proprietà
 * @param nomeClasse
 * @returns {{}}
 */
function createProprietaForASpecificClass(className) {
    var prop = {};
    for (var i = 0; i < arrayClassi.length; i++) {
        if (arrayClassi[i].nome == className) {
            prop['alunni'] = arrayClassi[i].alunni.length;
            prop['media'] = getMediaOfClass(arrayClassi[i].nome);
            prop['bocciati'] = countBocciatiOfClass(className);
            return prop;
        }
    }

}
/**
 *
 * @param nomeClasse
 * @returns {number} Media voti della classe
 */
function getMediaOfClass(nomeClasse) {
    var studentiOfClass = getStudentsOfClass(nomeClasse);
    var somma = 0;
    for (var i = 0; i < studentiOfClass.length; i++) {
        somma = somma + studentiOfClass[i].voto;
    }
    var result = somma / studentiOfClass.length;
    var approx = approxNum(result);
    return approx;
}


function getVotesDistributionOfClass(nomeClasse) {
    var jsonVoti = null;

    var alunni = getStudentsOfClass(nomeClasse);

    for (var i = 0; i < alunni.length; i++) {
        var voto = alunni[i].voto;

        if (jsonVoti[voto] === undefined) {
            jsonVoti[voto] = 1;

        } else {
            jsonVoti[voto] = jsonVoti[voto] + 1;
        }
    }
    return jsonVoti;
}

/**
 *
 * @param nomeClasse
 * @returns {number}
 */
function getNumberOfFemmineOfClass(nomeClasse) {
    var studentiOfClass = getStudentsOfClass(nomeClasse);
    var count = 0;
    for (var i = 0; i < studentiOfClass.length; i++) {
        if (studentiOfClass[i].sesso == "F") {
            count += 1;
        }
    }
    return count;
}

/**
 *
 * @param nomeClasse
 * @returns {Number}
 */
function getStudentsNumber(nomeClasse) {
    var studentiOfClass = getStudentsOfClass(nomeClasse);
    return studentiOfClass.length;
}

function displayAllClass() {
    //visualizzo tutto lasciando in selezione gli altri item
    $('.wrapperClasse').show();
    //attivo il doppio scroll che non funziona bisognerà indagare
    $('#wrapper').doubleScroll()
}

/**
 * crea il box delle informazioni per ogni classe
 */
function createBoxInformazioni(wrapperClasse, nomeClasse) {

    var proprieta = createProprietaForASpecificClass(nomeClasse);
    var array = [];
    var container = $('<div/>')
        .css(
            {
                'text-align': 'center',
                'bottom': '10px',
                'position': 'absolute',
                'left': '20%'
            })
        .appendTo(wrapperClasse);
    for (var prop in proprieta) {


        var menu = $('<div/>')
            .addClass('ui compact menu mini')
            .appendTo(container);

        var item = $('<a/>')
            .addClass('item')
            .appendTo(menu);

        var studentIcon = $('<i/>')
            .addClass(iconJson[prop].icon)
            .appendTo(item);

        var floatingMenu = $('<div/>')
            .addClass(iconJson[prop].color)
            .appendTo(item);

        var reference = prop;
        var value = $('<p/>',
            {
                'id': prop + '-' + nomeClasse
            })
            .html(proprieta[prop])
            .appendTo(floatingMenu);

        array.push(value);
    }
    informationArray.push(array);
}

/**
 * update the information of a specific class
 * @param className
 */
function updateInformation(className) {
    var proprieta = createProprietaForASpecificClass(className);
    for (var i = 0; i < arrayClassi.length; i++)

        if (arrayClassi[i].nome == className) {
            informationArray[i][0].html(proprieta["alunni"]);
            informationArray[i][1].html(proprieta["media"]);
            informationArray[i][2].html(proprieta["bocciati"]);
        }
}

/**
 * ritorna il cf di uno studente
 * @param cf : cf da controllare
 */
function getAlunnoDesiderataByCF(cf) {
    for (var i = 0; i < arrayClassi.length; i++) {
        for (var studente = 0; studente < arrayClassi[i].alunni.length; studente++) {
            if (arrayClassi[i].alunni[studente].desiderata == cf)
                return arrayClassi[i].alunni[studente].cf;
        }

    }
}

/**
 * ritorna uno studente da un cf
 * @param cf
 * @returns {string}
 */
function getStudentByCF(cf) {
    for (var i = 0; i < arrayClassi.length; i++) {
        for (var studente = 0; studente < arrayClassi[i].alunni.length; studente++) {
            if (arrayClassi[i].alunni[studente].cf == cf)
                return arrayClassi[i].alunni[studente].nome + " " + arrayClassi[i].alunni[studente].cognome;
        }
    }
}

/**
 * return classname of the student
 * @param stundentCf
 */
function getClassNameFromStudent(stundentCf) {
    for (var i = 0; i < arrayClassi.length; i++) {
        for (var studente = 0; studente < arrayClassi[i].alunni.length; studente++) {
            if (arrayClassi[i].alunni[studente].cf == stundentCf)
                return arrayClassi[i].nome;
        }
    }
}

/**
 * save movements to db
 * if savehistory is true,  also save history
 * @param cf
 * @param fromClass
 * @param toClass
 * @param saveHistory
 */
function saveStudentMovementOnDb(cf, fromClass, toClass, saveHistory, anno_scolastico) {

    var jsonToSend = {
        cf: cf,
        fromClass: fromClass,
        toClass: toClass,
        id_utente: null,//todo:insert id_utente
        anno_scolastico: anno_scolastico,
        saveHistory: saveHistory

    };

    if (saveRealTimeOnDb) {
        $.ajax({
            type: "POST",
            url: "/move-student",
            data: jsonToSend,
            success: function (data) {

            },
            error: function (errMsg) {
                alertify.error('Opss, ci deve essere stato un problema');
            }
        });
    }
}

/**
 *
 * @param cf
 * @param fromClass
 * @param toClass
 * @param saveHistory : salva nella history
 */
function moveStudent(cf, fromClass, toClass, saveHistory) {

    var removedStudent = null;
    var anno_scolastico = null;

    for (var i = 0; i < arrayClassi.length; i++) {
        if (arrayClassi[i].nome == fromClass) {
            var alunni = arrayClassi[i].alunni;
            for (var j = 0; i < alunni.length; j++) {
                if (alunni[j].cf == cf) {
                    removedStudent = alunni.splice(alunni.indexOf(alunni[j]), 1)[0];
                    anno_scolastico = removedStudent.anno_scolastico;
                    if (debug) {
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

    for (var i = 0; i < arrayClassi.length; i++) {
        if (arrayClassi[i].nome == toClass) {
            arrayClassi[i].alunni.push(removedStudent);

            if (debug) {
                console.log(toClass);
                console.log(getNumberOfFemmineOfClass(toClass));
                console.log(arrayClassi[i].alunni);
            }

            break;
        }
    }

    saveStudentMovementOnDb(cf, fromClass, toClass, saveHistory,anno_scolastico);
    updateChartBar(toClass);//refresh the new chart
    updateChartBar(fromClass); //refresh the old chart
    updateInformation(toClass);
    updateInformation(fromClass);
    updateChartPie(toClass);
    updateChartPie(fromClass);
}


function getColorOfNationalitiesByLabelArray(label) {
    var colorArray = []
    for (var iso in label) {
        var nazionalita = nazionalitaByTag(label[iso]);
        colorArray.push(flagJson[nazionalita].color);
    }
    return colorArray;

}

/**
 * create dinamyc style for nazionalita filter
 */
function createDynamicStyle() {


    jQuery.each(flagJson, function (i, val) {
        $('<style>.' + i + '{' +
            'border-color:' + val.color + '!important;' +
            'border-style: solid!important;;' +
            'border-width: 5px!important;;}</style>')
            .appendTo('head');
    });

}
/**
 * create dynamic menu of nazionalita
 */
function createNazionalitaMenu() {

    jQuery.each(flagJson, function (i, val) {
        var item = $('<div/>')
            .addClass('item')
            .addClass('temp');

        var containerInput = $('<div/>')
            .addClass('ui child  checkbox nazionalita')
            .appendTo(item);

        var input = $('<input/>', {
            name: i,
            type: 'checkbox',
            align: 'left'
        }).appendTo(containerInput);

        var a = $('<a/>').addClass('ui mini label')
            .html(i)
            .css(
                {
                    'background-color': '#' + val.color,
                    'color': 'white'
                });

        var label = $('<label/>')
            .html(a)
            .appendTo(containerInput);
        item.appendTo('#nazionalita-menu');
    });

}

/**
 * Data una nazionalità in italiano maiuscolo torna il codice iso relativo alla bandiera
 * @param nazionalita
 * @returns {*}
 */
function flagTag(nazionalita) {
    return flagJson[nazionalita].iso;
}

/**
 * Funzione che dato il codice iso della bandiera torna la nazionalità
 * @param tag
 * @returns {*}
 */
function nazionalitaByTag(tag) {
    for (var prop in flagJson) {
        if (flagJson[prop].iso == tag) {
            return prop;
        }
    }
}

function setFilterVoti(voto, elemento) {
    //trasformo il voto da intero a string
    var votoString = votoIntegerToDecimal(voto);
    $(elemento).addClass(votoString);
}

function setFilterBocciati(elemento) {
    elemento.addClass("bocciato");
}

function setFilterNazionalita(elemento) {
    elemento.addClass(elemento.attr('data-content'));
}

/**
 * toglie tutti i filtri
 */
function disableAllFilter() {
    //remove voto
    //trasformo il voto da intero a string
    for (var voto = 0; voto < votiCheckBoxArray.length; voto++) {
        var votoString = votoIntegerToDecimal(votiCheckBoxArray[voto]);
        $('.' + votiCheckBoxArray[voto]).each(function (index, element) {
            $(element).removeClass(votoString);
        });
    }

    for (var nazionalita = 0; nazionalita < nazionalitaItems.length; nazionalita++) {
        $(nazionalitaItems[nazionalita]).removeClass(nazionalitaItems[nazionalita].attr('data-content'));
    }

    for (var desiderata = 0; desiderata < desiderataNotRespectedItems.length; desiderata++) {
        $(desiderataNotRespectedItems[desiderata]).children('.popuptext').remove();
    }

    for (var bocciati = 0; bocciati < bocciatiItems.length; bocciati++) {
        $(bocciatiItems[bocciati]).removeClass("bocciato");
    }

}

/**
 * ritorna true se uno studente ha un desiderata
 * @param studentCf
 */
function hasDesiderata(studentCf) {
    for (var i = 0; i < arrayClassi.length; i++) {
        for (var studente = 0; studente < arrayClassi[i].alunni.length; studente++) {
            if (arrayClassi[i].alunni[studente].cf == studentCf) {
                if (arrayClassi[i].alunni[studente].desiderata != "")return true;
                else return false;
            }

        }
    }
}

/**
 * ritorna true se non è rispettato la richiesta desiderata
 * @param elemento
 */
function getDesiderataNonRispettato(elemento) {
    var cf = $(elemento).attr("id"); //cf dell'alunno selezionato
    if (cf == "CNTSML03B28L781K") {
        var a = 3;
    }
    if (hasDesiderata(cf)) {
        //verifico che la richiesta sia reciproca
        var cfAmico = getAlunnoDesiderataByCF(cf);
        if (cfAmico != undefined) {
            var classe1 = getClassNameFromStudent(cf);
            var classeAmico = getClassNameFromStudent(cfAmico);
            if (classe1 != classeAmico)return true;
            else return false;
        }
    }
    else {
        return false;
    }
}

function setFilterDesiderataNonRispettato(container) {
    if (container === undefined) {

        $('.ui.segment.tooltip').each(function (index, element) {
            var cf = $(element).attr("id"); //cf dell'alunno selezionato
            var cfAmico = getAlunnoDesiderataByCF(cf);
            if (cfAmico != undefined) {
                var classe1 = getClassNameFromStudent(cf);
                var classeAmico = getClassNameFromStudent(cfAmico);
                var nomealunno = getStudentByCF(cf);
                var nomeAlunnoAmico = getStudentByCF(cfAmico);
                if (classe1 != classeAmico) {


                    var text = 'Vuole stare con ' + nomeAlunnoAmico + ' che è nella ' + classeAmico;
                    var span = $('<span/>')
                        .html(text)
                        .addClass('popuptext');

                    span.appendTo($(container));
                    span.toggleClass("show");

                    $(container).mouseover(function () {
                        span.removeClass('show');
                    });

                }
            }


        });
    }
    else {
        var cf = $(container).attr("id"); //cf dell'alunno selezionato
        var cfAmico = getAlunnoDesiderataByCF(cf);
        if (cfAmico != undefined) {
            var classe1 = getClassNameFromStudent(cf);
            var classeAmico = getClassNameFromStudent(cfAmico);
            var nomealunno = getStudentByCF(cf);
            var nomeAlunnoAmico = getStudentByCF(cfAmico);
            if (classe1 != classeAmico) {

                var text = 'Vuole stare con ' + nomeAlunnoAmico + ' che è nella ' + classeAmico;
                var span = $('<span/>')
                    .html(text)
                    .addClass('popuptext');

                span.appendTo($(container));
                span.toggleClass("show");
                $(container).mouseover(function () {
                    span.removeClass('show');
                });

            }
        }
    }
}
/**
 * ritorna in oggetto con le infromazioni dello sudente
 * @param cf
 */
function getStudentObject(cf) {
    for (var i = 0; i < arrayClassi.length; i++) {
        for (var studente = 0; studente < arrayClassi[i].alunni.length; studente++) {
            if (arrayClassi[i].alunni[studente].cf == cf)
                return arrayClassi[i].alunni[studente];
        }
    }
}

/**
 * nomeClasse: {"name": nomeClasse}
 */
function returnJsonOfClassName() {
    var classNames = {};
    for (var i = 0; i < arrayClassi.length; i++) {
        classNames[arrayClassi[i].nome] = {"name": arrayClassi[i].nome}
    }
    return classNames
}

/**
 * sposta lo studente in una classe utilizzando il contex menu
 */
function moveStudentFromContextMenu(classTo, studente) {
    var cf = studente.cf;
    var classFrom = getClassNameFromStudent(cf);

    //student moved in array classi - data is update
    moveStudent(cf, classFrom, classTo, true);
    updateStudentGUI(cf, classFrom, classTo);


}

/**
 * aggiorna la grafica di uno studente
 * usata ad esemio nel context menu e nella history
 * ricolloca lo studente in una classe nuova
 * @param cf
 * @param classFrom
 * @param classTo
 */
function updateStudentGUI(cf, classFrom, classTo) {
    var studente = getStudentObject(cf);
    //update gui - remove from old class
    var studentDiv = $('div[id=' + cf + ']');
    //create ui-sortable-handle
    var li = $('<li/>')
        .addClass('ui-sortable-handle');

    //delete context menu
    studentDiv.parent('.ui-sortable-handle').remove()
    studentDiv.remove();
    //append student div
    studentDiv.appendTo(li);

    //wrapperClasse div and it's child
    //here i have the student of classTO
    var classToContainer = $('div.wrapperClasse[id=' + classTo + ']').children('ul');
    //i choose the position to append the student in alphabetical order
    classToContainer.children('li').each(function (index, element) {
        //check the value of ascci of the student's cf
        //studente va prima di quelli gia messi nella classe
        if (studente.cognome.charCodeAt(0) < $(element).children('div').attr("cognome")[0].charCodeAt(0) || cf.charCodeAt(0) == $(element).children('div').attr("cognome")[0].charCodeAt(0)) {
            // append li  to classContainer
            li.insertBefore(classToContainer.children('li')[index]);
            return false;
        }


    });
}

function populateModal(object) {
    $("#nome-cognome").text(object.cognome + " " + object.nome);
    $("#nazionalita").text(object.nazionalita);
    $("#sesso").text(object.sesso);

    $("#cap").text(object.CAP);
    $("#matricola").text(object.matricola);
    $("#codice-fiscale").text(object.cf);


    var date = object.data_di_nascita.split("-");
    var day = parseInt(date[2].split("T")[0]) + 1 + "";
    var month = date[1];
    var year = date[0];
    var finalDate = day + '/' + month + '/' + year;
    $("#data-di-nascita").text(finalDate);


    //table
    $("#classe-precedente").text(object.classe_precedente);
    $("#media-voti").text(object.voto);
    $("#anno-scolastico").text(object.anno_scolastico);
    $("#scelta-indirizzo").text(object.scelta_indirizzo);


}

/**
 * controlla se uno studente è bocciato
 * @param cf
 */
function getIfStudentsIsBocciato(cf) {
    for (var i = 0; i < arrayClassi.length; i++) {
        for (var studente = 0; studente < arrayClassi[i].alunni.length; studente++) {
            if (arrayClassi[i].alunni[studente].cf == cf)
                return arrayClassi[i].alunni[studente].classe_precedente == "" ? false : true;
        }
    }
}

/**
 *
 * @param voto
 * @returns {string} voto in string
 */
function votoIntegerToDecimal(voto) {
    switch (voto) {
        case (6):
            return 'sei';
            break;

        case (7):
            return 'sette';
            break;

        case (8):
            return 'otto';
            break;

        case (9):
            return 'nove';
            break;

        case (10):
            return 'dieci';
            break;
    }
}


/**
 * this function set all filter on the page;
 */
function setAllFilter() {
    //TODO: SET ALL FILTER
    //vedere queli filtri sono vuoti e comportarsi di conseguenza

    //1 CASO
    //guardo se il checkbox dei voti è spuntanto,se no procedo con gli altri filtri
    if (votiCheckBoxArray.length != 0) {
        //controllo se il filtro delle nazionalità è attivo
        if (nazionalitaCheckBoxArray.length != 0) {
            //controllo se c'è il filtro desiderata
            if (desiderataNonRispettato) {
                //ci sono tutti i filtri
                //scorro tutti gli studenti
                for (var voto = 0; voto < votiCheckBoxArray.length; voto++) {
                    //todo
                }
            }
            //desiderata non è rispettato, filtro pe voto e per nazionalita
            else {

                arrayStudentiVoti = [];
                nazionalitaItems = [];

                for (var voto = 0; voto < votiCheckBoxArray.length; voto++) {
                    arrayStudentiVoti = $('.' + votiCheckBoxArray[voto]);
                    for (var nazionalita = 0; nazionalita < nazionalitaCheckBoxArray.length; nazionalita++) {
                        arrayStudentiVoti.each(function (index, element) {
                            if ($(element).attr('data-content').toLowerCase() == nazionalitaCheckBoxArray[nazionalita].toLowerCase()) {
                                setFilterVoti(votiCheckBoxArray[voto], $(element));
                                setFilterNazionalita($(element));
                                nazionalitaItems.push($(element));
                            }

                        });

                    }
                }

            }
        }
        //VOTI SI, NAZIONALITA NO
        else {
            if (desiderataNonRispettato) {

            }
            else {
                //VOTI E BOCCCIATI
                if (bocciati) {
                    arrayStudentiVoti = [];
                    for (var voto = 0; voto < votiCheckBoxArray.length; voto++) {
                        arrayStudentiVoti = $('.' + votiCheckBoxArray[voto]);
                        arrayStudentiVoti.each(function (index, element) {
                            if (getIfStudentsIsBocciato($(element).attr("id"))) {
                                setFilterVoti(votiCheckBoxArray[voto], $(element));
                                setFilterBocciati($(element));
                                bocciatiItems.push($(element));
                            }

                        });
                    }
                }
                else {
                    //ho solo i voti come filtro
                    arrayStudentiVoti = [];
                    for (var voto = 0; voto < votiCheckBoxArray.length; voto++) {
                        $('.' + votiCheckBoxArray[voto]).each(function (index, element) {
                            setFilterVoti(votiCheckBoxArray[voto], element)
                        });
                    }
                }

            }
        }
    }
    //2 CASO - VOTI NO
    else {
        //CI SONO NAZIONALITA
        if (nazionalitaCheckBoxArray.length != 0) {
            //CI SONO I FILTRI DESIDERATA
            if (desiderataNonRispettato) {
                nazionalitaItems = [];
                desiderataNotRespectedItems = [];
                for (var nazionalita = 0; nazionalita < nazionalitaCheckBoxArray.length; nazionalita++) {
                    $('.ui.segment.tooltip').each(function (index, element) {
                        var desiderata = getDesiderataNonRispettato(element);
                        if ($(element).attr('data-content').toLowerCase() == nazionalitaCheckBoxArray[nazionalita].toLowerCase() && desiderata) {
                            setFilterNazionalita($(element));
                            nazionalitaItems.push($(element));
                            setFilterDesiderataNonRispettato($(element));
                            desiderataNotRespectedItems.push($(element));
                        }

                    });

                }
            }
            //NON CI SONO FILTRI DESIDERATA
            else {
                nazionalitaItems = [];
                for (var nazionalita = 0; nazionalita < nazionalitaCheckBoxArray.length; nazionalita++) {
                    $('.ui.segment.tooltip').each(function (index, element) {
                        if ($(element).attr('data-content').toLowerCase() == nazionalitaCheckBoxArray[nazionalita].toLowerCase()) {
                            setFilterNazionalita($(element));
                            nazionalitaItems.push($(element));
                        }

                    });

                }
            }

        }
        //NON CI SONO NAZIONALITA
        else {
            //SOLO DESIDERATA
            if (desiderataNonRispettato) {
                //ANCHE BOCCIATI
                if (bocciati) {
                    $('.ui.segment.tooltip').each(function (index, element) {
                        var desiderata = getDesiderataNonRispettato(element);
                        if (desiderata && getIfStudentsIsBocciato($(element).attr("id"))) {
                            setFilterDesiderataNonRispettato($(element));
                            desiderataNotRespectedItems.push($(element));
                            setFilterBocciati($(element));
                            bocciatiItems.push($(element));
                        }

                    });
                }
                //SOLO DEISDERATA
                else {
                    $('.ui.segment.tooltip').each(function (index, element) {
                        var desiderata = getDesiderataNonRispettato(element);
                        if (desiderata) {
                            //setFilterNazionalita($(element));
                            //nazionalitaItems.push($(element));
                            setFilterDesiderataNonRispettato($(element));
                            desiderataNotRespectedItems.push($(element));
                        }

                    });

                }

            }
            else
            //SOLO BOCCIATI
            {
                if (bocciati) {
                    $('.ui.segment.tooltip').each(function (index, element) {

                        if (getIfStudentsIsBocciato($(element).attr("id"))) {
                            setFilterBocciati($(element));
                            bocciatiItems.push($(element));
                        }

                    });

                }
            }
        }
    }
}


/**
 * this function handle the checkbox for the FILTER VOTI
 */
function handleCheckBoxVoti() {
    $('.list .child.checkbox')
        .checkbox({
            // Fire on load to set parent value
            fireOnInit: true,
            // Change parent state on each child checkbox change
            onChange: function () {
                var
                    $listGroup = $(this).closest('.list'),
                    $parentCheckbox = $listGroup.closest('.item').children('.checkbox'),
                    $checkbox = $listGroup.find('.checkbox'),
                    allChecked = true,
                    allUnchecked = true
                    ;
                disableAllFilter();
                votiCheckBoxArray = [];
                // check to see if all other siblings are checked or unchecked
                $checkbox.each(function (index, element) {
                    if ($(this).checkbox('is checked')) {
                        votiCheckBoxArray.push(index + 6);

                    }
                    else {
                        allChecked = false;
                        // checkBoxArrayDisable.push(index+6);
                    }
                });
                // set parent checkbox state, but dont trigger its onChange callback
                if (allChecked) {
                    $parentCheckbox.checkbox('set checked');
                }
                else if (allUnchecked) {
                    $parentCheckbox.checkbox('set unchecked');
                }
                else {
                    $parentCheckbox.checkbox('set indeterminate');
                }
                setAllFilter();

            }
        });
}


/**
 * this function handle the checkbox for the FILTER VOTI
 */
function handleCheckBoxNazionalita() {
    $('.list .child.checkbox.nazionalita')
        .checkbox({
            // Fire on load to set parent value
            fireOnInit: true,
            // Change parent state on each child checkbox change
            onChange: function () {
                var
                    $listGroup = $(this).closest('.list'),
                    $parentCheckbox = $listGroup.closest('.item').children('.checkbox'),
                    $checkbox = $listGroup.find('.checkbox'),
                    allChecked = true,
                    allUnchecked = true
                    ;
                // check to see if all other siblings are checked or unchecked
                disableAllFilter();
                nazionalitaCheckBoxArray = [];
                var parent,
                    value;

                $checkbox.each(function (index, element) {
                    if ($(this).checkbox('is checked')) {
                        parent = $(this)[0];
                        value = parent.innerText.replace(/[^a-zA-Z0-9_ ]/g, "");
                        nazionalitaCheckBoxArray.push(value);

                    }
                    else {
                        allChecked = false;
                        //disableFilterVoti(index + 6);
                    }
                });
                // set parent checkbox state, but dont trigger its onChange callback
                if (allChecked) {
                    $parentCheckbox.checkbox('set checked');
                }
                else if (allUnchecked) {
                    $parentCheckbox.checkbox('set unchecked');
                }
                else {
                    $parentCheckbox.checkbox('set indeterminate');
                }
                setAllFilter();
            }
        });
}


function handleCheckBoxDesiderata() {
    $('.child.checkbox.desiderata')
        .checkbox({
            // Fire on load to set parent value
            fireOnInit: true,
            // Change parent state on each child checkbox change
            onChange: function () {
                var
                    $listGroup = $(this).closest('.list'),
                    $parentCheckbox = $listGroup.closest('.item').children('.checkbox'),
                    $checkbox = $listGroup.find('.checkbox'),
                    allChecked = true,
                    allUnchecked = true
                    ;
                // check to see if all other siblings are checked or unchecked
                disableAllFilter();
                desiderataNonRispettato = false;

                var parent;
                $checkbox.each(function (index, element) {
                    if ($(this).checkbox('is checked')) {
                        parent = $(this)[0];
                        if (parent.innerText != "") desiderataNonRispettato = true;

                    }
                    else {
                        allChecked = false;
                        desiderataNonRispettato = false;
                    }
                });
                // set parent checkbox state, but dont trigger its onChange callback
                if (allChecked) {
                    $parentCheckbox.checkbox('set checked');
                }
                else if (allUnchecked) {
                    $parentCheckbox.checkbox('set unchecked');
                }
                else {
                    $parentCheckbox.checkbox('set indeterminate');
                }
                setAllFilter();
            }
        });
}


function handleCheckBoxBocciati() {
    $('.child.checkbox.bocciati')
        .checkbox({
            // Fire on load to set parent value
            fireOnInit: true,
            // Change parent state on each child checkbox change
            onChange: function () {
                var
                    $listGroup = $(this).closest('.list'),
                    $parentCheckbox = $listGroup.closest('.item').children('.checkbox'),
                    $checkbox = $listGroup.find('.checkbox'),
                    allChecked = true,
                    allUnchecked = true
                    ;
                // check to see if all other siblings are checked or unchecked
                disableAllFilter();
                bocciati = false;
                bocciatiItems = [];

                var parent;
                $checkbox.each(function (index, element) {
                    if ($(this).checkbox('is checked')) {
                        parent = $(this)[0];
                        if (parent.innerText != "") bocciati = true;

                    }
                    else {
                        allChecked = false;
                        bocciati = false;
                    }
                });
                // set parent checkbox state, but dont trigger its onChange callback
                if (allChecked) {
                    $parentCheckbox.checkbox('set checked');
                }
                else if (allUnchecked) {
                    $parentCheckbox.checkbox('set unchecked');
                }
                else {
                    $parentCheckbox.checkbox('set indeterminate');
                }
                setAllFilter();
            }
        });
}


/**
 * return true if two date is the same
 * @param date
 * @param dateToCompare
 */
function isTheSameDate(date, dateToCompare) {

    if (date.getUTCDate() == dateToCompare.getUTCDate()
        && date.getMonth() + 1 == dateToCompare.getMonth() + 1
        && date.getUTCFullYear() == dateToCompare.getUTCFullYear())return true;
    else  return false;

}

/**
 * return year,month, day from a js Date
 * @param date
 */
function returnFormatDate(date) {
    var day = date.getUTCDate();
    var month = date.getMonth() + 1;
    var year = date.getUTCFullYear();
    return year + "/" + month + "/" + day;
}

/**
 * create button for one row of the table
 * handle button onclick
 * @param element
 */
function buttonRevertForHistory(element) {
    var td = $('<td/>');


    var button = $('<button/>')
        .addClass('ui labeled mini icon button')
        .html('<i class="left chevron icon"></i>Revert');
    button.appendTo(td);
    element.append(td);

    //button onclick
    button.click(function () {
        var cf = $(this).closest("tr").children().eq(1).attr('id');
        var classePrecendente = $(this).closest("tr").children("td#cp").text();
        var classeSuccessiva = $(this).closest("tr").children("td#cs").text();
        var tr = $(this).closest("tr");

        var classeAttuale = getClassNameFromStudent(cf);


        //todo
        // var closable = alertify.alert().setting('closable');
        // alertify.alert()
        //     .setting({
        //         'label':'Agree',
        //         'message': 'This dialog is : ' + (closable ? ' ' : ' not ') + 'closable.' ,
        //         'onok': function(){ alertify.success('Great');},
        //         'onclose':function(){ alertify.message('alert was closed.')}
        //     }).show();


        //remove from history
        $.ajax({
            url: '/remove-student-from-history',
            data: {"cf": cf},
            type: 'get',
            success: function (data) {
                //eliminare dalla tabella
                //la tabella ha un unico elemento
                if (tr.prev().length == 0 && tr.next('tr').length == 0) {
                    //elimino la il div title,content e la tabella
                    var divContent = tr.closest("div");
                    var divTitle = divContent.prev();
                    //remove
                    divContent.remove();
                    divTitle.remove();

                }
                else {
                    tr.remove();
                }

                //aggiorno la grafica
                try {
                    moveStudent(cf, classeSuccessiva, classePrecendente, false, getStudentObject(cf).anno_scolastico);
                    updateStudentGUI(cf, classeSuccessiva, classePrecendente);
                    alertify.success('Alunno spostato correttamente');
                }
                catch (e) {
                    alertify.error("Opps, ci deve essere stato un problema" + "\n" + e);
                }


            },

            error: function (xhr, status, error) {
                alertify.error("Opps, ci deve essere stato un problema" + "\n" + error)
            }
        });
    });

}

function history() {

    //clear modal
    $('.ui.styled.fluid.accordion').children('div').remove();
    //download history
    $.ajax({
        url: '/get-history',
        type: 'get',
        success: function (data) {
            var thead = $('<thead/>')
                .html('<tr> ' +
                    '<th>Ora</th> ' +
                    '<th>Alunno</th> ' +
                    '<th>Classe Precedente</th> ' +
                    '<th>Classe Successiva</th> ' +
                    '<th>Utente</th> ' +
                    '<th>Azione</th> ' +
                    '</tr>');

            //create accordion
            var lastDate, date, container, content, p, table, tbody, tr;
            var accordion = $('.ui.styled.fluid.accordion');
            for (var history = 0; history < data.length; history++) {
                date = new Date(data[history].timestamp);

                if (history == 0) {
                    //creo tutto
                    content = $('<div/>')
                        .addClass("content");

                    var thead = $('<thead/>')
                        .html('<tr> ' +
                            '<th>Ora</th> ' +
                            '<th>Alunno</th> ' +
                            '<th>Classe Precedente</th> ' +
                            '<th>Classe Successiva</th> ' +
                            '<th>Utente</th> ' +
                            '<th>Azione</th> ' +
                            '</tr>');

                    table = $('<table/>')
                        .addClass("ui very basic table")
                        .appendTo(content)
                        .html(thead);

                    tbody = $('<tbody/>').appendTo(table);

                    title = $('<div/>')
                        .addClass('title')
                        .html('<i class="dropdown icon"></i>' + returnFormatDate(date))
                        .appendTo(accordion);
                    content.appendTo(accordion);

                    tr = $('<tr/>');
                    var th =
                        '<th>'+ ('0' + date.getHours()).slice(-2) + ':' + ('0' + (date.getMinutes())).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2)  +'</th> ' +
                        '<td id=' + data[history].cf + '>' + getStudentByCF(data[history].cf) + '</td> ' +
                        '<td id="cp">' + data[history].classe_precedente + '</td> ' +
                        '<td id="cs">' + data[history].classe_successiva + '</td> ' +
                        '<td>' + 'root' + '</td> ';

                    tr.html(th);
                    buttonRevertForHistory($(tr));
                    tbody.append(tr).appendTo(table);

                }

                else {

                    if (isTheSameDate(date, lastDate)) {

                        tr = $('<tr/>');
                        var th =
                            '<th>'+ ('0' + date.getHours()).slice(-2) + ':' + ('0' + (date.getMinutes())).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2)  +'</th> ' +
                            '<td id=' + data[history].cf + '>' + getStudentByCF(data[history].cf) + '</td> ' +
                            '<td id="cp">' + data[history].classe_precedente + '</td> ' +
                            '<td id="cs">' + data[history].classe_successiva + '</td> ' +
                            '<td>' + 'root' + '</td> ';//todo
                        tr.html(th);
                        buttonRevertForHistory($(tr));
                        tbody.append(tr).appendTo(table);

                    }
                    else {
                        content = $('<div/>')
                            .addClass("content");

                        var thead = $('<thead/>')
                            .html('<tr> ' +
                                '<th>Ora</th> ' +
                                '<th>Alunno</th> ' +
                                '<th>Classe Precedente</th> ' +
                                '<th>Classe Successiva</th> ' +
                                '<th>Utente</th> ' +
                                '<th>Azione</th> ' +
                                '</tr>');

                        table = $('<table/>')
                            .addClass("ui very basic table")
                            .appendTo(content)
                            .html(thead);

                        tbody = $('<tbody/>').appendTo(table);

                        title = $('<div/>')
                            .addClass('title')
                            .html('<i class="dropdown icon"></i>' + returnFormatDate(date))
                            .appendTo(accordion);
                        content.appendTo(accordion);

                        tr = $('<tr/>');
                        var th =
                            '<th>'+ ('0' + date.getHours()).slice(-2) + ':' + ('0' + (date.getMinutes())).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2)  +'</th> ' +
                            '<td id=' + data[history].cf + '>' + getStudentByCF(data[history].cf) + '</td> ' +
                            '<td id="cp">' + data[history].classe_precedente + '</td> ' +
                            '<td id="cs">' + data[history].classe_successiva + '</td> ' +
                            '<td>' + data[history].id_utente + '</td> ';

                        tr.html(th);
                        buttonRevertForHistory($(tr));
                        tbody.append(tr).appendTo(table);
                    }
                }
                lastDate = date;

            }
            $('.ui.accordion').accordion();
            $('.ui.modal.history').modal('show');
        },
        error: function (xhr, status, error) {
            alertify.error('Opss, ci deve essere stato un problema');
        }
    });


}

////////////////////////////////////////////////////
//AJAX CALL//
////////////////////////////////////////////////////
// - SCARICAMENTE JSON
// - CREAZIONE BOX INFORMAZIONI
// - CREAZIONE CHART
// - INIZIALIZZAZIONE DRAG AND DROP STUDENTI
$(document).ready(function () {
    /**
     * Richiesta ajax che compone la pagina con le classi. Inizialmente sono settate nascoste
     */
    $.ajax({
        url: '/generate-classi',
        data: {
            format: 'json'
        },
        error: function () {
            alertify.error('Errore di scaricamento dei dati');
        },
        dataType: 'json',

        success: function (listaClassi) {

            //dropdown for the settings
            $('.ui.dropdown.settings').dropdown(
                {
                    action: 'nothing'
                }
            );
            $('.ui.accordion').accordion();
            handleCheckBoxVoti();
            createDynamicStyle();
            createNazionalitaMenu();
            handleCheckBoxNazionalita();
            handleCheckBoxDesiderata();
            handleCheckBoxBocciati();
            var selezioneClassi = $('#selezioneClassi');

            //handle history click
            $('#history').click(function (e) {
                history();
            });


            for (i = 0; i < listaClassi.length; i++) {
                listaClassi[i].alunni.sort(compare);
            }

            populate(listaClassi);
            for (var i = 0; i < listaClassi.length; i++) {

                var nomeClasse = listaClassi[i].nome;
                var arrayStudenti = listaClassi[i].alunni;

                var wrapperClasse = $('<div/>', {
                    'id': nomeClasse,
                    'class': 'wrapperClasse',
                }).appendTo('#rowForInsertClasses').hide();

                var classButton = $('<a/>', {
                    'class': 'item',
                    'text': nomeClasse
                });

                $('<div/>')
                    .css
                    ({
                        top: '15%',
                        position: 'relative'
                    })
                    .html(classButton)
                    .addClass('classi')
                    .appendTo(selezioneClassi);

                var settingClasse = $('<div/>', {
                    'class': 'ui raised segment wrapperSettingClasse',
                    'html': '<a class="ui red ribbon label">' + nomeClasse + '</a>' +
                    ' <div class="ui icon buttons mini">' +
                    '<button id=' + nomeClasse + 'barButton' + ' class="ui button barChartButton">' +
                    '<i class="bar chart icon"></i></button>' +
                    '<button id=' + nomeClasse + 'chartButton' + ' class="ui button pieChartButton"><i class="pie chart icon"></i></button>' +
                    '</div>'
                }).appendTo(wrapperClasse);

                var div = $('<ul/>', {
                    'class': 'contenitoreClasse ui vertical menu'
                }).appendTo(wrapperClasse);


                jsonVoti = {};
                for (var j = 0; j < arrayStudenti.length; j++) {
                    if (arrayStudenti[j] !== undefined) {
                        var cognomeStudente = arrayStudenti[j].cognome;
                        var nomeStudente = arrayStudenti[j].nome;
                        var cf = arrayStudenti[j].cf;
                        var nazionalita = arrayStudenti[j].nazionalita;
                        var desiderata = arrayStudenti[j].desiderata;
                        var voto = arrayStudenti[j].voto;


                        var iconFlagElement = "";
                        if (nazionalita != "ITALIANA") {
                            iconFlagElement = "<i class='" + flagTag(nazionalita) + " flag'></i>";
                        }

                        /////////////////////STUDENTI//////////////////
                        //CREAZIONE TAG
                        //ES : CIECO
                        //ES : DSA-> DISGRAFICO

                        //CONTROLLO ANAGRAFICA
                        //CONTROLLO DESIDERATA
                        //AGGIUGNO CLASSE VOTO

                        var tag;
                        var anagrafica = $('<p/>')
                            .addClass('roboto')
                            .html(iconFlagElement + " " + cognomeStudente + " " + nomeStudente);

                        //CREO GLI STUDENTI
                        var container;
                        if (arrayStudenti[j].sesso == "M") {
                            container = $('<div/>',
                                {
                                    'width': $(wrapperClasse).width() - 5,
                                    'height': 40,
                                    'data-content': nazionalita,
                                    'cognome': cognomeStudente,
                                    'data-variation': "tiny"

                                })
                                .addClass('ui segment tooltip guys popup-information ' + voto)
                                .attr('id', cf)
                                .html(anagrafica)
                        }
                        else {
                            container = $('<div/>',
                                {
                                    'width': $(wrapperClasse).width() - 5,
                                    'height': 40,
                                    'data-content': nazionalita,
                                    'cognome': cognomeStudente,
                                    'data-variation': "tiny"
                                })
                                .addClass('ui segment tooltip girl popup-information ' + voto)
                                .attr('id', cf)
                                .html(anagrafica)
                        }


                        //aggiungo la classe desiderata se presente
                        if (desiderata != "") container.addClass('desiderata');

                        var tooltipValue = "";
                        if ((arrayStudenti[j].legge_104) != "") {
                            tooltipValue = "104"
                        } else if (arrayStudenti[j].legge_107 != "") {
                            tooltipValue = "107";
                        }


                        if (tooltipValue != "") {
                            //contiene il tag studente
                            tag = $('<div/>')
                                .addClass('floating ui grey label mini')
                                .css(
                                    {
                                        'top': '25%'
                                    }
                                )
                                .html(tooltipValue)
                                .appendTo(container)
                        }

                        //tooltip for handicap
                        var handicapTooltip = "";
                        if ((arrayStudenti[j])['legge_' + tooltipValue] !== undefined) {
                            handicapTooltip = '<br>' + tooltipValue + ': ' + (arrayStudenti[j])['legge_' + tooltipValue];
                        }

                        var tooltip = $('<span/>')
                            .addClass('tooltiptext')
                            .html('media : ' + voto + '<br>naz : ' + nazionalita + handicapTooltip)
                            .appendTo(container);

                        var li = $('<li/>')
                            .html(container)
                            .appendTo(div);
                    }
                }

                //create menu
                div.contextMenu({
                    selector: 'li',
                    callback: function (key, options) {
                        var studente = getStudentObject($(this).children().attr("id"));
                        switch (key) {
                            case "informazioni":
                                //open modal
                                $('.ui.modal.informazioni').modal({
                                    onHide: function () {

                                    },
                                    onApprove: function () {


                                    },
                                    onShow: function () {

                                        populateModal(studente);
                                    }
                                }).modal('show');

                                break;
                            //for further case
                            case "spostamento" :

                                moveStudentFromContextMenu(key, studente);
                                break;
                            //spostamento nelle classi
                            default:
                                moveStudentFromContextMenu(key, studente);
                                break;
                        }
                    },
                    items: {
                        "informazioni": {name: "Informazioni", icon: "edit"},
                        "spostamento": {
                            name: "Spostamento",
                            icon: "cut",
                            "items": returnJsonOfClassName()
                        }
                    }
                });


                var jsonVotiPrima = totalVotiOfAllClass();
                var jsonVoti = numerOfVotiOfClass(nomeClasse);
                var numerOfStudent = totalNumberOfStudent(nomeClasse);
                var totalNumberOfAllClass = totalNumberOfStudentOfAllClass();

                // CHART BAR //
                var canvasBarChart = $('<canvas/>',
                    {
                        'id': nomeClasse + 'barChart',
                        'class': 'barChart',
                        'width': 200,
                        'height': 250
                    }).appendTo(settingClasse);

                var br = $('<br>', {
                    class: 'barChart'
                }).appendTo(settingClasse);

                var barChart = new Chart(canvasBarChart, {
                    type: 'bar',
                    data: {
                        labels: ["6", "7", "8", "9", "10"],
                        datasets: [{
                            label: 'classe' + nomeClasse,
                            data: [
                                approxNum((jsonVoti[6] / numerOfStudent) * 100),
                                approxNum((jsonVoti[7] / numerOfStudent) * 100),
                                approxNum((jsonVoti[8] / numerOfStudent) * 100),
                                approxNum((jsonVoti[9] / numerOfStudent) * 100),
                                approxNum((jsonVoti[10] / numerOfStudent) * 100)
                            ],
                            backgroundColor: [
                                '#FFCC80',
                                '#E6EE9C',
                                '#D4E157',
                                '#C5E1A5',
                                '#AED581'
                            ],
                            borderColor: [
                                '#FFB74D',
                                '#E6EE9C',
                                '#CDDC39',
                                '#C5E1A5',
                                '#AED581'
                            ],
                            borderWidth: 1,
                            stack: 1
                        },
                            {
                                label: 'Totali',
                                data: [
                                    approxNum((jsonVotiPrima[6] / totalNumberOfAllClass) * 100),
                                    approxNum((jsonVotiPrima[7] / totalNumberOfAllClass) * 100),
                                    approxNum((jsonVotiPrima[8] / totalNumberOfAllClass) * 100),
                                    approxNum((jsonVotiPrima[9] / totalNumberOfAllClass) * 100),
                                    approxNum((jsonVotiPrima[10] / totalNumberOfAllClass) * 100)
                                ],
                                backgroundColor: [
                                    '#E0E0E0',
                                    '#E0E0E0',
                                    '#E0E0E0',
                                    '#E0E0E0',
                                    '#E0E0E0'
                                ],
                                borderColor: [
                                    '#BDBDBD',
                                    '#BDBDBD',
                                    '#BDBDBD',
                                    '#BDBDBD',
                                    '#BDBDBD'
                                ],
                                borderWidth: 1,
                                stack: 2
                            }
                        ]
                    },
                    options: {
                        responsive: false,
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    steps: 10,
                                    stepValue: 6,
                                    max: 60,
                                    callback: function (value) {
                                        return value + "%";   //mettendo questa per la percentuale il voto viene messo orizzontale
                                    }
                                }
                            }]
                        }
                    }
                });

                barChartArray.push(barChart);


                // PIE CHART
                //TODO occhio che qui è un punto critico infatti mi baso per il label sul codice iso della bandiera quindi se manca qualche nazionalità e il relativo codice iso si rompe tutto. Bisogna fare un controllo quando carichiamo gli studenti e in caso non avessimo una nazionalità fare inserire il codice iso della bandiera

                var canvasPieChart = $('<canvas/>',
                    {
                        'id': nomeClasse + 'pieChart',
                        'class': 'pieChart',
                        'width': 200,
                        'height': 250
                    }).appendTo(settingClasse).hide();


                var stranieri = getNationalityOfClass(nomeClasse);
                var labels = [];
                var data = [];


                for (var prop in stranieri) {
                    labels.push(flagTag(prop));
                    data.push(stranieri[prop]);
                }

                var colorArray = getColorOfNationalitiesByLabelArray(labels);

                var br = $('<br>', {
                    class: 'pieChart'
                }).appendTo(settingClasse);

                // For a pie chart
                var pieChart = new Chart(canvasPieChart, {
                    type: 'pie',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                data: data,
                                backgroundColor: colorArray,
                                hoverBackgroundColor: colorArray
                            }]
                    },
                    options: {
                        responsive: false,
                        tooltips: {
                            callbacks: {
                                label: function (tooltipItems, data) {
                                    return data.datasets[0].data[tooltipItems.index] + ' -> naz: ' + nazionalitaByTag(data.labels[tooltipItems.index]).toLowerCase();
                                }

                            }
                        }

                    }
                });

                pieChartArray.push(pieChart);

                //box informazioni

                createBoxInformazioni(settingClasse, nomeClasse);


            }
            var oldList, newList, item, desiderata, cfAmico;
            $(".contenitoreClasse").sortable({
                connectWith: ".contenitoreClasse",
                start: function (event, ui) {

                    item = ui.item;
                    var currentPos = $(this).position();
                    desiderata = item.children().hasClass('desiderata');
                    cf = item.children()[0].id; //cf dell'alunno selezionato
                    cfAmico = getAlunnoDesiderataByCF(cf);


                    if (desiderata) {
                        //check if i've already this cf
                        if (jQuery.inArray(cf, cfArray) == -1) {
                            cfArray.push(cf);
                            var amico = getStudentByCF(cfAmico);
                            var classeAmico = getClassNameFromStudent(cfAmico);
                            var classeStudenteSelezionato = getClassNameFromStudent(cf);
                            //se la desiderata non è corrisposta
                            if (!(cfAmico === undefined || classeAmico === undefined || classeAmico != classeStudenteSelezionato)) {
                                if (confirm("Questo alunno vuole stare con un amico: " + amico + " della " + classeAmico + ", continuare?")) {
                                    newList = oldList = ui.item.parent().parent();
                                }
                                else {
                                    var index = cfArray.indexOf(cf);
                                    cfArray.splice(index, 1);
                                    newList = oldList = ui.item.parent().parent();
                                }
                            }
                            else {
                                newList = oldList = ui.item.parent().parent();
                            }

                        }
                        else {
                            newList = oldList = ui.item.parent().parent();
                        }

                    }
                    else {
                        newList = oldList = ui.item.parent().parent();
                    }

                },
                stop: function (event, ui) {
                    var cf_studente_spostato = item[0].childNodes[0].id;
                    var classFrom = oldList.attr('id');
                    var classTo = newList.attr('id');

                    moveStudent(cf_studente_spostato, classFrom, classTo, true);

                    console.log("Moved " + cf_studente_spostato + " from " + oldList.attr('id') + " to " + newList.attr('id'));


                },
                change: function (event, ui) {
                    if (ui.sender) newList = ui.placeholder.parent().parent();
                }
            }).disableSelection();

            displayAllClass();

            $(".barChartButton").on('click', function (e) {
                classe = $(this).parent().parent().parent().attr('id');

                pieChart = $("#" + classe + "pieChart").hide();
                barChart = $("#" + classe + "barChart").show();

            });

            $(".pieChartButton").on('click', function (e) {

                classe = $(this).parent().parent().parent().attr('id');

                barChart = $("#" + classe + "barChart").hide();
                pieChart = $("#" + classe + "pieChart").show();
            });


            //contents it's load, remove loader
            $('.ui.text.loader.active.medium').removeClass('active').addClass('disabled');
        },
        type: 'GET'
    });

    /**
     * Osservatore per gestire la visualizzazione delle classi
     */
    $('#selezioneClassi')
        .on('click', '.item', function () {

            console.log($(this)[0]);

            if (!$($(this)[0]).hasClass('notSelectable')) { //faccio questo controllo per evitare che venga considerato click anche lo switch per mostrare le classi(ho dovuto dargli classe item se no non era in linea)
                if ($(this).hasClass('active')) {
                    $(this).removeClass('active');

                    if ($('#check').prop("checked") == false) {
                        var classe = $(this).text();
                        $('#' + classe).hide();
                    }


                } else {
                    $(this).addClass('active');

                    if ($('#check').prop("checked") == false) {
                        var classe = $(this).text();
                        $('#' + classe).show();
                    }
                }
            }
        });

    /**
     * Osservatore per gestire il visualizzza tutto
     */
    $('#checkBox').checkbox({
        onChecked: function () {
            displayAllClass();
        },
        onUnchecked: function () {
            //prima di pulire tutto controllo gli item già attivi per portare alla situazione precendente le visualizzazioni
            $('#selezioneClassi > .classi').each(function (i, obj) {
                if (!$(this).children().hasClass('active')) {
                    try {
                        var id = $(this).children().text();
                        $('#' + id).hide();
                    } catch (e) {
                        //mi serviva per fare il controllo perchè il riquadro attorno allo switch viene considerato active allora passa l'id ma va in eccezione perchè non si riferisce a nessuna classe
                    }
                }
            });
        }
    });
});

