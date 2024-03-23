// ==UserScript==
// @name         HidingPlus
// @version      1.0.14+
// @description  Sachen ausblenden
// @author       Dynamiite + n0eL_1405
// @match      *://leitstellenspiel.de/
// @match      *://leitstellenspiel.de/?mapview=true
// @match      *://www.leitstellenspiel.de/
// @match      *://.missionchief.co.uk/
// @match      *://www.missionchief.co.uk/
// @match      *://missionchief.co.uk/?mapview=true
// @match      *://.missionchief.com/
// @match      *://www.missionchief.com/
// @match      *://missionchief.com/?mapview=true
// @grant        GM_addStyle
// @namespace
// ==/UserScript==
/* global $ */
(function () {
    'use strict';
    GM_addStyle(`.missionen_hiding{display:none !important;}`);

    /* Configuration */
    var eigene_gebaude = false;
    var alle_eigene_fahrzeuge = false;
    var fahrzeuge_im_einsatz = false;
    var alle_eigene_missionen = false;
    var beteiligte_eigene_einsatze = false;
    var freigegebene_eigene_einsatze = false;
    var nicht_freigegebene_eigene_einsatze = false;
    var verbands_fahrzeuge = true;
    var alle_verbands_missionen = false;
    var beteiligte_verbands_missionen = true;
    var alle_event_missionen = false;
    var beteiligte_event_missionen = true;
    /* END Configuration */

    var filter = ['[Verband]', '[Event]', '[Alliance]']; // Filter für Fahrzeug und Gebäude und Missionen text
    var substringCount = filter.length;
    var missions_outer_height = 0;
    // ruft setIntervall alle 10 sekunden auf
    //var tid = setInterval(check_intervall, 10000);
    let einsatzarray_vehicle = new Array()
    let einsatzarray_beteiligte_mission = new Array()
    let einsatzarray_beteiligte_eigene_mission = new Array()
    let einsatzarray_freigegebene_eigene_mission = new Array()
    let einsatzarray_nicht_freigegebene_eigene_mission = new Array()
    let einsatzarray_alle_event_mission = new Array()
    let einsatzarray_beteiligte_event_mission = new Array()
    init();
    check_intervall();

    function init() { // https://www.leitstellenspiel.de/images/search_5a5753.svg
        $('.nav.navbar-nav.navbar-right').prepend('<li class="dropdown" id="dropdown_hiding_settings"><a href="#" id="hide" role="button" class="dropdown-toggle" data-toggle="dropdown"><img alt="Hide_ffffff" class="navbar-icon" src="https://www.leitstellenspiel.de/images/search_5a5753.svg" title="Hide"><span class="visible-xs">Hide</span><b class="caret"></b></a></li>');
        $('<ul class="dropdown-menu" role="menu" aria-labelledby="news"><li id="dropdown_hiding_settings_1" role="presentation"></li></ul>').appendTo('#dropdown_hiding_settings');
        $('<hr style="margin:0px"><li id="dropdown_hiding_settings_2"></li>').appendTo('#dropdown_hiding_settings .dropdown-menu');
        $('<li id="dropdown_hiding_settings_3"></li>').appendTo('#dropdown_hiding_settings .dropdown-menu');
        $('<hr style="margin:0px"><li id="dropdown_hiding_settings_4"></li>').appendTo('#dropdown_hiding_settings .dropdown-menu');
        $('<li id="dropdown_hiding_settings_5"></li>').appendTo('#dropdown_hiding_settings .dropdown-menu');
        $('<li id="dropdown_hiding_settings_6"></li>').appendTo('#dropdown_hiding_settings .dropdown-menu');
        $('<li id="dropdown_hiding_settings_7"></li>').appendTo('#dropdown_hiding_settings .dropdown-menu');
        $('<hr style="margin:0px"><li id="dropdown_hiding_settings_8"></li>').appendTo('#dropdown_hiding_settings .dropdown-menu');
        $('<hr style="margin:0px"><li id="dropdown_hiding_settings_9"></li>').appendTo('#dropdown_hiding_settings .dropdown-menu');
        $('<li id="dropdown_hiding_settings_10"></li>').appendTo('#dropdown_hiding_settings .dropdown-menu');
        $('<hr style="margin:0px"><li id="dropdown_hiding_settings_11"></li>').appendTo('#dropdown_hiding_settings .dropdown-menu');
        $('<li id="dropdown_hiding_settings_12"></li>').appendTo('#dropdown_hiding_settings .dropdown-menu');

        let button_class = (eigene_gebaude) ? "-" : "+";
        //Fügt Buttons in neue li. onclick toggelt Boolean und ruft function auf
        $('<a href="#" title="eigene_gebaude" id="hiding_eigene_gebaude"><span>' + button_class + '</span> Eigene Gebäude </a>').appendTo($('#dropdown_hiding_settings_1'))
            .click(function (e) {
                eigene_gebaude = !eigene_gebaude;
                f_eigene_gebaude();
                refreshHidingButtons()
                return false;
            });
        button_class = (alle_eigene_fahrzeuge) ? "-" : "+";
        //Fügt Buttons in neue li. onclick toggelt Boolean und ruft function auf
        $('<a href="#" title="alle_eigene_fahrzeuge" id="hiding_alle_eigene_fahrzeuge"><span>' + button_class + '</span> Alle eigene Fahrzeuge </a>').appendTo($('#dropdown_hiding_settings_2'))
            .click(function (e) {
                alle_eigene_fahrzeuge = !alle_eigene_fahrzeuge;
                if (alle_eigene_fahrzeuge) {
                    fahrzeuge_im_einsatz = false;
                }
                refreshHidingButtons()
                fahrzeuge_hide();
                return false;
            });
        button_class = (fahrzeuge_im_einsatz) ? "-" : "+";
        //Fügt Buttons in neue li. onclick toggelt Boolean und ruft function auf
        $('<a href="#"  title="fahrzeuge_im_einsatz" id="hiding_fahrzeuge_im_einsatz"><span>' + button_class + '</span> Fahrzeuge im Einsatz </a>').appendTo($('#dropdown_hiding_settings_3'))
            .click(function (e) {
                fahrzeuge_im_einsatz = !fahrzeuge_im_einsatz;
                if (fahrzeuge_im_einsatz) {
                    alle_eigene_fahrzeuge = false;
                }
                refreshHidingButtons()
                f_fahrzeuge_im_einsatz();
                if (!fahrzeuge_im_einsatz) {
                    let wachen = $('.building_list_li')
                    let fahrzeuge = $('.label.label-default.vehicle_building_list_button.lightbox-open')
                    $(wachen).removeClass('hideBuildingType')
                    $(fahrzeuge).parent().show()
                }
                return false;
            });
        button_class = (alle_eigene_missionen) ? "-" : "+";
        //Fügt Buttons in neue li. onclick toggelt Boolean und ruft function auf
        $('<a href="#" title="alle_eigene_missionen" id="hiding_alle_eigene_missionen"><span>' + button_class + '</span> Alle eigene Missionen </a>').appendTo($('#dropdown_hiding_settings_4'))
            .click(function (e) {
                alle_eigene_missionen = !alle_eigene_missionen;
                if (alle_eigene_missionen) {
                    // alle_eigene_missionen=false;
                    beteiligte_eigene_einsatze = false
                    freigegebene_eigene_einsatze = false
                    nicht_freigegebene_eigene_einsatze = false
                } else {
                    $('#mission_list .missionSideBarEntry.missionSideBarEntrySearchable').not('.mission_deleted').map((e, t) => $(t).removeClass('missionen_hiding'))
                    $('#mission_list_sicherheitswache .missionSideBarEntry.missionSideBarEntrySearchable').not('.mission_deleted').filter((e, t) => !($(t).find('.panel-heading').text().includes('[Verband]') || $(t).find('.panel-heading').text().includes('[Alliance]'))).map((e, t) => $(t).removeClass('missionen_hiding'))
                }
                refreshHidingButtons()
                mission_hide();
                return false;
            });
        button_class = (beteiligte_eigene_einsatze) ? "-" : "+";
        $('<a href="#" title="beteiligte_eigene_einsatze" id="hiding_beteiligte_eigene_einsatze"> <span>' + button_class + '</span> Beteiligte eigene Missionen</a>').appendTo($('#dropdown_hiding_settings_5'))
            .click(function (e) {
                beteiligte_eigene_einsatze = !beteiligte_eigene_einsatze;
                if (beteiligte_eigene_einsatze) {
                    alle_eigene_missionen = false;
                    //beteiligte_eigene_einsatze=false
                    //freigegebene_eigene_einsatze=false
                    //nicht_freigegebene_eigene_einsatze=false
                }
                refreshHidingButtons()
                f_beteiligte_eigene_einsatze();
                if (freigegebene_eigene_einsatze) f_freigegebene_eigene_einsatze();
                if (nicht_freigegebene_eigene_einsatze) f_nicht_freigegebene_eigene_einsatze();
                return false;
            });
        button_class = (freigegebene_eigene_einsatze) ? "-" : "+";
        $('<a href="#" title="freigegebene_eigene_einsatze" id="hiding_freigegebene_eigene_einsatze"> <span>' + button_class + '</span> Freigegebene eigene Missionen</a>').appendTo($('#dropdown_hiding_settings_6'))
            .click(function (e) {
                freigegebene_eigene_einsatze = !freigegebene_eigene_einsatze;
                if (freigegebene_eigene_einsatze) {
                    alle_eigene_missionen = false;
                    //beteiligte_eigene_einsatze=false
                    //freigegebene_eigene_einsatze=false
                    nicht_freigegebene_eigene_einsatze = false
                }
                refreshHidingButtons()
                f_freigegebene_eigene_einsatze();
                if (beteiligte_eigene_einsatze) f_beteiligte_eigene_einsatze();
                return false;
            });
        button_class = (nicht_freigegebene_eigene_einsatze) ? "-" : "+";
        $('<a href="#" title="nicht_freigegebene_eigene_einsatze" id="hiding_nicht_freigegebene_eigene_einsatze"><span>' + button_class + '</span> Nicht freigegebene eigene Missionen </a>').appendTo($('#dropdown_hiding_settings_7'))
            .click(function (e) {
                nicht_freigegebene_eigene_einsatze = !nicht_freigegebene_eigene_einsatze;
                if (nicht_freigegebene_eigene_einsatze) {
                    alle_eigene_missionen = false;
                    //beteiligte_eigene_einsatze=false
                    freigegebene_eigene_einsatze = false
                    //nicht_freigegebene_eigene_einsatze=false
                }
                refreshHidingButtons()
                f_nicht_freigegebene_eigene_einsatze();
                if (beteiligte_eigene_einsatze) f_beteiligte_eigene_einsatze();
                return false;
            });
        button_class = (verbands_fahrzeuge) ? "-" : "+";
        //Fügt Buttons in neue li. onclick toggelt Boolean und ruft function auf
        $('<a href="#" title="verbands_fahrzeuge" id="hiding_verbands_fahrzeuge"><span>' + button_class + '</span> Verbands Fahrzeuge </a>').appendTo($('#dropdown_hiding_settings_8'))
            .click(function (e) {
                verbands_fahrzeuge = !verbands_fahrzeuge;
                fahrzeuge_hide();
                refreshHidingButtons()
                return false;
            });
        button_class = (alle_verbands_missionen) ? "-" : "+";
        //Fügt Buttons in neue li. onclick toggelt Boolean und ruft function auf
        $('<a href="#" title="alle_verbands_missionen" id="hiding_alle_verbands_missionen"><span>' + button_class + '</span> Alle Verbands Missionen </a>').appendTo($('#dropdown_hiding_settings_9'))
            .click(function (e) {
                alle_verbands_missionen = !alle_verbands_missionen;
                if (alle_verbands_missionen) {
                    beteiligte_verbands_missionen = false;
                }
                refreshHidingButtons()
                mission_hide();
                return false;
            });
        button_class = (beteiligte_verbands_missionen) ? "-" : "+";
        $('<a href="#" title="beteiligte_verbands_missionen" id="hiding_beteiligte_verbands_missionen"><span>' + button_class + '</span> Beteiligte Verbands Missionen </a>').appendTo($('#dropdown_hiding_settings_10'))
            .click(function (e) {
                beteiligte_verbands_missionen = !beteiligte_verbands_missionen;
                if (beteiligte_verbands_missionen) {
                    alle_verbands_missionen = false;
                }
                refreshHidingButtons()
                f_beteiligte_verbands_missionen();
                return false;
            });
        button_class = (alle_event_missionen) ? "-" : "+";
        $('<a href="#" title="alle_event_missionen" id="hiding_alle_event_missionen"><span>' + button_class + '</span> Alle Event Missionen </a>').appendTo($('#dropdown_hiding_settings_11'))
            .click(function (e) {
                alle_event_missionen = !alle_event_missionen;
                if (alle_event_missionen) {
                    beteiligte_event_missionen = false;
                }
                refreshHidingButtons()
                f_alle_event_missionen();
                return false;
            });
        button_class = (beteiligte_event_missionen) ? "-" : "+";
        $('<a href="#" title="beteiligte_event_missionen" id="hiding_beteiligte_event_missionen"><span>' + button_class + '</span> Beteiligte Event Missionen </a>').appendTo($('#dropdown_hiding_settings_12'))
            .click(function (e) {
                beteiligte_event_missionen = !beteiligte_event_missionen;
                if (beteiligte_event_missionen) {
                    alle_event_missionen = false;
                }
                refreshHidingButtons()
                f_beteiligte_event_missionen();
                return false;
            });
    }

    let missionMarkerOrig = missionMarkerAdd;
    missionMarkerAdd = (e) => {
        f_beteiligte_verbands_missionen();
        if (beteiligte_event_missionen) {
            f_beteiligte_event_missionen();
        }
        if (alle_event_missionen) {
            f_alle_event_missionen();
        }
        f_beteiligte_eigene_einsatze();
        if (alle_eigene_fahrzeuge || verbands_fahrzeuge || fahrzeuge_im_einsatz) {
            fahrzeuge_hide();
        }
        missionMarkerOrig(e);
    };
    map.on({
        zoomend: function () {
            setTimeout(() => {
                f_beteiligte_verbands_missionen();
                if (beteiligte_event_missionen) {
                    f_beteiligte_event_missionen();
                }
                if (alle_event_missionen) {
                    f_alle_event_missionen();
                }
                f_beteiligte_eigene_einsatze();
                if (alle_eigene_fahrzeuge || verbands_fahrzeuge || fahrzeuge_im_einsatz) {
                    fahrzeuge_hide();
                }
                if (eigene_gebaude) {
                    f_eigene_gebaude();
                }
            }, 100)
        },
        moveend: function () {
            setTimeout(() => {
                f_beteiligte_verbands_missionen();
                if (beteiligte_event_missionen) {
                    f_beteiligte_event_missionen();
                }
                if (alle_event_missionen) {
                    f_alle_event_missionen();
                }
                f_beteiligte_eigene_einsatze();
                if (alle_eigene_fahrzeuge || verbands_fahrzeuge || fahrzeuge_im_einsatz) fahrzeuge_hide();
                if (eigene_gebaude) f_eigene_gebaude();
            }, 100)
        }
    });
    /*
    let vehicleCreateOnMapBuffer = vehicleCreateOnMap;
    vehicleCreateOnMap = function(e){
        f_fahrzeuge_im_einsatz();
        vehicleCreateOnMapBuffer(e)
    };
*/
    /*
    let vehicleDriveAddBuffer = vehicleDriveAdd;
    vehicleDriveAdd = function(e){
        f_fahrzeuge_im_einsatz();
        vehicleDriveAddBuffer(e)
    };
*/
    let vehicleDriveBuffer = function (e) {
        vehicleDriveBuffer(e)
        if (alle_eigene_fahrzeuge || verbands_fahrzeuge || fahrzeuge_im_einsatz) fahrzeuge_hide();
    };
    let vehicleMarkerAddBuffer = function (e) {
        vehicleMarkerAddBuffer(e)
        if (alle_eigene_fahrzeuge || verbands_fahrzeuge || fahrzeuge_im_einsatz) fahrzeuge_hide();
    };
    let radioMessageBuffer = function (t) {
        //if(alle_eigene_fahrzeuge||verbands_fahrzeuge||fahrzeuge_im_einsatz)fahrzeuge_hide();
        f_beteiligte_verbands_missionen();
        if (beteiligte_event_missionen) {
            f_beteiligte_event_missionen();
        }
        if (alle_event_missionen) {
            f_alle_event_missionen();
        }
        f_beteiligte_eigene_einsatze();
        f_fahrzeuge_im_einsatz();
        radioMessageBuffer(t);
    }

    function refreshHidingButtons() {
        alle_eigene_fahrzeuge ? $('#hiding_alle_eigene_fahrzeuge').find('span').text("-") : $('#hiding_alle_eigene_fahrzeuge').find('span').text("+");
        fahrzeuge_im_einsatz ? $('#hiding_fahrzeuge_im_einsatz').find('span').text("-") : $('#hiding_fahrzeuge_im_einsatz').find('span').text("+");
        alle_eigene_missionen ? $('#hiding_alle_eigene_missionen').find('span').text("-") : $('#hiding_alle_eigene_missionen').find('span').text("+");
        beteiligte_eigene_einsatze ? $('#hiding_beteiligte_eigene_einsatze').find('span').text("-") : $('#hiding_beteiligte_eigene_einsatze').find('span').text("+");
        freigegebene_eigene_einsatze ? $('#hiding_freigegebene_eigene_einsatze').find('span').text("-") : $('#hiding_freigegebene_eigene_einsatze').find('span').text("+");
        nicht_freigegebene_eigene_einsatze ? $('#hiding_nicht_freigegebene_eigene_einsatze').find('span').text("-") : $('#hiding_nicht_freigegebene_eigene_einsatze').find('span').text("+");
        eigene_gebaude ? $('#hiding_eigene_gebaude').find('span').text("-") : $('#hiding_eigene_gebaude').find('span').text("+");
        verbands_fahrzeuge ? $('#hiding_verbands_fahrzeuge').find('span').text("-") : $('#hiding_verbands_fahrzeuge').find('span').text("+");
        alle_verbands_missionen ? $('#hiding_alle_verbands_missionen').find('span').text("-") : $('#hiding_alle_verbands_missionen').find('span').text("+");
        beteiligte_verbands_missionen ? $('#hiding_beteiligte_verbands_missionen').find('span').text("-") : $('#hiding_beteiligte_verbands_missionen').find('span').text("+");
        alle_event_missionen ? $('#hiding_alle_event_missionen').find('span').text("-") : $('#hiding_alle_event_missionen').find('span').text("+");
        beteiligte_event_missionen ? $('#hiding_beteiligte_event_missionen').find('span').text("-") : $('#hiding_beteiligte_event_missionen').find('span').text("+");
    }

    function check_intervall() {
        // wird alle 10 sekunden aufgerufen um alles auszublenden was durch die buttons gesetzt wurde
        //f_fahrzeuge_im_einsatz();
        f_beteiligte_verbands_missionen();
        if (beteiligte_event_missionen) {
            f_beteiligte_event_missionen();
        }
        if (alle_event_missionen) {
            f_alle_event_missionen();
        }
        fahrzeuge_hide()
        mission_hide()
        f_nicht_freigegebene_eigene_einsatze()
        f_freigegebene_eigene_einsatze()
        f_beteiligte_eigene_einsatze();
        f_fahrzeuge_im_einsatz();
        if (eigene_gebaude) f_eigene_gebaude();
    }

    function fahrzeuge_hide() {
        for (let i = vehicle_markers.length - 1; i >= 0; i--) {
            let string = vehicle_markers[i]._tooltip._content;
            let string_ids_out = vehicle_markers[i].vehicle_id.toString();
            if (alle_eigene_fahrzeuge && !filter.some(substring => string.includes(substring)))
                map.removeLayer(vehicle_markers[i])
            else if (verbands_fahrzeuge && filter.some(substring => string.includes(substring)))
                map.removeLayer(vehicle_markers[i]);
            else if (fahrzeuge_im_einsatz && einsatzarray_vehicle.some((substring) => string_ids_out.includes(substring.toString())))
                map.removeLayer(vehicle_markers[i]);
            else {
                if (!vehicle_markers[i].vehicle_marker_deleted)
                    map.addLayer(vehicle_markers[i]);
            }
        }
    }

    function mission_hide() {
        for (let i = mission_markers.length - 1; i >= 0; i--) {
            let string = mission_markers[i]._tooltip._content;
            let string_ids_id = mission_markers[i].mission_id.toString();
            if (alle_eigene_missionen && !filter.some(substring => string.includes(substring)))
                map.removeLayer(mission_markers[i]);
            else if (freigegebene_eigene_einsatze && einsatzarray_freigegebene_eigene_mission.some((substring) => string_ids_id.includes(substring)))
                map.removeLayer(mission_markers[i]);
            else if (nicht_freigegebene_eigene_einsatze && einsatzarray_nicht_freigegebene_eigene_mission.some((substring) => string_ids_id.includes(substring)))
                map.removeLayer(mission_markers[i]);
            else if (alle_verbands_missionen && filter.some(substring => string.includes(substring)))
                map.removeLayer(mission_markers[i]);
            else if (alle_event_missionen && einsatzarray_alle_event_mission.some((substring) => string_ids_id.includes(substring)))
                map.removeLayer(mission_markers[i]);
            else if (beteiligte_verbands_missionen && einsatzarray_beteiligte_mission.some((substring) => string_ids_id.includes(substring)))
                map.removeLayer(mission_markers[i]);
            else if (beteiligte_eigene_einsatze && einsatzarray_beteiligte_eigene_mission.some((substring) => string_ids_id.includes(substring)))
                map.removeLayer(mission_markers[i]);
            else if (beteiligte_event_missionen && einsatzarray_beteiligte_event_mission.some((substring) => string_ids_id.includes(substring)))
                map.removeLayer(mission_markers[i]);
            else
                map.addLayer(mission_markers[i]);
        }
    }

    function f_beteiligte_verbands_missionen() {
        einsatzarray_beteiligte_mission = new Array()
        let einsatze = $('#mission_list_alliance .missionSideBarEntry.missionSideBarEntrySearchable').not('.mission_deleted')
        einsatze = $(einsatze).filter((e, t) => $(t).find('.glyphicon-asterisk').hasClass('hidden'))
        let geplante_einsatze = $('#mission_list_sicherheitswache_alliance .missionSideBarEntry.missionSideBarEntrySearchable').not('.mission_deleted')
        geplante_einsatze = $(geplante_einsatze).filter((e, t) => $(t).find('.glyphicon-asterisk').hasClass('hidden') && ($(t).find('.panel-heading').text().includes('[Verband]') || $(t).find('.panel-heading').text().includes('[Alliance]')))
        let einsatzarray = new Array()
        if (beteiligte_verbands_missionen) {
            $(einsatze).map((e, t) => {
                einsatzarray_beteiligte_mission.push($(t).attr('mission_id'));
                $(t).addClass('missionen_hiding');
            })
            $(geplante_einsatze).map((e, t) => {
                einsatzarray_beteiligte_mission.push($(t).attr('mission_id'));
                $(t).addClass('missionen_hiding');
            })
            //let n_einsatzarray = $('#mission_list_sicherheitswache > .missionSideBarEntry').map((e,t)=>einsatzarray_beteiligte_mission.push($(t).attr('mission_id')));
        } else {
            $(einsatze).map((e, t) => $(t).removeClass('missionen_hiding'))
            $(geplante_einsatze).map((e, t) => $(t).removeClass('missionen_hiding'))
        }
        mission_hide()
    }

    function f_beteiligte_event_missionen() {
        einsatzarray_beteiligte_event_mission = new Array()
        let einsatze = $('#mission_list_alliance_event .missionSideBarEntry.missionSideBarEntrySearchable').not('.mission_deleted')
        einsatze = $(einsatze).filter((e, t) => $(t).find('.glyphicon-asterisk').hasClass('hidden'))
        if (beteiligte_event_missionen) {
            $(einsatze).map((e, t) => {
                einsatzarray_beteiligte_event_mission.push($(t).attr('mission_id'));
                $(t).addClass('missionen_hiding');
            })
            //let n_einsatzarray = $('#mission_list_sicherheitswache > .missionSideBarEntry').map((e,t)=>einsatzarray_beteiligte_mission.push($(t).attr('mission_id')));
        } else {
            $(einsatze).map((e, t) => $(t).removeClass('missionen_hiding'))
        }
        mission_hide()
    }

    function f_alle_event_missionen() {
        einsatzarray_alle_event_mission = new Array()
        let einsatze = $('#mission_list_alliance_event .missionSideBarEntry.missionSideBarEntrySearchable').not('.mission_deleted')
        if (alle_event_missionen) {
            $(einsatze).map((e, t) => {
                einsatzarray_alle_event_mission.push($(t).attr('mission_id'));
                $(t).addClass('missionen_hiding');
            })
            //let n_einsatzarray = $('#mission_list_sicherheitswache > .missionSideBarEntry').map((e,t)=>einsatzarray_beteiligte_mission.push($(t).attr('mission_id')));
        } else {
            $(einsatze).map((e, t) => $(t).removeClass('missionen_hiding'))
        }
        mission_hide()
    }

    function f_freigegebene_eigene_einsatze() {
        einsatzarray_freigegebene_eigene_mission = new Array()
        let einsatze = $('#mission_list .missionSideBarEntry.missionSideBarEntrySearchable').not('.mission_deleted')
        let geplante_einsatze = $('#mission_list_sicherheitswache .missionSideBarEntry.missionSideBarEntrySearchable').not('.mission_deleted').filter((e, t) => !($(t).find('.panel-heading').text().includes('[Verband]') || $(t).find('.panel-heading').text().includes('[Alliance]')))
        if (freigegebene_eigene_einsatze) {
            einsatze.map((e, t) => {
                if ($(t).children().hasClass('panel-success')) {
                    einsatzarray_freigegebene_eigene_mission.push($(t).attr('mission_id'));
                    $(t).addClass('missionen_hiding');
                } else
                    $(t).removeClass('missionen_hiding')
            })
            geplante_einsatze.map((e, t) => {
                if ($(t).children().hasClass('panel-success')) {
                    einsatzarray_freigegebene_eigene_mission.push($(t).attr('mission_id'));
                    $(t).addClass('missionen_hiding');
                } else
                    $(t).removeClass('missionen_hiding')
            })
        } else {
            einsatze.map((e, t) => {
                if ($(t).children().hasClass('panel-success'))
                    $(t).removeClass('missionen_hiding')
            })
            geplante_einsatze.map((e, t) => {
                if ($(t).children().hasClass('panel-success'))
                    $(t).removeClass('missionen_hiding')
            })
        }
        mission_hide()
    }

    function f_nicht_freigegebene_eigene_einsatze() {
        einsatzarray_nicht_freigegebene_eigene_mission = new Array()
        let einsatze = $('#mission_list .missionSideBarEntry.missionSideBarEntrySearchable').not('.mission_deleted')
        let geplante_einsatze = $('#mission_list_sicherheitswache_alliance .missionSideBarEntry.missionSideBarEntrySearchable').not('.mission_deleted').filter((e, t) => !($(t).find('.panel-heading').text().includes('[Verband]') || $(t).find('.panel-heading').text().includes('[Alliance]')))
        if (nicht_freigegebene_eigene_einsatze) {
//             andere_einsatze.map((e,t)=>$(t).removeClass('missionen_hiding'))
            einsatze.map((e, t) => {
                if (!$(t).children().hasClass('panel-success')) {
                    einsatzarray_nicht_freigegebene_eigene_mission.push($(t).attr('mission_id'));
                    $(t).addClass('missionen_hiding');
                } else
                    $(t).removeClass('missionen_hiding')
            })
            geplante_einsatze.map((e, t) => {
                if (!$(t).children().hasClass('panel-success')) {
                    einsatzarray_nicht_freigegebene_eigene_mission.push($(t).attr('mission_id'));
                    $(t).addClass('missionen_hiding');
                } else
                    $(t).removeClass('missionen_hiding')
            })
        } else {
            einsatze.map((e, t) => {
                if (!$(t).children().hasClass('panel-success'))
                    $(t).removeClass('missionen_hiding')
            })
            geplante_einsatze.map((e, t) => {
                if (!$(t).children().hasClass('panel-success'))
                    $(t).removeClass('missionen_hiding')
            })
        }
        mission_hide()
    }

    function f_beteiligte_eigene_einsatze() {
        einsatzarray_beteiligte_eigene_mission = new Array()
        let einsatze = $('#mission_list .missionSideBarEntry.missionSideBarEntrySearchable').not('.mission_deleted')
        einsatze = $(einsatze).filter((e, t) => $(t).find('.glyphicon-asterisk').hasClass('hidden'))
        let geplante_einsatze = $('#mission_list_sicherheitswache .missionSideBarEntry.missionSideBarEntrySearchable').not('.mission_deleted')
        //geplante_einsatze = $(geplante_einsatze).filter((e,t)=>$(t).find('.glyphicon-asterisk').hasClass('hidden'))
        geplante_einsatze = $(geplante_einsatze).filter((e, t) => $(t).find('.glyphicon-asterisk').hasClass('hidden') && !($(t).find('.panel-heading').text().includes('[Verband]') || $(t).find('.panel-heading').text().includes('[Alliance]')))
        let einsatzarray = new Array()
        if (beteiligte_eigene_einsatze) {
            $(einsatze).map((e, t) => {
                einsatzarray_beteiligte_eigene_mission.push($(t).attr('mission_id'));
                $(t).addClass('missionen_hiding');
            })
            $(geplante_einsatze).map((e, t) => {
                einsatzarray_beteiligte_eigene_mission.push($(t).attr('mission_id'));
                $(t).addClass('missionen_hiding');
            })
            //let n_einsatzarray = $('#mission_list_sicherheitswache > .missionSideBarEntry').map((e,t)=>einsatzarray_beteiligte_eigene_mission.push($(t).attr('mission_id')));
        } else if (!nicht_freigegebene_eigene_einsatze && !freigegebene_eigene_einsatze) {
            $(einsatze).map((e, t) => $(t).removeClass('missionen_hiding'))
            $(geplante_einsatze).map((e, t) => $(t).removeClass('missionen_hiding'))
        }
        mission_hide()
    }

    //Blendet die Fahrzeuge aus in der Fahrzeugliste bei status 3 4 6
    function f_fahrzeuge_im_einsatz() {
        if (fahrzeuge_im_einsatz) {
            einsatzarray_vehicle = new Array()
            $($('.building_list_li')).removeClass('hideBuildingType')
            $($('.label.label-default.vehicle_building_list_button.lightbox-open')).parent().show()
            //verstecke Wachen durch class 'hideBuildingType' und blende Fahrzeuge wieder ein
            let data = $('#building_list span').map((e, t) => {
                let wache = $(t).parents('.building_list_li')
                if ($(t).text() == 4 || $(t).text() == 3 || $(t).text() == 6) {
                    $(t).parent().hide();
                    einsatzarray_vehicle.push($(t).parent().attr('vehicle_id'))
                    if ($(wache).find('.building_list_vehicle_element:visible').length == 0) {
                        $(wache).addClass('hideBuildingType')
                        $(wache).find('.building_list_vehicle_element:hidden').show()
                    }
                } else {
                    $(t).parent().show();
                    $(wache).removeClass('hideBuildingType')
                }
            });
        }
        fahrzeuge_hide()
    }

    // blendet eigene Gebäude aus und fügt sie wieder ein
    function f_eigene_gebaude() {
        if (eigene_gebaude) {
            $(".leaflet-interactive[src*='building']").hide();
        } else {
            $(".leaflet-interactive[src*='building']").show();
        }
    }
})();