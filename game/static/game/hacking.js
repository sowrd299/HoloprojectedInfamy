let nodes;
let node_elements;

let tools;
let tool_elements;

let link_elements;

let playerNode; // the node where they player's terminal is
let targetNode; // the node the player is targeting
let enemyNodes; // a set of all nodes with enemies

let toolbar;
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
returns wether or not that is a legal tool to use
*/
function canUseTool(tool){
    return isLegalTarget(targetNode) && tool.fields.cost <= cycles
}


/*
Configures a tool UI element to respond to being clicked appropriately
*/
function setupToolButton(tool_element, tool) {
    tool_element.onclick = function(event){
        if(canUseTool(tool)){
            hack(tool);
        }
    }
}


/*
Adds a tool to the player's toolbar
*/
function giveTool(tool){
    let tool_element = tool_elements.item(0).cloneNode(true);

    tool_element.querySelector("#name").innerText = tool.fields.name;
    tool_element.id = tool.pk;
    let text_element = tool_element.querySelector("#text");
    if(text_element) text_element.innerText = tool.fields.text;

    // TODO: find a bette solution for the disappearing flavortext bracket
    let flavor_text_element = tool_element.querySelector("#flavortext");
    if(flavor_text_element) flavor_text_element.innerText = tool.fields.flavor_text;

    tool_element.querySelector("#cyclescost").innerText = tool.cost;
    tool_element.querySelector("#attacklevel").innerText = tool.attack_level;
    tool_element.querySelector("#alertlevel").innerText = tool.alert_level;

    setHoloColor(tool_element.querySelector("div"), "holored");
    setupToolButton(tool_element, tool);

    toolbar.appendChild(tool_element);
}


/*
Causes a number to change gradually
Does not work with current update model though; needs to run every frame
*/
function animateNumber(element, targetNumber){
    let currrentNumber = element.innerText * 1;
    if(currrentNumber < targetNumber){
        currrentNumber += 1;
    }else if(currrentNumber > targetNumber){
        currrentNumber -= 1;
    }
    element.innerText = currrentNumber;
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

        node_element.querySelector("#protectionlevel").innerText = node.protection_level;
        node_element.querySelector("#alertlevel").innerText = node.alert_level;

        setVisible(node_element.querySelector("#player"), node == playerNode);
        setVisible(node_element.querySelector("#target"), node == targetNode && isLegalTarget(node));
        setVisible(node_element.querySelector("#enemy"), enemyNodes.has(node));
    }

    for(let i = 0; i < tool_elements.length; i++)  {
        let element = tool_elements.item(i);
        setClass(element, "cannotuse", !canUseTool(tools[element.id]));
    }

}


/*
Attempts to advance the game state by running a "hack";
This is where most game logic is implemented
Assumes that targetNode is being targeted by the given tool
Returns the success state
*/
function hack(tool) {
    // manage cycles
    cycles -= tool.fields.cost;
    cycles += cyclesperturn; // get a cycle every move

    // move the enemies to the highest alert node near them
    // do this before changes to be simpler for the player to track
    let newEnemyNodes = new Set();
    enemyNodes.forEach(enemy => {
        let newNode = null;
        enemy.linked_nodes.forEach(node => {
            if(!newNode || node.alert_level + node.alert_rand > newNode.alert_level + newNode.alert_rand){
                newNode = node;
            }
        });
        newEnemyNodes.add(newNode);
    });
    enemyNodes = newEnemyNodes;

    // hack outcome
    let level_dif = tool.attack_level - targetNode.protection_level;
    let success = Math.random() < (tool.attack_level / targetNode.protection_level);
    let alert = Math.max(tool.alert_level, -level_dif);
    let damage = Math.max(5, level_dif); // MIN DAMAGE IMPLEMENTED HERE
    
    targetNode.alert_level += alert;
    targetNode.protection_level = Math.max(5, targetNode.protection_level - damage); // MIN ALERT LEVEL IMPLEMENTED HERE
    
    // move the player
    if(success){
        playerNode = targetNode;

        // update visibility
        playerNode.linked_nodes.forEach(node => {
            setVisible(node, true);
        });

        playerNode.linked_links.forEach(link=> {
            setVisible(link, true);
        });

        // give tools
        playerNode.pickups.forEach(tool => {
            giveTool(tool);
        });

    }else{
        boxAlert("Your tool has failed to hack successfully; you have not progressed through the Net; time has passed, and the phantoms may become aware of your failure.");
    }

    // check if the player got caught
    if(enemyNodes.has(playerNode)){
        boxAlert("You have been caught. Your have been forcibly exspelled from the Net, your terminal is being back-traced, and enemy enforcers will be at your location momentarily. We advise you run.");
    }

    // clearnup
    display();
    return success;
}


/*
To be run when the page loads
*/
function setup() {

    toolbar = document.getElementById("hackingtoolbar");
    area = document.getElementById("hackingarea");
    cycles_element = document.getElementById("cyclesavailable");

    // nodes data structure
    nodes = {};
    enemyNodes = new Set();

    nodes_json.forEach(node => {
        nodes[node.pk] = node;
        node.linked_nodes = new Set();
        node.linked_links = new Set(); // technically part of the display system... :(
        node.pickups = [];

        node.is_visible = !node.fields.is_secret;
        node.alert_level = node.fields.alert_level;
        node.alert_rand = Math.random() * 20; // scale of alert random implemented here
        node.protection_level = node.fields.protection_level;

        if(node.fields.is_player_start){
            playerNode = node;
        }

        if(node.fields.is_enemy_start){
            enemyNodes.add(node);
        }

    });

    targetNode = playerNode;


    // tools data scructrue
    tools = {};

    tools_json.forEach(tool => {
        tools[tool.pk] = tool;
        tool.cost = tool.fields.cost;
        tool.attack_level = tool.fields.attack_level;
        tool.alert_level = tool.fields.alert_level;
    });

    pickups_json.forEach(pickup => {
        nodes[pickup.fields.node].pickups.push(tools[pickup.fields.tool]);
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
        setupToolButton(tool_element, tool);
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

window.onload = setup;