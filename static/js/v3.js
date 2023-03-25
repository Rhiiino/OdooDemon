
// Client side JS file

// Global vars
var port = 5000
var base_url = `http://127.0.0.1:${port}/`

document.addEventListener('DOMContentLoaded', function(){
    
    // Add an event listener to all commands listed on back of plus card
    document.querySelectorAll('#command_list > li').forEach(item => {item.addEventListener('click', async function(event){
        var command = item.textContent;

        // 1. xxx


        if (command == 'Restart Server'){
        } else if (command == 'Upgrade Module'){
            construct_upgrade_module_card()
        } else if (command == 'Reset View'){
        } else {
        }
            
    })})

});


 
// ----- Custom JS functions -----
async function test(){
    document.querySelector('#notification').innerHTML = "Restarting odoo server ....."
    var raw_response = await fetch(base_url + 'restartServer')
    var data = await raw_response.json()
    console.log(data)
    document.querySelector('#notification').innerHTML = "Restart complete."
}

async function upgrade_module(event){
    /*xxx*/

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
        parent_node.querySelector('#notification_box').innerHTML = `An error occurred while upgrading the ${module_to_upgrade} module.`
        parent_node.parentNode.style.animation = "pulse_effect_red 2s infinite"
        return
    }

    parent_node.querySelector('#notification_box').innerHTML = `Module '${module_to_upgrade}' has been successfully upgraded in ${json_response.time_to_upgrade}s!`
    parent_node.parentNode.style.animation = "pulse_effect_green 2s infinite"


}


async function load_modules(select){
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

async function construct_upgrade_module_card(){
    /*Constructs upgrade module card.*/

    // Initialize variables
    var x = document.querySelector('.card-list').childElementCount
    console.log(x)


    // 1. Create article (primary shell)
    var article = document.createElement('article');
    article.className = 'card';

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
