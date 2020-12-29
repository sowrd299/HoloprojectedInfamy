let nodes;
let node_elements;

let tools;
let tool_elements;

let link_elements;

let playerNode; // the node where they player's terminal is
let targetNode; // the node the player is targeting
let enemyNodes; // a set of all nodes with enemies

let area;

let cycles = 4;
let cycles_element;
let cyclesperturn = 1;


/*
Targets a specific node
*/
function setTargetNode(node){
    targetNode = node;
    display();
}


/*
Traverses the screen and targeting system across a link
*/
function traverseLink(link_element) {
    nodeIds = link_element.dataset.nodes.split(" ");
    for(let i = 0; i < nodeIds.length; i++){
        let nodeId = nodeIds[i];
        let node = nodes[nodeId];
        if(node != targetNode){
            setTargetNode(node);
            break;
        }
    };
}


/*
Is legal target
*/
function isLegalTarget(node){
    return playerNode.linked_nodes.has(node) && node.is_visible;
}


/*
Sets the visibility of the given element to the given value
Works for DOM elements or Django JSON objects that correspond to DOM elements
*/
function setVisible(element, visible) {
    if(!(element instanceof Element)){
        element.is_visible = visible;
        element = document.getElementById(element.pk);
    }
    if(visible){
        element.classList.remove("hidden");
    }else{
        element.classList.add("hidden");
    }
}


/*
Attempts to advance the game state by running a "hack";
This is where most game logic is implemented
Assumes that targetNode is being targeted by the given tool
Returns the success state
*/
function hack(tool) {
    if(isLegalTarget(targetNode) && tool.fields.cost <= cycles){

        // manage cycles
        cycles -= tool.fields.cost;
        cycles += cyclesperturn; // get a cycle every move
        
        // move
        playerNode = targetNode;

        // update visibility
        playerNode.linked_nodes.forEach(node => {
            setVisible(node, true)
        });

        playerNode.linked_links.forEach(link=> {
            setVisible(link, true)
        });

        // clearnup
        display();
        return true;     
    }
    return false;
}


/*
To be run when the page loads
*/
function setup() {

    area = document.getElementById("hackingarea");
    cycles_element = document.getElementById("cyclesavailable");

    // nodes data structure
    nodes = {};
    enemyNodes = new Set();

    nodes_json.forEach(node => {
        nodes[node.pk] = node;
        node.linked_nodes = new Set();
        node.linked_links = new Set(); // technically part of the display system... :(

        node.is_visible = !node.fields.is_secret;

        if(node.fields.is_player_start){
            playerNode = node;
        }

        if(node.fields.is_enemy_node){
            enemyNodes.add(node);
        }

    });

    targetNode = playerNode;


    // tools data scructrue
    tools = {};

    tools_json.forEach(tool => {
        tools[tool.pk] = tool;
    });


    // links data structure
    links_json.forEach(link => {
        node_to = nodes[link.fields.node_to];
        node_from = nodes[link.fields.node_from];

        node_to.linked_nodes.add(node_from);
        node_from.linked_nodes.add(node_to);
    });


    // initialize the display

    node_elements = document.getElementsByClassName("hackingnode");
    for(let i = 0; i < node_elements.length; i++){
        let node = node_elements.item(i);
        let terminals = node.getElementsByClassName("hackingterminal");
        for(let j = 0; j < terminals.length; j++){
            setVisible(terminals.item(j), false)
        }

        setVisible(node, nodes[node.id].is_visible);

        // enable moving by targeting nodes
        node.onclick = function(event){
            setTargetNode(nodes[node.id]);
        }
    }

    // setup tools
    tool_elements = document.getElementsByClassName("hackingtool");
    for(let i = 0; i < tool_elements.length; i++) {
        let tool_element = tool_elements.item(i);
        let tool = tools[tool_element.id];
        tool_element.onclick = function(event){
            hack(tool);
        }
    }

    // setup links
    link_elements = document.getElementsByClassName("hackinglink");
    for(let i = 0; i < link_elements.length; i++) {
        let link_element = link_elements.item(i);
        // links as bttons
        link_element.onclick = function(event){
            traverseLink(link_element);
        }
        // hide links to hidden places
        let linked_nodes = link_element.dataset.nodes.split(" ") ;
        for(let j = 0; j < linked_nodes.length; j++){
            if(!nodes[linked_nodes[j]].is_visible){
                setVisible(link_element, false);
            }

            nodes[linked_nodes[j]].linked_links.add(link_element);
        }
    }

    // run the display
    display();

}


/*
To be run whenever the gamestate changes
*/
function display() {

    // update center the target node
    area.style.left = (area.clientWidth/2 - targetNode.fields.x_pos)+"px";
    area.style.top = (area.clientHeight/2 - targetNode.fields.y_pos)+"px";

    // update number of cycles
    cycles_element.innerText = cycles;

    // update the terminal displays
    for(let i = 0; i < node_elements.length; i++)  {
        let node_element = node_elements.item(i);
        let node = nodes[node_element.id];

        setVisible(node_element.querySelector("#player"), node == playerNode);
        setVisible(node_element.querySelector("#target"), node == targetNode && isLegalTarget(node));
        setVisible(node_element.querySelector("#enemy"), enemyNodes.has(node));
    }

}

window.onload = setup;