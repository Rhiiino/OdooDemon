// Client side JS file - OdooDemon


// Global vars
var base_url = "http://localhost:1027/"    // Format: "http://{host}:{port}/", the host and port should match the DEMONHOST and DEMONPORT variables listed in your .env file

document.addEventListener('DOMContentLoaded', function(){
    // 1. Add an event listener to all commands listed on back of plus card
    document.querySelectorAll('#command_list > li').forEach(item => {item.addEventListener('click', async function(event){
        var command = item.textContent;

        if (command == 'Restart Server'){
        } else if (command == 'Upgrade Module'){
            construct_upgrade_module_card()
        } else if (command == 'Reset View'){
            construct_reset_view_card()
        } else if (command == 'Server Control'){
            construct_server_control_card()
        } else {
        }     
    })})
});



// ----- Custom JS functions -----
// Function set # 1: General
async function delete_card(event){
    /*xxx*/

    if (event.target.className == 'card'){
        // 1. Remove selected card
        event.target.remove()

        // 2. Update visible card # (Sets card labels from left to right, in desending order)
        var cards = document.querySelectorAll(".card")
        var card_counter = cards.length - 1
        for (var c of cards){
            c.querySelector(".card-header > p").textContent = "# " + card_counter
            card_counter--
        }
    }
}



// Function set # 2: Endpoint callers
async function upgrade_module(event){
    /* makes call to the appropriate endpoint to upgrade the specified module. */

    var parent_node = event.currentTarget.parentNode
    var module_to_upgrade = parent_node.querySelector("#installed_modules").value

    if (!module_to_upgrade){
        parent_node.querySelector("#notification_box").textContent = "You must select a module."
        return
    }

    parent_node.querySelector("#notification_box").textContent = "Upgrading of '" + module_to_upgrade + "' in progress...."
    parent_node.parentNode.style.animation = "pulse_effect_yellow 2s infinite"     // Set animation style of card (aka article)

    // Make request to server to upgrade
    var raw_response = await fetch(base_url + 'upgradeModule?module=' + module_to_upgrade)
    var json_response = await raw_response.json()  // Returns status of requested upgrade

    // Execute based on server response
    if (json_response.status == 500){
        parent_node.querySelector('#notification_box').innerHTML = `${module_to_upgrade} Upgrade Failed.<br><span id='error_message'>Error:</span> ${json_response.error}`
        parent_node.parentNode.style.animation = "pulse_effect_red 2s infinite"
        return
    }

    parent_node.querySelector('#notification_box').innerHTML = `Module '${module_to_upgrade}' has been <span id='success_message'>successfully</span> upgraded in <span id='upgrade_time'>${json_response.time_to_upgrade}s</span>!`
    parent_node.parentNode.style.animation = "pulse_effect_green 2s infinite"


}

async function load_modules(select){
    /*xxx*/

    // Make request to server to get list of all installed modules
    var raw_response = await fetch(base_url + 'getInstalledModules')
    var json_response = await raw_response.json()  // Returns list of installed module
    var modules = json_response.modules

    // Insert module list into webpage using DOM manipulation
    modules.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.text = item;
        select.appendChild(option);
      });
   
}

async function reset_view(event){
    /* Makes call to the appropriate endpoint to reset the specified view. */

    var parent_node = event.currentTarget.parentNode
    var view_to_reset = parent_node.querySelector("#view_to_reset").value

    if (!view_to_reset){
        parent_node.querySelector("#notification_box").textContent = "You must specify a view."
    }

    parent_node.querySelector("#notification_box").textContent = "Hard reset of '" + view_to_reset + "' in progress...."
    parent_node.parentNode.style.animation = "pulse_effect_yellow 2s infinite"     // Set animation style of card (aka article)

    // Make request to server to upgrade
    var raw_response = await fetch(base_url + 'resetView?view=' + view_to_reset)
    var json_response = await raw_response.json()  // Returns status of requested view reset
    console.log(json_response)

    // Execute based on server response
    if (json_response.status == 404){  // If not views with the identifier was found
        parent_node.querySelector('#notification_box').innerHTML = `Reset of ${view_to_reset} failed. <br><span id='error_message'>Error:</span>The view ${view_to_reset} could not be found.`
        parent_node.parentNode.style.animation = "pulse_effect_red 2s infinite"

    } else if (json_response.status == 400){ 
        parent_node.parentNode.style.animation = "pulse_effect_red 2s infinite"
        if (json_response.error == "More than one view has this ID."){   // If more than one view matching the identifer was found.
            parent_node.querySelector('#notification_box').innerHTML = `Reset of ${view_to_reset} failed.<br><span id='error_message'>Error:</span> ${json_response.error}`
        } else {    // If an error occured while resetting view
            parent_node.querySelector('#notification_box').innerHTML = `Reset of ${view_to_reset} failed.<br><span id='error_message'>Error:</span> ${json_response.error}`
        }

    } else {
        // For successfull reset
        parent_node.querySelector('#notification_box').innerHTML = `View '${view_to_reset}' has been <span id='success_message'>successfully</span> reset!`
        parent_node.parentNode.style.animation = "pulse_effect_green 2s infinite"

    }  
}

async function restart_server(event){
    /* xxx */

    var clicked_element  = event.currentTarget
    var version_to_restart = clicked_element.id
    var server_status = document.querySelector("#toggle_v" + version_to_restart).value
    console.log("Version to restart: " + version_to_restart + server_status)

    // Check if server is off (aka corresponding toggle is off), if so inform user and exit

}

async function toggle_server(event){
    /* xxx */

    // 1. Initialize variables
    var clicked_element  = event.currentTarget
    // console.log("Initial status: " + clicked_element.value) // Debugging
    clicked_element.value = (clicked_element.value == 'on') ? 'off' : 'on'  // Update value of toggle (on or off)
    var version_to_toggle = clicked_element.parentNode.id // Get id (aka odoo version) of toggle container for clicked input element  
    console.log("Version to toggle: " + version_to_toggle) // Debugging

    // x. Disable card before request is made
    secondary_shell = document.querySelector("#" + version_to_toggle)
    // secondary_shell.querySelector('#notification_box').innerHTML = `Please Wait. Odoo V${version_to_toggle} is turning ${clicked_element.value}...`
    // parent_node.parentNode.style.animation = "pulse_effect_green 2s infinite"


    // x. Make server request to toggle


}


// Function set # 3: Dynamic card constructors
async function construct_server_control_card(){
    /*Constructs Server Control card.*/
    console.log("SERVER CONTROL CARD SELECTED")

    // 1. Create article (primary shell) + add delete card event listener to it
    var article = document.createElement('article');
    article.className = 'card';
    article.addEventListener('dblclick', function(event){delete_card(event)})

    // 2. Create div (secondary shell)
    var div = document.createElement("div");
    article.appendChild(div)

    // 3. Create Title block
    var header = document.createElement("header");
    header.className = 'card-header';
    div.appendChild(header)
    var p = document.createElement('p');
    p.textContent = '# ' + document.querySelector('.card-list').childElementCount;
    header.appendChild(p);
    var h2 = document.createElement('h2');
    h2.textContent = 'Server Control';
    header.appendChild(h2)

    // 4. Query server to obtain local device stats (i.e. What odoo version are on device + which versions are not/running)
    var raw_response = await fetch(base_url + 'getVersions')
    var json_response = await raw_response.json()  // Returns local server(s) data
    console.log(json_response)
    
    // 5. Construct Toggles (one for each version of odoo on this device)
    var maintogglecontainer = document.createElement("div")
    maintogglecontainer.className = "maintogglecontainer"
    for (var version in json_response['installed_versions']){
        if (json_response['installed_versions'][version] == true){  // Ensures toggles are only created for installed odoo versions
            // A. Create toggle container
            var togglediv = document.createElement("div")
            togglediv.className = "toggle_container" // Set ID to odoo version this button is intended for
            togglediv.id = version
            // B. Create Toggle Label
            var togglelabel = document.createElement("label")
            togglelabel.for = "toggle_v" + version
            togglelabel.textContent = "v" + version
            togglediv.appendChild(togglelabel)
            // C. Create break line
            togglediv.appendChild(document.createElement("br"))
            // D. Create Toggle Input
            var toggleinput = document.createElement("input")
            toggleinput.className = "toggle"
            toggleinput.id = "toggle_v" + version
            toggleinput.type = "checkbox"
            toggleinput.value = 'off' // Set initial value to off
            togglediv.appendChild(toggleinput)
            console.log(toggleinput.value)
            // x. Set toggle to true if this particular version is running
            if (json_response['server_status'][version] == true){
                toggleinput.click()
                toggleinput.value = 'on' 
            }
            toggleinput.addEventListener('click', function(event){toggle_server(event)}) // Add event listener
            // E. Create reset button container
            var resetButtonContainer = document.createElement("div")
            var resetButtonImg = document.createElement("img")
            resetButtonImg.id = version // Set ID to odoo version this button is intended for easy access later
            resetButtonImg.src = "static/img/restart_icon.png"
            resetButtonImg.addEventListener('click', function(event){restart_server(event)})
            resetButtonContainer.appendChild(resetButtonImg)
            togglediv.appendChild(resetButtonContainer)
            // F. Finally, append toggle button to main toggle container
            maintogglecontainer.append(togglediv)
        }
    }

    // 6. Append toggle container to secondary shell
    div.appendChild(maintogglecontainer)

    // 7. Create notification box
    var notification_box = document.createElement("div")
    notification_box.id = "notification_box"
    div.appendChild(notification_box)

    // 8.. Prepend primary shell (article) to section (This is what holds the card stack)
    document.querySelector(".card-list").prepend(article)


}

async function construct_upgrade_module_card(){
    /*Constructs upgrade module card.*/

    // 1. Create article (primary shell) + add delete card event listener to it
    var article = document.createElement('article');
    article.className = 'card';
    article.addEventListener('dblclick', function(event){delete_card(event)})

    // 2. Create div (secondary shell)
    var div = document.createElement("div");
    article.appendChild(div)

    // 3. Create Title block
    var header = document.createElement("header");
    header.className = 'card-header';
    div.appendChild(header)
    var p = document.createElement('p');
    p.textContent = '# ' + document.querySelector('.card-list').childElementCount;
    header.appendChild(p);
    var h2 = document.createElement('h2');
    h2.textContent = 'Upgrade Module';
    header.appendChild(h2)

    // 4. Create card module dropdown + Populate select with installed modules
    var div_module = document.createElement('div');
    div_module.id = 'module_select';
    div.appendChild(div_module);
    var select = document.createElement('select');
    select.id = "installed_modules";
    div_module.appendChild(select);
    option = document.createElement('option');
    option.textContent = "Select a module";
    option.value = "";
    select.appendChild(option);
    load_modules(select) 

    // 5. Create upgrade button + add event listener
    var button = document.createElement("button");
    button.id = "upgrade_button";
    div.appendChild(button);
    var h1 = document.createElement("h1");
    h1.textContent = "Upgrade";
    button.appendChild(h1);
    button.addEventListener('click', function(event){upgrade_module(event)});

   // 6. Create notification box
   var div_notification = document.createElement("div")
   div_notification.id = 'notification_box';
   div_notification.textContent = 'Select a module to upgrade.';
   div.appendChild(div_notification);

   // 7. Prepend article to section (This is what holds the card stack)
    document.querySelector(".card-list").prepend(article)

}

async function construct_reset_view_card(){
    /*Constructs reset view card.*/

    // 1. Create article (primary shell) + add delete card event listener to it
    var article = document.createElement('article');
    article.className = 'card';
    article.addEventListener('dblclick', function(event){delete_card(event)})

    // 2. Create div (secondary shell)
    var div = document.createElement("div");
    article.appendChild(div)

    // 3. Create Title block
    var header = document.createElement("header");
    header.className = 'card-header';
    div.appendChild(header)
    var p = document.createElement('p');
    p.textContent = '# ' + document.querySelector('.card-list').childElementCount;
    header.appendChild(p);
    var h2 = document.createElement('h2');
    h2.textContent = 'Reset View';
    header.appendChild(h2)

    // 4. Create input field
    var div_module = document.createElement('div');
    div_module.id = 'choose_view';
    div.appendChild(div_module);
    var input = document.createElement('input');
    input.id = "view_to_reset";
    input.setAttribute('type', 'text')
    input.setAttribute('name', 'view_id')
    input.setAttribute('placeholder', 'Enter View identifer')
    div_module.appendChild(input);

    // 5. Create reset view button + add event listener
    var button = document.createElement("button");
    button.id = "reset_button";
    div.appendChild(button);
    var h1 = document.createElement("h1");
    h1.textContent = "Reset";
    button.appendChild(h1);
    button.addEventListener('click', function(event){reset_view(event)});

   // 6. Create notification box
   var div_notification = document.createElement("div")
   div_notification.id = 'notification_box';
   div_notification.textContent = 'Specify the technical name of the view you would like to reset.';
   div.appendChild(div_notification);

   // 7. Prepend article to section (This is what holds the card stack)
    document.querySelector(".card-list").prepend(article)


}