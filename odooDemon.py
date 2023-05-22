from flask import Flask
import xmlrpc.client
import subprocess
import odoorpc
import subprocess
from time import perf_counter

# Description: ....



class OdooDemon(Flask):
    """OdooDemon class that incorporates the flask application to run web server as well as custom
    odoo packages for the purpose of making quality of life improvements when developing odoo."""

    def __init__(self, name):
        """Constructor for the OdooDemon class."""

        # Initialize flask variables
        super().__init__(name)

        # Initialize odoo variables
        self.host = 'localhost'
        self.port = 8069

        self.database = 'Staging_May15th'         # ! Modify to reflect current database
        self.username = 'admin'                 # ! Modify to match DB login for desired user
        self.password = 'admin'                 # ! Modify to match DB login for desired user
        self.url = 'http://localhost:8069'

        # xmlrpc.client related variables
        self.common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(self.url))
        self.uid = self.common.authenticate(self.database, self.username, self.password, {})

        # odoorpc related variables
        self.odoo = odoorpc.ODOO('localhost', port=8069)
        self.odoo.login(self.database, self.username, self.password)

        # Test vars
        self.test = 0

    def run(self):
        """Starts Flask server instance when called. Meant to be called once at beginning of session."""

        self.config['DEBUG'] = True
        super().run()


    def upgrade_module(self, name):
        """Upgrades the specified module."""

        # -- xmlrpc upgrade module logic
        """
        # Connect to the Odoo object server
        models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(self.url))
        # Upgrade a module
        module_id = models.execute_kw(self.database, self.uid, self.password, 'ir.module.module', 'search', [[('name', '=', name)]])[0]
        result = models.execute_kw(self.database, self.uid, self.password, 'ir.module.module', 'button_immediate_upgrade', [[module_id]])
        # print(result)
        """

        # -- odoorpc upgrade module logic
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
     

        # --odoorpc install module logic  *Too slow
        # module_obj = self.odoo.env['ir.module.module']
        # modules = module_obj.search([('state', '=', 'installed')])
        # modules_list = list(map(lambda x: module_obj.browse(x).name, modules))
        # return modules_list

    def reset_view(self, view_name):
        """Takes the name of the view to reset and executes a hard reset on it."""

        # -- xmlrpc implementation
        # models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(self.url))
        # module_id = models.execute_kw(self.database, self.uid, self.password, 'ir.ui.view', 'search', [[('xml_id', '=', 'cap_website.view_order_form_inherit')]])
        # print(len(module_id))
        # return
        # result = models.execute_kw(self.database, self.uid, self.password, 'ir.module.module', 'button_immediate_upgrade', [[module_id]])

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

    def get_models(self):
        """xxx"""

        temp = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(self.url))
        models = temp.execute_kw(self.database, self.uid, self.password,'ir.model', 'search_read',[[]],{'fields': ['model']})
        models = list(map(lambda x: x['model'], models))
        return models
    

    # ----- Test function -----
    def odoorpc_test(self):
        """*NONFUNCTIONAL, still testing."""

        # ----- Initialize variables [Works]
        # database = 'Midhuns_lab'   
        # username = 'admin'               
        # password = 'admin'             
        # odoo = odoorpc.ODOO('localhost', port=8069)
        # odoo.login(database, username, password)

        # ----- To get current DB  [?]
        # print(self.odoo.db.dbname())

        # ----- To get a list of DBs on your local machine  [Works]
        # print(self.odoo.db.list())

        # ----- To swtich to a different database  [?]
        # self.odoo.db.switch('midhuns_lab')



        # ----- Upgrading a module  [Works]
        # module_obj = odoo.env['ir.module.module']
        # module_ids = module_obj.search([('name', "=", "anime")])
        # module = module_obj.browse(module_ids[0])
        # module.button_immediate_upgrade()


        # ----- Get a list of all installed modules [Works]
        # module_obj = odoo.env['ir.module.module']
        # modules = module_obj.search([('state', '=', 'installed')])
        # module_list = list(map(lambda x: module_obj.browse(x).name, modules))


        # ----- Restarting odoo service [Fails]
        # service = "odoo-server-15.0"
        # odoo.execute_kw(database, 'ir.actions.server', 'run_restart', [])  # Fail?
        # odoo.service.restart()  # Fail
        # odoo.shell('odoo.service.server.restart()')  # Fail
        # print(odoo.env['ir.config_parameter'].get_param('res.config.services'))

        # subprocess.call([f'C:\Program Files\Odoo\server', 'restart'])

    def xmlrpc_test(self):

        t0 = perf_counter()
        temp = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(self.url))
        models = temp.execute_kw(self.database, self.uid, self.password,'ir.model', 'search_read',[[]],{'fields': ['model']})
        print(perf_counter()-t0)
        
        
        t0 = perf_counter()
        models_list = self.odoo.env['ir.model'].search_read([], ['model'])
        print(perf_counter() - t0)







# For testing only
if __name__ == '__main__':
    od = OdooDemon(__name__)
    # od.reset_view('view_order_form_inherit')
    od.get_models()

    # od.odoorpc_test()
    # od.xmlrpc_test()
