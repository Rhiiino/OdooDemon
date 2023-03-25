from flask import Flask, request, jsonify, render_template
import xmlrpc.client
from time import perf_counter

import psutil
import subprocess



class OdooDemon(Flask):
    """OdooDemon class that incorporates the flask application to run web server as well as custom
    odoo packages for the purpose of making quality of life improvements when using odoo."""

    def __init__(self, name):
        """Constructor for the OdooDemon class."""

        # Initialize flask variables
        super().__init__(name)

        # Initialize odoo variables
        self.host = 'localhost'
        self.port = 8069

        self.database = 'Staging2_mar15'        # ! Modify to reflect current database
        self.username = 'admin'                 # ! Modify to match DB login for desired user
        self.password = 'admin'                 # ! Modify to match DB login for desired user
        self.url = 'http://localhost:8069'

        self.common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(self.url))
        self.uid = self.common.authenticate(self.database, self.username, self.password, {})

        # Test vars
        self.test = 0

    def run(self):
        """Starts Flask server instance when called. Meant to be called once at beginning of session."""

        self.config['DEBUG'] = True
        super().run()

    def upgrade_module(self, name: str):
        """Upgrades the specified module."""

        # Connect to the Odoo object server
        models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(self.url))

        # Upgrade a module
        module_id = models.execute_kw(self.database, self.uid, self.password, 'ir.module.module', 'search', [[('name', '=', name)]])[0]

        result = models.execute_kw(self.database, self.uid, self.password, 'ir.module.module', 'button_immediate_upgrade', [[module_id]])
        # print(result)

    def get_installed_modules(self):
        """Returns a list of all currently installed modules."""

        models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(self.url))

        # Call the 'execute_kw' method on the 'models' server proxy to get a list of installed modules
        modules = models.execute_kw(self.database, self.uid, self.password, 'ir.module.module', 'search_read', [[['state', '=', 'installed']]], {'fields': ['name']})
        return modules

    def restart_server(self):
        """*NONFUNCTIONAL"""

        directory_path = r'C:\\Program Files\\Odooserver\\server'
        command = 'service odoo-server restart'

        # Run the command in the terminal in the specified directory
        subprocess.run(['cmd.exe', '/k', 'cd', directory_path, '&&', command])









# Initialize OdooDemon instance
app = OdooDemon(__name__)

# ----- Route handlers -----
@app.route('/', methods=['GET'])
def home():
    """Render home page."""

    payload = {}
    return render_template("home.j2")


@app.route('/restartServer', methods=['GET'])
def restart_server():
    """Restarts server"""

    payload = {'status': 200}
    return jsonify(payload)


@app.route('/getInstalledModules', methods=['GET'])
def get_modules():
    """Returns a list of all installed odoo modules"""

    modules = sorted(list(map(lambda x: x['name'], app.get_installed_modules())) )   
    payload = {'status': 200, 'modules': modules}
    return jsonify(payload)


@app.route('/upgradeModule', methods=['GET'])
def upgrade_module():
    """Upgrades the specified module."""

    module_to_upgrade = request.args.get('module')
    temp = "Odoo is currently processing a scheduled action"
    result = None
    time_elapsed = None

    # Loops until either odoo scheduled action message is overcome and module is upgraded or upgrade fails
    while temp == "Odoo is currently processing a scheduled action":
        try:
            t1 = perf_counter()
            result = app.upgrade_module(module_to_upgrade)
            time_elapsed = perf_counter() - t1
            temp = "Success"
        except Exception as e:
            if "Odoo is currently processing a scheduled action" in str(e):
                continue
            else:
                temp = "Error"
    
    payload = {}
    if temp == 'Error':
        payload = {'status': 500}
    else:
        payload = {"status": 200, 'time_to_upgrade': float(round(time_elapsed, 2))}
    
    return jsonify(payload)




# --- Testing ---
@app.route('/t0', methods=['POST', 'GET'])
def test0():

    if request.method == 'POST':
        response_obj = request.json     #You can now do stuff with the response
        return 'POST request success'  # Return response as string
    elif request.method == 'GET':
        request_obj = request.args
        return 'GET request success'   

    # You can also send back the response as a JSON object
    data_dict = {"prop1":"val1", "prop2":"val2"}
    return jsonify(data_dict)

@app.route('/v1', methods=['POST', 'GET'])  # For v1 template (Abstract)
def test1():
    return render_template('home.j2')

@app.route('/v2', methods=['POST', 'GET'])  # For v2 template (Cards)
def test2():
    return render_template('cards.j2')

@app.route('/v3', methods=['POST', 'GET'])  # For v3 template (Custom card ++)
def test3():
    return render_template('v3.j2')




#Start server on specified IP address and port
if __name__ == "__main__":
    # app.upgrade_module('cap_website')
    # app.restart_server()
    app.run()