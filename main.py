from odooDemon import OdooDemon
from flask import request, jsonify, render_template
import subprocess


# Initialize OdooDemon instance
app = OdooDemon(__name__)

# ----- Route handlers -----
@app.route('/', methods=['POST', 'GET'])  # For v3 template (Custom card ++)
def test3():
    return render_template('v3.j2')


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


@app.route("/getInstalledModules", methods=['GET'])
def get_installed_modules():
    """Enpoint used for returning a list of all currently installed modules."""

    modules = [data['name'] for data in app.get_installed_modules()]
    payload = {'status': 200, 'modules': modules}
    return jsonify(payload)


@app.route('/getVersions', methods=['GET'])
def get_versions():
    """xxx"""

    # Check what odoo versions are installed on this device
    local_server_analysis = {}
    for v in ['14', '15', '16']:
        command = f"get-service '*odoo-server-{v}*'"  
        existence = subprocess.run(["powershell", "-Command", command], capture_output=True).stdout
        local_server_analysis[v] = True if existence else False
    
    # Check which versions have servers currently running
    server_status = get_server_status()

    return {"status":200, "installed_versions": local_server_analysis, "server_status": server_status}


@app.route('/getServerStatus', methods=['GET'])
def get_server_status():
    """xxx"""

    server_statuses = {"status": 200}
    for v in ['14', '15', '16']:
        command = f"get-service '*odoo-server-{v}*' | where-object {{$_.Status -eq 'Running'}}"
        running = subprocess.run(["powershell", "-Command", command], capture_output=True).stdout
        server_statuses[v] = True if running else False
    
    return server_statuses


@app.route('/fieldLookup', methods=['GET'])
def field_lookup():
    """looks up the requested field in the specified record from
        the specified model."""

    model = request.args.get('model')
    model_id = request.args.get('id')
    field = request.args.get('field')
    result = app.field_lookup(model, model_id, field)

    response = result
    if result["status"] == 200 and "Recordset" in str(result["data"]):
        response = { "status": 200, "id": str(result["data"].id), "model": str(result["data"]._name) }
    elif result["status"] == 200:
        response = {"status": 200, "data": result["data"]}

    return response

@app.route('/toggle_server', methods=['GET'])
def toggle_server():
    """xxx"""
    version = request.args.get('version')



@app.route('/restart_server', methods=['GET'])
def restart_server():
    """xxx"""
    version = request.args.get('version')



#Start server on specified IP address and port
if __name__ == "__main__":
    app.run()