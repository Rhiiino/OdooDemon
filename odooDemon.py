from flask import Flask
import xmlrpc.client
import subprocess
import odoorpc
import subprocess

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

        self.database = 'Midhuns_lab'        # ! Modify to reflect current database
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

    def upgrade_module(self, name):
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
    
    def reset_view(self, view_name):
        """*FUNCTIONAL, just need to formalize function."""

        database = 'Midhuns_lab'        # ! Modify to reflect current database
        username = 'admin'                 # ! Modify to match DB login for desired user
        password = 'admin'                 # ! Modify to match DB login for desired user
        url = 'http://localhost:8069'
        odoo = odoorpc.ODOO('localhost', port=8069)
        odoo.login(database, username, password)

        """
            ir.ui.fields
            -arch_prev: ?
            -arch_fs: path to view
            -arch_db: content inside arch that was saved on last module upgrade/view reset
            -reset_arch: resets the view (hard or soft (default))
        """

        x = odoo.env['ir.ui.view'].search([])  # works
        # x = odoo.env['ir.ui.view'].search([('name', '=', 'purchase_order_inherit')])   # works
        # x = odoo.env['ir.ui.view'].search([('id', '=', 2917)])  # works
        # x = odoo.env['ir.ui.view'].search([('xml_id', '=', 'anime.purchase_order_inherit_test')])  # fails

        id = odoo.env['ir.ui.view'].search([('name', '=', view_name)])  # works
        odoo.env['ir.ui.view'].browse(id[0]).reset_arch('hard')

    def odoorpc_test(self):
        """*NONFUNCTIONAL, still testing."""

        # ----- Initialize variables [Works]
        # database = 'Midhuns_lab'   
        # username = 'admin'               
        # password = 'admin'             
        # odoo = odoorpc.ODOO('localhost', port=8069)
        # odoo.login(database, username, password)

        # ----- To get a list of DBs on your local machine  [Works]
        # print(odoo.db.list())


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
        service = "odoo-server-15.0"
        # odoo.execute_kw(database, 'ir.actions.server', 'run_restart', [])  # Fail?
        # odoo.service.restart()  # Fail
        # odoo.shell('odoo.service.server.restart()')  # Fail
        # print(odoo.env['ir.config_parameter'].get_param('res.config.services'))

        subprocess.call([f'C:\Program Files\Odoo\server', 'restart'])




       




# For testing only
if __name__ == '__main__':
    od = OdooDemon(__name__)
    # od.reset_view('purchase_order_inherit')
    od.odoorpc_test()
