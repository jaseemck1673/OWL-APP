from odoo import models, fields

class Student(models.Model):
    _name = 'owl.app'
    _description = 'Owl App'

    name = fields.Char(string='Name')