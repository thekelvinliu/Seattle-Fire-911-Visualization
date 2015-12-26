//nifty functions that don't need jQuery -- thank's stack overflow

//insert a newNode after targetNode as a sibling
function insertAfter(newNode, targetNode) {
    var p = targetNode.parentNode;
    if (p.lastchild == targetNode) {
        p.appendChild(newNode);
    } else {
        p.insertBefore(newNode, targetNode.nextsibling);
    }
}

//smooth scroll driver
function smoothScroll (element) {
    _smoothScroll(element, element.offsetTop);
}
function _smoothScroll (element, position) {
    var y = element.scrollTop;
    y += Math.round(.3*(position - y));
    if (Math.abs(y - position) <= 2) {
        element.scrollTop = position;
        return;
    }
    element.scrollTop = y;
    setTimeout(_smoothScroll, 40, element, position);
}
