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
        } else if (command == 'Field Search'){
            construct_field_search_card()
        }     
    })})
});



// ----- Custom JS functions -----
// Function set # 1: General
async function delete_card(event){
    /*xxx*/

    console.log("HELLO THERE")
    if (event.target.id == 'closecard'){
        // 1. Remove selected card
        var cardToRemove = event.currentTarget.parentNode
        cardToRemove.remove()

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

async function field_search(event){
    /* Makes call to server to get requested field and its respective data. */

    var container_div  = event.currentTarget.parentNode

    /* Clear notification box content */
    var notification_box = container_div.nextElementSibling 
    notification_box.textContent = ""

    /* Check if all fields have been filled*/
    var model = container_div.querySelector("#model_to_search").value
    var model_id = container_div.querySelector("#model_id_to_search").value
    var model_field = container_div.querySelector("#field_to_search").value
    if (model.length === 0 || model_id.length === 0 || model_field.length === 0){
        notification_box.textContent = "Please fill all required fields!"
        return
    }

    // Make request to server to lookup field value
    var raw_response = await fetch(
        `${base_url}fieldLookup?model=${model}&id=${model_id}&field=${model_field}`)
    var json_response = await raw_response.json()  // Returns field data or error

    // Branch depending on server response
    // console.log(`Response: ${json_response.status}`)     //TESTING
    if (json_response.status == 500){      // If error
        notification_box.textContent = "Aw Shucks. Something went wrong."
    } else if ("data" in json_response){   // If non-related field
        notification_box.innerHTML = `<span id='success_message'>${model_field}</span>: ${json_response.data}`
    } else {                               // If related field
        notification_box.innerHTML = `<span id='success_message'>Model</span>: ${json_response.model}<br><span id='success_message'>ID</span>: ${json_response.id}`
    }

}



// Function set # 3: Dynamic card constructors
async function construct_upgrade_module_card(){
    /*Constructs upgrade module card.*/

    // 1. Create article (primary shell)
    var article = document.createElement('article');
    article.className = 'card';

    // 2. Create div (secondary shell)
    var div = document.createElement("div");
    article.appendChild(div)

    // 2.x Create card closer + add delete card event listener to it
    var closerDiv = document.createElement("div");
    closerDiv.id = "closecard";
    closerDiv.addEventListener('dblclick', function(event){delete_card(event)})
    article.append(closerDiv)

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

    // 2. Create div (secondary shell)
    var div = document.createElement("div");
    article.appendChild(div)

    // 2.x Create card closer + add delete card event listener to it
    var closerDiv = document.createElement("div");
    closerDiv.id = "closecard";
    closerDiv.addEventListener('dblclick', function(event){delete_card(event)})
    article.append(closerDiv)

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

async function construct_field_search_card(){
    /* Constructs field search card. */

    // 1. Create article (primary shell) + add delete card event listener to it
    var article = document.createElement('article');
    article.className = 'card';

    // 2. Create div (secondary shell)
    var div = document.createElement("div");
    article.appendChild(div)

    // 2.x Create card closer + add delete card event listener to it
    var closerDiv = document.createElement("div");
    closerDiv.id = "closecard";
    closerDiv.addEventListener('dblclick', function(event){delete_card(event)})
    article.append(closerDiv)

    // 3. Create Title block
    var header = document.createElement("header");
    header.className = 'card-header';
    div.appendChild(header)
    var p = document.createElement('p');
    p.textContent = '# ' + document.querySelector('.card-list').childElementCount;
    header.appendChild(p);
    var h2 = document.createElement('h2');
    h2.textContent = 'Field Search';
    header.appendChild(h2)

    // 4. Create input fields
    var div_module = document.createElement('div');
    div_module.id = 'field_lookup';
    div.appendChild(div_module);

    var input_model = document.createElement('input');
    input_model.id = "model_to_search";
    input_model.type = 'text'
    input_model.placeholder = 'Model (i.e. purchase.order)'
    div_module.appendChild(input_model);

    var input_id = document.createElement('input');
    input_id.id = "model_id_to_search";
    input_id.type = 'text'
    input_id.placeholder = 'ID (i.e. 666)'
    div_module.appendChild(input_id);

    var input_field = document.createElement('input');
    input_field.id = "field_to_search";
    input_field.type = 'text'
    input_field.placeholder = 'Field (i.e. order_line)'
    div_module.appendChild(input_field);

    // 5. Create reset view button + add event listener
    var button = document.createElement("button");
    button.id = "field_search_button";
    div_module.appendChild(button);
    var h1 = document.createElement("h1");
    h1.textContent = "Lookup";
    button.appendChild(h1);
    button.addEventListener('click', function(event){field_search(event)});

   // 6. Create notification box
   var div_notification = document.createElement("div")
   div_notification.id = 'notification_box';
   div_notification.textContent = '';
   div.appendChild(div_notification);

   // 7. Prepend article to section (This is what holds the card stack)
    document.querySelector(".card-list").prepend(article)



}