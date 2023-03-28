from odooDemon import OdooDemon
from flask import request, jsonify, render_template

# Description: ....



# Initialize OdooDemon instance
app = OdooDemon(__name__)

# ----- Route handlers -----
@app.route('/v3', methods=['POST', 'GET'])  # For v3 template (Custom card ++)
def test3():
    return render_template('v3.j2')


@app.route('/restartServer', methods=['GET'])
def restart_server():
    """Restarts server"""

    payload = {'status': 200}
    return jsonify(payload)


@app.route('/getInstalledModules', methods=['GET'])
def get_modules():
    """Returns a list of all installed odoo modules"""

    # odoorpc module logic
    # modules = app.get_installed_modules()
    # payload = {'status': 200, 'modules': modules}
    # return jsonify(payload)

    # xmlrpc module  logic
    modules = sorted(list(map(lambda x: x['name'], app.get_installed_modules())) )   
    payload = {'status': 200, 'modules': modules}
    return jsonify(payload)


@app.route('/upgradeModule', methods=['GET'])
def upgrade_module():
    """Upgrades the specified module."""

    module_to_upgrade = request.args.get('module')
    result = app.upgrade_module(module_to_upgrade)
    return result



    # --- Old logic involing xmlrpc:
    # module_to_upgrade = request.args.get('module')
    # temp = "Odoo is currently processing a scheduled action"
    # result = None
    # time_elapsed = None

    # # Loops until either odoo scheduled action message is overcome and module is upgraded or upgrade fails
    # while temp == "Odoo is currently processing a scheduled action":
    #     try:
    #         t1 = perf_counter()
    #         result = app.upgrade_module(module_to_upgrade)
    #         time_elapsed = perf_counter() - t1
    #         temp = "Success"
    #     except Exception as e:
    #         if "Odoo is currently processing a scheduled action" in str(e):
    #             continue
    #         else:
    #             temp = "Error"
    
    # payload = {}
    # if temp == 'Error':
    #     payload = {'status': 500}
    # else:
    #     payload = {"status": 200, 'time_to_upgrade': float(round(time_elapsed, 2))}
    
    # return jsonify(payload)

@app.route('/resetView', methods=['GET'])
def reset_view():
    """Performs a hard reset on the specified view."""

    view_to_reset = request.args.get('view')
    result = app.reset_view(view_to_reset)
    return result





# --- Test routes ---
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




#Start server on specified IP address and port
if __name__ == "__main__":
    pass
    # app.upgrade_module('cap_website')
    # app.restart_server()
    app.run()



    