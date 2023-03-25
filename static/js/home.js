
// Client side JS file

// Global vars
var port = 5000
var base_url = `http://127.0.0.1:${port}/`

document.addEventListener('DOMContentLoaded', function(){
    load_modules()  // Load modules to dropdown upon page load
    document.querySelectorAll('.divset').forEach(item => {item.addEventListener('click', async function(event){

        // Initialize variables
    

        // When div1 is clicked (Restart server)
        if (event.target.id == 'div1'){
            console.log("DIV 1")
			restart_server()

        }

    })
    })

});


 
// ----- Custom JS functions -----
async function restart_server(){
    document.querySelector('#notification').innerHTML = "Restarting odoo server ....."
    var raw_response = await fetch(base_url + 'restartServer')
    var data = await raw_response.json()
    console.log(data)
    document.querySelector('#notification').innerHTML = "Restart complete."
}


async function load_modules(){
    // Make request to server to get list of all installed modules
    var raw_response = await fetch(base_url + 'getInstalledModules')
    var json_response = await raw_response.json()  // Returns list of installed module
    var modules = json_response.modules

    // Insert module list into webpage using DOM manipulation
    var dropdown = document.querySelector('#installed_modules')
    dropdown.innerHTML = '<option value="">Select a module</option>'  // Empty dropdown
    modules.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.text = item;
        dropdown.appendChild(option);
      });
}

async function upgrade_module(){
    document.querySelector('#notification').innerHTML = "Module upgrade in progress ....."

    // Get selected module
    var module_to_upgrade = document.querySelector("#installed_modules").value

    // If no module was selected, notify user and return
    if (!module_to_upgrade){
        document.querySelector('#notification').innerHTML = "Please select a module to upgrade !"
        return
    }

    // Make request to server to upgrade
    var raw_response = await fetch(base_url + 'upgradeModule?module=' + module_to_upgrade)
    var json_response = await raw_response.json()  // Returns status of requested upgrade
    console.log(json_response)

    // Execute based on server response
    if (json_response.status == 500){
        document.querySelector('#notification').innerHTML = `An error occurred while upgrading the ${module_to_upgrade} module.`
        return
    }

    document.querySelector('#notification').innerHTML = `Module ${module_to_upgrade} has been successfully upgraded in ${json_response.time_to_upgrade}s!`
}