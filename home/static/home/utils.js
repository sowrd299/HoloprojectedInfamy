/*
A file of generally usefull JS
*/

/*
Sets whether or not the given element has the given class
Works for DOM elements or Django JSON objects that correspond to DOM elements
*/
function setClass(element, domClass, value) {
    if(!(element instanceof Element)){
        element = document.getElementById(element.pk);
    }
    if(value){
        element.classList.add(domClass);
    }else{
        element.classList.remove(domClass);
    }
}


/*
Sets the visibility of the given element to the given value
Works for DOM elements or Django JSON objects that correspond to DOM elements
*/
function setVisible(element, visible, invisibleClass="hidden") {
    if(!(element instanceof Element)){
        element.is_visible = visible;
    }
    setClass(element, invisibleClass, !visible);
}


/*
Changes the holo color of the element
TODO: runs in O(nm) time, coule be faster
*/
function setHoloColor(element, holocolor){
    let holocolors = ['holored', 'holoblue', 'hologreen', 'holopurple', 'holoyellow', 'holopink', 'holobrown'];
    holocolors.forEach(color => {
        setClass(element, color, color == holocolor);
    });
}


/*
Displays something in the alert box
Takes the message to show and a function to run once it is resolved
*/
function boxAlert(message, func = null){
    let alertBoxElement = document.getElementById("alertbox");
    alertBoxElement.querySelector("p").innerText = message;
    alertBoxElement.querySelector("button").onclick = function(event){
        if(func){
            func();
        }
        setVisible(alertBoxElement, false);
    };
    setVisible(alertBoxElement, true);
}