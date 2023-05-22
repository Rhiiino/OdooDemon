# odooDemon
A command panel designed to streamline workflow for odoo developers.


# Installation Instructions
1. Open .env file and set variables. Comments in the file will provide additional details
1. Create a local virtual environment using python. ( Ex. Command: "python -m venv demonenv" )
2. Activate virtual environmnet. ( Command: "./demonenv/scripts/activate)
   -If you get an error saying "...cannot be loaded because running scripts is disabled on this sytem.", 
   try running "Set-ExecutionPolicy Unrestricted -Force" before you run this command.
3. Install dependencies from requirements.txt file. ( Command: "pip3 install -r requirements.txt" )
4. Open static/js/v3.js and update variable 'base_url' to reflect your local address
4. Run main.py ( Command: "python main.py")
5. Using a web browser, visit the address that specified in your terminal (Ex: "http://localhost:1027" )