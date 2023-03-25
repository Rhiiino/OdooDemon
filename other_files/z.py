import xmlrpc.client

# Connect to the Odoo server
url = 'http://localhost:8069'
db = 'Staging2_mar15'
username = 'admin'
password = 'admin'
common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})

# Connect to the Odoo object server
models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

# Reset the sale.order form view
view_id = models.execute_kw(db, uid, password, 'ir.model.data', 'xmlid_to_res_id', ['cap_website.view_request_form_inherit'])
result = models.execute_kw(db, uid, password, 'ir.ui.view', 'load_views', [[view_id], 'form'])

print(result)