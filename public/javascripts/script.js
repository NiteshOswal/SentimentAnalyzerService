/**
 * Object.values polyfill
 */
const reduce = Function.bind.call(Function.call, Array.prototype.reduce);
const isEnumerable = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable);
const concat = Function.bind.call(Function.call, Array.prototype.concat);
const keys = Reflect.ownKeys;

if (!Object.values) {
    Object.values = function values(O) {
        return reduce(keys(O), (v, k) => concat(v, typeof k === 'string' && isEnumerable(O, k) ? [O[k]] : []), []);
    };
}

var pieNgrams = null;

function calRating(id = "", isChart = false, autosubmit = false) { //this assumes ES6 support - TODO - remove this and set defaults..
  $('#details'+id).show();
  $('#htopic'+id).html($("#topic"+id).val());
  $('#hstatus'+id).html("Processing...");
  $('#hrating'+id).html("");
  $(".help-block").html("");
  $('#stars'+id).html("");
  var topic = $("#topic"+id).val(),
      count = $('#count').val(),
      wiki_url = "https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=1&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch="+topic.replace(/ /g,"+");
  if(autosubmit) {
    url = url + "&autosubmit=1";
  }

  $.ajax({
    url: wiki_url,
    dataType: "jsonp",
    success: function(data){
      var temp;
      if(data){
        wiki = data.query.pages;
        $.each(wiki, function(w, d){
          temp = d;
        });
        if(!temp.thumbnail){
          $("#extract"+id).html("Ambiguous results.");
        }
        else{
          $("#extract"+id).html(temp.extract);
          $("#thumb"+id).attr("src",temp.thumbnail.source)
        }
      }
    }
  });

  var url = "ws://" + document.URL.substr(7).split('/')[0],
      wsCtor = window['MozWebSocket'] ? MozWebSocket : WebSocket,
      socket = new wsCtor(url, 'ws-api'),
      total = 0,
      check = 0,
      msg = {method:'collect', topic:topic, count:count};

  socket.onopen = function(connection){
    socket.send(JSON.stringify(msg));
    console.log('Connected. Message sent: '+JSON.stringify(msg));
  };
  socket.onmessage = function(message) {
    var res = JSON.parse(message.data);
    if(msg.method === 'collect'){
      var p = '';
      if(res.type === "end"){
        total = 0;
        msg.method = 'preprocess';
        res.type = '';
        res.data = '';
        socket.send(JSON.stringify(msg));
      }
      else{
        total += parseInt(res.data);
        p = parseInt((total*100)/count);
        if(!p || p>100) p=100+'%';
        else p = p+'%';
      }
      $('#hstatus'+id).html("Collecting Data "+p);
    }
    if(msg.method === 'preprocess'){
      var p ='';
      if(res.type === "end"){
        total = 0;
        res.type = '';
        res.data = '';
        msg.method = 'synthesize';
        socket.send(JSON.stringify(msg));
      }else{
        if(res.data){
          total += parseInt(res.data);
          p = total;
        }
      }
      $('#hstatus'+id).html("Preprocessing Data: "+p+" tweets processed");
    }
    if(msg.method === 'synthesize'){
      var p = 0;
      if(res.type === "end"){
        var rating = res.data.total_score.toFixed(1),
            html = "",
            full_star = "<i class='fa fa-star'></i>",
            half_star = "<i class='fa fa-star-half-o'></i>",
            empty_star = "<i class='fa fa-star-o'></i>";

        if(isChart){

          var stats = new Chart($('#stats'), {
              type: 'bar',
              data: {
                  labels: Object.keys(res.data.score_by_date),
                  datasets: [{
                      label: "Score",
                      data: Object.values(res.data.score_by_date).map(function(v) {
                          return v.total_score;
                      }),
                      backgroundColor: randomColor({count: Object.values(res.data.score_by_date).length, hue: 'purple'})
                  }]
              },
              options: {
                scales: {
                  yAxes: [{
                    ticks: {
                      beginAtZero:true
                    }
                  }]
                }
              }
          });
          var pieFeedback = new Chart($('#pie-feedback'), {
              type: 'pie',
              data: {
                  labels: ['Positive Tweets', 'Negative Tweets'],
                  datasets: [{
                      data: [res.data.positive_score, res.data.negative_score],
                      backgroundColor: [
                          "#4caf50",
                          "#e51c23"
                      ],
                      hoverBackgroundColor: [
                          "#439a46",
                          "#cb171e"
                      ]
                  }]
              }
          })

          $.get('/ngram?topic=' + encodeURI(topic) + "&date=" + encodeURI($("#date").val()) + "&count=2", function(ngram) {
              console.log(ngram);
              if(ngram.status) {
                  if(pieNgrams) pieNgrams.destroy();
                  pieNgrams = new Chart($("#pie-ngrams"), {
                      type: 'pie',
                      data: {
                          labels: ngram.data.map((v) => { return v.name; }),
                          datasets: [{
                              data: ngram.data.map((v) => {return v.count; }),
                              backgroundColor: randomColor({count: ngram.data.length, 'hue': 'green'})
                          }]
                      }
                  });
              }
          });

        }

        var t = rating * 10 / 2;
        for (var i = 0; i < 5; i++) {
            if (t >= 10) {
                html += full_star;
            } else {
                if (t > 5) {
                    html += half_star;
                } else {
                    html += empty_star;
                }
            }
            t -= 10;
        }
        $("#hstatus"+id).html("");
        $("#stars"+id).html(html);
        $("#hrating"+id).html("Rating " + rating + "/10");
        $(".help-block").html('<a href="/' + res.data.slug + '" target="_blank">API Endpoint for periodic updates of data</a>');
        return;
      }else{
        if(res.data){
          total += parseInt(res.data);
          p = total;
        }
      }
      $('#hstatus'+id).html("Synthesizing Data: "+p+" tweets processed");
    }
    console.log(message.data);
  };

  socket.onclose = function() {
    console.log('connection closed');
  };

}

function calNGram(id, opt='inc'){
  var topic = $("#topic"+id).val();
  var n;
  if(opt==='inc'){
    n = parseInt($("#ngram_n").html())+1;
  }
  else {
    n = parseInt($("#ngram_n").html())-1;
  }
  $("#ngram_n").html(" "+n);
  $("#ngram_status").html("Processing...");
  $.get('/ngram?topic=' + encodeURI(topic) + "&date=" + encodeURI($("#date").val()) + "&count="+n, function(ngram) {
      $("#ngram_status").html("");
      console.log(ngram);

      if(ngram.status) {
        if(pieNgrams) pieNgrams.destroy();
        pieNgrams = new Chart($("#pie-ngrams"),{
            type: 'pie',
            data: {
              labels: ngram.data.map((v) => { return v.name; }),
              datasets: [{
                  data: ngram.data.map((v) => {return v.count; }),
                  backgroundColor: randomColor({count: ngram.data.length, 'hue': 'green'})
              }]
            }
          });
          pieNgrams.destroy();
          pieNgrams = new Chart($("#pie-ngrams"), {
              type: 'pie',
              data: {
                  labels: ngram.data.map((v) => { return v.name; }),
                  datasets: [{
                      data: ngram.data.map((v) => {return v.count; }),
                      backgroundColor: randomColor({count: ngram.data.length, 'hue': 'green'})
                  }]
              }
          });
      }
  });
}

$(document).ready(function() {

    $("#compareBtn").on('click', function() {
        calRating(1);
        calRating(2);
    });

    $("#submitBtn").on('click',function(event) {
      calRating('',true)
    });

    $("#increaseBtn").on('click', function(event){
      calNGram('','inc');
    });
    $("#decreaseBtn").on('click', function(event){
      calNGram('','dec');
    });

    $(".btn-flush").on('click', function() {
        var self = this;
        $.get('/flush?name=' + self.dataset.file + "&date=" + self.dataset.date, function(data) {
            if(data.status) {
                if(self.dataset.trigger)
                    $(self.dataset.trigger).remove();
            }
        })
    });
});
