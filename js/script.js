$(document).ready(function () {
  jq = $.noConflict(true);
  //du_checkParentSize();
  runSetup();
});
/*
$(window).resize(function() {
  du_checkParentSize();
}); 
*/

var template = null;
var tools = ["HTML5", "CSS3", "JavaScript", "Jquery", "PHP", "MySQL", "Java", "CSharp", "Python", "Spark", "Scala", "Hadoop", "TensorFlow", "GoogleAnalytics", "Git", "GitHub", "Photoshop", "Linux", "Windows"];

function runSetup() {
  scrollAnimation();
  populateTools();
}

function scrollAnimation() {
  jq(".header .container").css("display", "flex").hide().fadeIn("slow", function () {
    jq(".header .divider div").slideDown("slow");
  });
}

function populateTools() {
  template = jq(`<li><img/><div class="text"></div></li>`);

  for (var i = 0; i < tools.length; i++) {
    var clone = template.clone();
    var element = tools[i];

    var filePath = "imgs/svgs/icon-" + element.toLowerCase() + ".svg";
    console.log(filePath);
    jq("img", clone)
      .attr("src", filePath)
      .attr("alt", element);
    jq(".text", clone).text(element);

    jq(".about ul").append(clone);
  }
}

var du_checkParentSize = function () {
  var b = jq("#wrapper");

  if (b.parent().width() > 650) {
    b.removeClass("du-mobile");
  } else {
    b.addClass("du-mobile");
  }
};

startLandingPage();

function startLandingPage() {
  intializeLanding();
}