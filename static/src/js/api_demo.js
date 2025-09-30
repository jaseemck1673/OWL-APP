/** @odoo-module **/

import { Component, onMounted, useRef, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";

class WorkflowBoard extends Component {
    setup() {
        // --- 1. State Management (Replaces global arrays from script.js) ---
        this.state = useState({
            // Core data structure for the workflow
            workflowNodes: [],
            connections: [],

            // UI state
            selectedNode: null, // ID of the currently selected node
            // Placeholder for configuration data (since you didn't provide its JS logic)
            nodeConfigs: {},
        });

        // --- 2. References (Replaces direct document.getElementById) ---
        this.canvasRef = useRef("canvas");
        this.configPanelRef = useRef("nodeConfig");

        // --- 3. Counters ---
        this.nodeIdCounter = 0;
        this.dragType = null;

        // --- 4. Lifecycle Hook ---
        // Placeholder for third-party libs or initial DOM manipulation
        onMounted(() => {
            // Since this is a vanilla JS project, initial DOM-based updates
            // from the original script.js should happen here:
            this.updateAllConnections();
            this.showEmptyConfiguration();
        });
    }

    // --- Node and Connection Utilities (Adapted from original script.js) ---

    // Function to calculate and draw connections (highly simplified)
    // NOTE: In a real Odoo/React Flow app, the connections are usually managed
    // by the external library, but here we adapt your original utility.
    updateAllConnections() {
        // Adapt the original utility to use this.state.connections and this.canvasRef.el
        console.log("Updating all connections using vanilla DOM manipulation.");
        // Place the logic from original script.js's updateAllConnections here...
    }

    // Function to clear the board (Adapted from original script.js)
    clearCanvas() {
        if (confirm("Clear all nodes and connections?")) {
            this.state.workflowNodes = [];
            this.state.connections = [];
            this.state.selectedNode = null;
            this.state.nodeConfigs = {};
            this.nodeIdCounter = 0;

            // Clear the actual DOM canvas (if it's not managed by an external library)
            this.canvasRef.el.innerHTML = '';
            this.showEmptyConfiguration();
        }
    }

    // --- Drag & Drop Logic ---
    onDragStart(e) {
        this.dragType = e.currentTarget.dataset.type;
        e.dataTransfer.setData('text/plain', this.dragType);
        e.dataTransfer.effectAllowed = 'copy';
    }

    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        // Add visual feedback class to canvas (using this.canvasRef.el)
        this.canvasRef.el.classList.add('drop-zone');
    }

    onDragLeave(e) {
        // Clean up visual feedback
        this.canvasRef.el.classList.remove('drop-zone');
    }

    onDrop(e) {
        e.preventDefault();
        this.canvasRef.el.classList.remove('drop-zone');

        const canvas = this.canvasRef.el;
        const bounds = canvas.getBoundingClientRect();

        // Calculate position relative to canvas
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;

        // Create the new node data
        const newNode = {
            id: `node_${++this.nodeIdCounter}`,
            type: this.dragType,
            x: x,
            y: y,
            title: this.getTemplateDetails(this.dragType).title,
            icon: this.getTemplateDetails(this.dragType).icon,
            status: 'unconfigured'
        };

        // Update the state and trigger re-render
        this.state.workflowNodes = [...this.state.workflowNodes, newNode];
        this.renderNode(newNode); // Manual rendering needed for non-OWL children
    }

    // --- Manual Rendering and Selection ---

    // Helper to get node details (mimics original lookup)
    getTemplateDetails(type) {
        const map = {
            'start': { title: 'Start', icon: '▶️' },
            'end': { title: 'End', icon: '🏁' },
            'api_endpoint': { title: 'API Endpoint', icon: '🌐' },
            'condition': { title: 'Condition', icon: '❓' }
            // Add other node types from page.html
        };
        return map[type] || { title: 'Unknown', icon: '❓' };
    }

    // Since the canvas is vanilla JS, you need a method to manually create the DOM element for the new node
    renderNode(nodeData) {
        // This is a placeholder for your detailed DOM creation logic from script.js
        console.log(`Manually rendering node ${nodeData.id} into canvas.`);
        // NOTE: In a true OWL app, you would use a child OWL component for the node,
        // and the parent template would loop through this.state.workflowNodes.
        // For a vanilla implementation, you must create the HTML element manually here.
    }

    selectNode(nodeId) {
        this.state.selectedNode = nodeId;
        // Logic to update the config panel based on nodeId
    }

    showEmptyConfiguration() {
        // Logic to show the empty state in the config panel (e.g., set innerHTML)
    }
}

WorkflowBoard.template = "workflow_builder.WorkflowBoard";
// --- Registration (Matches 'tag' in workflow_actions.xml) ---
// In workflow_board.js
// THIS TAG MUST MATCH THE XML TAG EXACTLY!
registry.category("actions").add("workflow_builder.board", WorkflowBoard);

export default WorkflowBoard;