import xmlrpc.client
import subprocess
import platform
import os
from odoorpc import ODOO

"""Ideas:
    1. Upgrade module
    2. Restart server   *Issues with this one
    3. Reset view
    4. Get live log?
    5. CRUD operations on records
    6. Usefull odoo related libraries (xmlrpc.client, odoorpc, ...)
    """


class OdooDemon:
    """xxx"""

    def __init__(self) -> None:
        """Connects to Odoo server and initializes variables to be used by other class methods."""

        self.database = 'Staging2_mar15'        # ! Modify to reflect current database
        self.username = 'admin'                 # ! Modify to match DB login for desired user
        self.password = 'admin'                 # ! Modify to match DB login for desired user

        self.url = 'http://localhost:8069'
        self.common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(self.url))
        self.uid = self.common.authenticate(self.database, self.username, self.password, {})


    def upgrade_module(self, name):
        """Upgrades the specified module and prints results of executed action."""

        # Connect to the Odoo object server
        models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(self.url))

        # Upgrade a module
        module_id = models.execute_kw(self.database, self.uid, self.password, 'ir.module.module', 'search', [[('name', '=', name)]])[0]
        result = models.execute_kw(self.database, self.uid, self.password, 'ir.module.module', 'button_immediate_upgrade', [[module_id]])

        print(result)
    

    def test1(self):
        """testing restarting odoo service using code. *Currently Non-functional"""
        
       # Replace with the path to your Odoo server
        odoo_path = r'C:\Program Files\Odooserver\server'

        # Set the current working directory to the Odoo server path
        os.chdir(odoo_path)

        # Command to restart the Odoo server
        restart_cmd = r'"C:\Program Files\Odooserver\server\odoo-bin" restart'

        # Execute the command to restart the server
        subprocess.Popen(restart_cmd, shell=True)

    def test2(self):
        """xxx"""

        



odoo = OdooDemon()
odoo.upgrade_module('cap_website')
# odoo.test2()