from odooDemon import OdooDemon
from flask import request, jsonify, render_template


# Initialize OdooDemon instance
app = OdooDemon(__name__)

# ----- Route handlers -----
@app.route('/', methods=['POST', 'GET'])  # For v3 template (Custom card ++)
def test3():
    return render_template('v3.j2')


@app.route('/restartServer', methods=['GET'])
def restart_server():
    """Restarts server"""

    payload = {'status': 200}
    return jsonify(payload)


@app.route('/resetView', methods=['GET'])
def reset_view():
    """Performs a hard reset on the specified view."""

    view_to_reset = request.args.get('view')
    result = app.reset_view(view_to_reset)
    return result


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


@app.route("/getInstalledModules", methods=['GET'])
def get_installed_modules():
    """Enpoint used for returning a list of all currently installed modules."""

    modules = [data['name'] for data in app.get_installed_modules()]
    payload = {'status': 200, 'modules': modules}
    return jsonify(payload)



#Start server on specified IP address and port
if __name__ == "__main__":
    app.run()