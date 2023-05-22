
// Client side JS file - OdooDemon

// Global vars
var port = 5000
// var base_url = `http://127.0.0.1:${port}/`
var base_url = `http://${process.env.DEMONHOST}:${proces.env.DEMONPORT}/`

document.addEventListener('DOMContentLoaded', function(){
    // 1. Add an event listener to all commands listed on back of plus card
    document.querySelectorAll('#command_list > li').forEach(item => {item.addEventListener('click', async function(event){
        var command = item.textContent;

        if (command == 'Restart Server'){
        } else if (command == 'Upgrade Module'){
            construct_upgrade_module_card()
        } else if (command == 'Reset View'){
            construct_reset_view_card()
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
    console.log(json_response)

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


// Function set # 3: Dynamic card constructors
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