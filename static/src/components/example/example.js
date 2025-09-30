 /** @odoo-module **/
import { Child } from "../child/child";
import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";

export class Example extends Component {
    static template = "owl_app.Example";
    static components = { Child };
}
registry.category("view_widgets").add("example", { component: Example});
