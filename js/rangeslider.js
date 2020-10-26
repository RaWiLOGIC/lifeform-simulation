// Range-Slider (Standard-Version)
function rangeslider() {
(function () {
  // RangeSlider-Element(e)
  var selector = '[data-rangeSlider]', elements = document.querySelectorAll(selector);
  // Value feedback
  function valueOutput(element) {
    var value = element.value;
    var output = element.parentNode.getElementsByTagName('output')[0];
    output.innerHTML = value;
  }
  // Multiple value feedback
  for (var i = elements.length - 1; i >= 0; i--) {
    valueOutput(elements[i]);
  }
  // Eventlistener
  Array.prototype.slice.call(document.querySelectorAll('input[type="range"]')).forEach(function (el) {
    el.addEventListener('input', function (e) {
      valueOutput(e.target);
    }, false);
  });
})();
}