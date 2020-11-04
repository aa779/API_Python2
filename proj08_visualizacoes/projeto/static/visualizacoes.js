$(function () {
  let url_base = "/api/v1.1";

  // preenche a lista de seleção das estações
  fetch(`${url_base}/estacao`)

    .then(function (response) {
      var contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json()

        .then(function (json) {
          $('#origens').empty();
          json.resources.forEach(function (estacao) {
            $('#origens')
              .append( $('<option></option>' )
                .val(estacao.id)
                .text(`${estacao.local} #${estacao.id}`)
              );  // end append option
          });     // end forEach estacao
        });       // end then
      }           // end if
    });           // end then


  /*
    - fetch dos sensores da estação selecionada;
    - para cada sensor da estação:
      - split parametros;
      - para cada parametro do sensor:
        - adicionar um container no template;
        - cria um chart dentro do container;
   */


  // Observa mudanças na lista de seleção
  $('#origens').change(function() {
    let estacao_id = this.value;

    // fetch da lista dos sensores da estação selecionada;
    fetch(`${url_base}/estacao/${estacao_id}/sensor`)

      .then(function (response) {
        var contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return response.json()

          .then(function (json) {
            $('#container-charts').empty();

            let sensores = json.resources;
            sensores.forEach(function (sensor) {

              sensor.params.split(",")
                .forEach(function (param) {

                  let container_param = `container-${sensor.id}-${param}`;
                  $('#container-charts').append(`<div id="${container_param}"></div>`);

                  Highcharts.chart(container_param, {
                    chart: {
                      type: 'area',
                      animation: Highcharts.svg, // don't animate in old IE
                      marginRight: 10,
                      events: {
                        load: function () {

                          // set up the updating of the chart each second
                          setInterval(function () {
                            fetch(`${url_base}/sensor/${sensor.id}/${param}/last`)
                              .then(function(response) {
                                var contentType = response.headers.get('content-type');
                                if (contentType && contentType.indexOf("application/json") !== -1) {
                                  return response.json()

                                  .then(function(json) {
                                    // seconds (python) to milliseconds (js)
                                    var x = json.resource.datahora * 1000;
                                    var y = parseFloat(json.resource.valor);
                                    // console.log(serie.name, x, y);

                                    this.series[0].addPoint([x, y], true, true);
                                  }); // end then
                                }     // end if
                              });     // end then
                          }, 1000);   // end setInterval

                        }
                      }
                    },

                    time: {
                        useUTC: false
                    },

                    title: {
                        text: 'Live random data'
                    },

                    accessibility: {
                        announceNewData: {
                            enabled: true,
                            minAnnounceInterval: 15000,
                            announcementFormatter: function (allSeries, newSeries, newPoint) {
                                if (newPoint) {
                                    return 'New point added. Value: ' + newPoint.y;
                                }
                                return false;
                            }
                        }
                    },

                    xAxis: {
                        type: 'datetime',
                        tickPixelInterval: 150
                    },

                    yAxis: {
                        title: {
                            text: 'Value'
                        },
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }]
                    },

                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br/>',
                        pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}'
                    },

                    legend: {
                        enabled: true
                    },

                    exporting: {
                        enabled: false
                    },

                    series: [{
                      name: null,
                      color: '#c00',
                      data: (function () {
                        // generate an array of random data
                        var data = [],
                          time = (new Date()).getTime(),
                          i;
                        for (i = -19; i <= 0; i += 1) {
                          data.push({
                            x: time + i * 1000,
                            y: null
                          });
                        }
                        return data;
                      }())
                    }] // end series list

                  });   // end Highcharts object
                });      // end forEach param
            });          // end forEach sensor
          });            // end then
        }                // end if
      });                // end then
  });                    // end change

});                      // end load DOM
