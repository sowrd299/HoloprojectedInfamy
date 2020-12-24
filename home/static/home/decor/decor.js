/* FOR DRIVING UP AND DOWN MOVING BARS */
/* (variables use "width" because they original moved left to right, changed to
    bottom to top for "historical" accuracy) */

function newTargetWidth(element) {
    element.dataset.targetwidth = Math.floor(Math.random() * element.parentElement.clientHeight);
}

function updateLoadBar(){
    let bars = document.getElementsByClassName("decorloadbar");
    for(var i = 0; i < bars.length; i++){

        let bar = bars.item(i);

        if(!'targetwidth' in bar.dataset){
            newTargetWidth(bar);
        }

        let width = bar.clientHeight;
        let target = bar.dataset.targetwidth * 1;

        if(width < target){
            width++;
        }else if(width > target){
            width--;
        }else{
            newTargetWidth(bar);
        }

        bar.style.height = width + "px";

    }
}

setInterval(updateLoadBar, 500);