//nifty functions that don't need jQuery -- thanks stack overflow

//insert a newNode after targetNode as a sibling
function insertAfter(newNode, targetNode) {
    var p = targetNode.parentNode;
    if (p.lastchild == targetNode) {
        p.appendChild(newNode);
    } else {
        p.insertBefore(newNode, targetNode.nextsibling);
    }
}
