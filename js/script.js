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
  populateTools();

  scrollEvents();
  headerAnimation();
}

function scrollEvents() {
  var sectionList = ["header", "about", "skills", "progress", "recent"];

  jq(window).on("scroll", function () {
    var key = sectionList[0];
    var field = jq("." + key.toLowerCase());
    var triggerPoint = (field.offset().top + field.outerHeight()) - jq(window).height();
    var scrollPoint = jq(this).scrollTop();

    switch (sectionList[0]) {
      case "progress":
        triggerPoint = 2600;
        break;
      case "skills":
        triggerPoint = 1600;
        break;
    }

    //console.log(scrollPoint, triggerPoint);
    if (scrollPoint > triggerPoint) {
      switch (key) {
        case "about":
          aboutAnimation();
          break;
        case "skills":
          skillsAnimation();
          break;
        case "progress":
          progressAnimation();
          break;
        case "recent":
          recentAnimation();
          break;
      }

      sectionList.shift();
      if (sectionList.length == 0) {
        jq(window).off("scroll");
      }
    }
  });
}

function headerAnimation() {
  jq(".header .container").css("display", "flex").hide().fadeIn("slow", function () {
    jq(".header .divider div").slideDown("slow");
  });
}

function aboutAnimation() {

}

function skillsAnimation() {
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

  jq(".column.tools").fadeIn("slow");
}

function progressAnimation() {
  var timeout = 1;
  jq(".steps-container").fadeIn("slow", function () {

  });
  jq(".group").each(function () {
    console.log("call", timeout);
    jq(this).css("overflow", "hidden");
    var _direction = jq(this).hasClass("group-right") ? "right" : "left";

    jq(this).show("slide", {
      direction: _direction
    }, 1000, function () {
      jq(".point-circle", this).fadeIn("slow");
    });
  });
}

function recentAnimation() {

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