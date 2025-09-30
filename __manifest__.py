# -*- coding: utf-8 -*-
{
    'name': "owl-app",

    'summary': "Short (1 phrase/line) summary of the module's purpose",

    'description': """
Long description of module's purpose
    """,

    'author': "My Company",
    'website': "https://www.yourcompany.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/15.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Uncategorized',
    'version': '0.1',
    'license': 'LGPL-3',

    # any module necessary for this one to work correctly
    'depends': ['base'],

    # always loaded
    'data': [
        'views/owl_views.xml',
        'views/owl_app_menu.xml',
        'security/ir.model.access.csv',

    ],
    'assets': {
        'web.assets_backend': [
            "owl-app/static/src/components/**/*",
            "owl-app/static/src/js/*",
            "owl-app/static/src/xml/*",
            'owl-app/static/src/css/*', ]
    },
    # only loaded in demonstration mode
    'application': True,
    'installabe': True,

}
