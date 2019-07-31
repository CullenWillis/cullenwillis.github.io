$(document).ready(function () {
  jq = $.noConflict(true);
  du_checkParentSize();
  runSetup();
});

$(window).resize(function () {
  du_checkParentSize();
});


var template = null;
var tools = [
  "HTML5", "CSS3",
  "PHP", "MySQL",
  "Python", "Spark", "Scala", "Hadoop",
  "TensorFlow", "OpenCV", "GoogleAnalytics", "Git",
  "GitHub", "Photoshop", "Linux", "Windows",
  "AndroidStudio", "Unity",
];

function runSetup() {
  scrollAnimation();
  progressAnimation();
  populateTools();
}

function scrollAnimation() {
  jq(".header .container").css("display", "flex").hide().fadeIn("slow", function () {
    jq(".header .divider div").slideDown("slow");
  });
}

function progressAnimation() {
  var values = {
    "JavaScript": "85%",
    "Java": "75%",
    "C Sharp": "60%",
    "JQuery": "70%"
  };

  jq(".bars li").each(function () {
    var key = jq(".icon-wrapper .text", this).text();
    jq(".progress-amount", this).animate({
      width: values[key],
    }, 1000);

    jq(".counter", this).prop('Counter', 0).animate({
      Counter: values[key].split("%")[0]
    }, {
      duration: 1000,
      easing: 'swing',
      step: function (now) {
        jq(this).text(Math.ceil(now) + "%");
      }
    });
  });
}

function populateTools() {
  template = jq(`<li><img/><div class="text"></div></li>`);

  for (var i = 0; i < tools.length; i++) {
    var clone = template.clone();
    var element = tools[i];

    var filePath = "imgs/svgs/icon-" + element.toLowerCase() + ".svg";
    jq("img", clone)
      .attr("src", filePath)
      .attr("alt", element);
    jq(".text", clone).text(element);

    jq(".tools ul").append(clone);
  }
}

var du_checkParentSize = function () {
  var b = jq(".mainBody");

  if (b.parent().width() > 650) {
    b.removeClass("du-mobile");
  } else {
    b.addClass("du-mobile");
  }
};

startSpaceTHREE();

function startSpaceTHREE() {
  var container = document.getElementById("spaceTHREE");
  var globe = new DAT.Globe(container);
  globe.animate();
};