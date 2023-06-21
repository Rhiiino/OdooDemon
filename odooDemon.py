from flask import Flask
import xmlrpc.client
import subprocess
import odoorpc
import subprocess
from time import perf_counter
from dotenv import load_dotenv
import os
load_dotenv() # Load variables from .env file


class OdooDemon(Flask):
    """OdooDemon class that incorporates the flask application to run a web server as well as custom
    odoo packages for the purpose of making quality of life improvements for odoo developers."""

    def __init__(self, name):
        """Constructor for the OdooDemon class."""

        # Initialize flask variables
        super().__init__(name)

        # Access and assign environment variables
        self.host = os.getenv('MYDBHOST')
        self.port = os.getenv('MYDBPORT')
        self.database = os.getenv('MYDBNAME') 
        self.username = os.getenv('MYUSERNAME')      
        self.password = os.getenv('MYPASSWORD')   
        self.url = f'http://{self.host}:{self.port}'

        # xmlrpc.client related variables
        self.common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(self.url))
        self.uid = self.common.authenticate(self.database, self.username, self.password, {})

        # odoorpc related variables
        self.odoo = odoorpc.ODOO(self.host, port=self.port)
        self.odoo.login(self.database, self.username, self.password)


    def run(self):
        """Starts Flask server instance when called. Meant to be called once at beginning of session."""

        super().run(host=os.getenv('DEMONHOST'), port=os.getenv('DEMONPORT'), debug=True)


    def upgrade_module(self, name):
        """Upgrades the specified module."""

        module_obj = self.odoo.env['ir.module.module']
        module_ids = module_obj.search([('name', "=", name)])
        module = module_obj.browse(module_ids[0])

        try:
            t0 = perf_counter()
            module.button_immediate_upgrade()
            t1 = perf_counter()
            return {"status": 200, "time_to_upgrade": round(t1-t0, 2)}
        except Exception as e:
            return {"status": 500, "error": str(e)}


    def get_installed_modules(self):
        """Returns a list of all currently installed modules."""

        # -- xmlrpc get installed module logic
        models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(self.url))
        # Call the 'execute_kw' method on the 'models' server proxy to get a list of installed modules
        modules = models.execute_kw(self.database, self.uid, self.password, 'ir.module.module', 'search_read', [[['state', '=', 'installed']]], {'fields': ['name']})
        return modules


    def reset_view(self, view_name):
        """Takes the name of the view to reset and executes a hard reset on it."""

        # -- odoorpc implementation
        id = self.odoo.env['ir.ui.view'].search([('model_data_id.name', '=', view_name)])
        if not id:
            return {'status': 404}
        if len(id)>1:
            return {'status': 400, "error": "More than one view has this ID."}
        else:
            try:
                self.odoo.env['ir.ui.view'].browse(id[0]).reset_arch('hard')
                return {'status': 200}
            except Exception as e:
                return {'status': 400, "error": str(e)}


    def field_lookup(self, model, id, field):
        """xxx"""

        try:
            model_obj = self.odoo.env[model]
            record = model_obj.browse(int(id))
            field = record[field]
            return {"status": 200, "data":field}
        
        except Exception as e: 
            print(f"---Error: {e}")
            return {"status": 500}









if __name__ == "__main__":
    demon = OdooDemon(__name__)
    print(demon.field_lookup("purchase.order", 12, "order_line"))
