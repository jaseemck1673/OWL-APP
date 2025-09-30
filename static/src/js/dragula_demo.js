/** @odoo-module **/

import { Component, onMounted, useRef, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { loadJS } from "@web/core/assets";

class DragulaBoard extends Component {
    setup() {
        this.leftRef = useRef("left");
        this.rightRef = useRef("right");
        this.selectedTextRef = useRef("selectedText");
        this.drake = null;

        this.state = useState({
            selectedItem: null
        });

        onMounted(async () => {
            // Load Dragula library
           await loadJS("https://unpkg.com/dragula/dist/dragula.min.js");
            const left = this.leftRef.el;
            const right = this.rightRef.el;

            if (!left || !right) {
                console.error("Left or Right container not found in template.");
                return;
            }

            // Add click event listeners to all items
            this.addClickListeners(left, right);

            // Initialize Dragula
            this.drake = window.dragula([left, right], {
                moves: function (el, container, handle) {
                    return true;
                },
                accepts: function (el, target, source, sibling) {
                    return true;
                }
            });

            // Event listeners for drag and drop
            this.drake.on('drag', (el) => {
                el.classList.add('is-moving');
            });

            this.drake.on('drop', (el, target, source) => {
                el.classList.remove('is-moving');
                // Re-add click listeners after drop
                this.addClickListeners(left, right);
                console.log(`Moved from ${source.className} to ${target.className}`);
            });

            this.drake.on('cancel', (el) => {
                el.classList.remove('is-moving');
            });

            console.log("Dragula initialized successfully");
        });
    }

    addClickListeners(leftContainer, rightContainer) {
        const allItems = [
            ...leftContainer.querySelectorAll('.o_dragula_item'),
            ...rightContainer.querySelectorAll('.o_dragula_item')
        ];

        allItems.forEach(item => {
            item.onclick = (e) => {
                this.onItemClick(e.currentTarget, leftContainer, rightContainer);
            };
        });
    }

    onItemClick(element, leftContainer, rightContainer) {
        // Remove previous selection from all items
        const allItems = [
            ...leftContainer.querySelectorAll('.o_dragula_item'),
            ...rightContainer.querySelectorAll('.o_dragula_item')
        ];

        allItems.forEach(item => item.classList.remove('selected'));

        // Add selection to clicked item
        element.classList.add('selected');

        // Update the display text
        const textContent = element.textContent.trim();
        this.state.selectedItem = textContent;

        if (this.selectedTextRef.el) {
            this.selectedTextRef.el.innerHTML = `<strong>${textContent}</strong>`;
        }

        console.log("Selected:", textContent);
    }
}

DragulaBoard.template = "dragula_demo.DragulaBoard";
registry.category("actions").add("dragula_demo.board", DragulaBoard);

export default DragulaBoard;