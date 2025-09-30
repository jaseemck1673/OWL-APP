/** @odoo-module **/

import { Component, onMounted, useRef, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { loadJS, loadCSS } from "@web/core/assets";

// The storage key for persistence
const storageKey = 'odooReactFlowState';

class ReactFlowBoard extends Component {
    setup() {
        this.flowContainerRef = useRef("flowContainer");
        this.reactFlowInstance = null;
        this.nodeId = 0;

        // 1. PERSISTENCE: Load persisted data on setup
        const storedData = localStorage.getItem(storageKey);
        let initialNodes = [];
        let initialEdges = [];
        let maxId = 0;

        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                initialNodes = data.nodes || [];
                initialEdges = data.edges || [];
                // Calculate maxId to prevent overlap on new nodes
                maxId = initialNodes.reduce((max, node) => {
                    const idNum = parseInt(node.id.split('_')[1], 10);
                    return idNum > max ? idNum : max;
                }, 0);
            } catch (e) {
                console.error("Failed to parse stored flow data:", e);
            }
        }

        this.nodeId = maxId + 1;

        this.state = useState({
            nodes: initialNodes,
            edges: initialEdges
        });

        onMounted(async () => {
            await this.loadLibraries();
            this.initializeFlow();
        });
    }

    async loadLibraries() {
        // Load React and ReactDOM
        await loadJS("https://unpkg.com/react@18.2.0/umd/react.production.min.js");
        await loadJS("https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js");
        // Load React Flow (CSS and JS)
        await loadCSS("https://cdn.jsdelivr.net/npm/reactflow@11.10.1/dist/style.min.css");
        await loadJS("https://cdn.jsdelivr.net/npm/reactflow@11.10.1/dist/umd/index.min.js");
    }

    // --- Persistence Helper Function ---
    saveFlowState() {
        const dataToStore = {
            nodes: this.state.nodes,
            edges: this.state.edges
        };
        // Save the flow data to local storage
        localStorage.setItem(storageKey, JSON.stringify(dataToStore));
    }

    // --- Node Removal Logic ---
    onRemoveNode(idToRemove) {
        this.state.nodes = this.state.nodes.filter(node => node.id !== idToRemove);
        this.state.edges = this.state.edges.filter(
            edge => edge.source !== idToRemove && edge.target !== idToRemove
        );
        this.saveFlowState();
        this.renderFlow(this.flowContainerRef.el.firstChild);
    }

    // --- Custom React Node Definition ---
    getCustomNodeComponent() {
        const { createElement, useCallback, useMemo } = window.React;
        const { Handle, Position } = window.ReactFlow;
        const onRemove = this.onRemoveNode.bind(this);

        const CustomNode = (props) => {
            const { id, data, type } = props;
            const { label } = data;

            const nodeClass = useMemo(() => {
                if (type === 'input') return 'custom-input';
                if (type === 'output') return 'custom-output';
                if (type === 'decision') return 'custom-decision';
                return 'custom-default';
            }, [type]);

            const getIcon = () => {
                if (type === 'input') return createElement('i', { className: 'fa fa-play-circle' });
                if (type === 'output') return createElement('i', { className: 'fa fa-stop-circle' });
                if (type === 'decision') return createElement('i', { className: 'fa fa-code-branch' });
                return createElement('i', { className: 'fa fa-square' });
            };

            const handleRemove = useCallback(() => {
                onRemove(id);
            }, [id]);

            return createElement('div', { className: `custom-node ${nodeClass}` },
                // Top right delete button
                createElement('button', { className: 'node-delete-btn', onClick: handleRemove },
                    createElement('i', { className: 'fa fa-times' })
                ),
                // Node content
                createElement('div', { className: 'node-content' },
                    getIcon(),
                    createElement('span', null, label)
                ),
                // Handles (ports)
                type !== 'input' ? createElement(Handle, { type: 'target', position: Position.Top }) : null,
                type !== 'output' ? createElement(Handle, { type: 'source', position: Position.Bottom }) : null
            );
        };

        return CustomNode;
    }

    initializeFlow() {
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';
        this.flowContainerRef.el.innerHTML = '';
        this.flowContainerRef.el.appendChild(container);
        this.renderFlow(container);
    }

    renderFlow(container) {
        // Pull necessary globals from the window object
        const { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges } = window.ReactFlow;
        const { createElement } = window.React;
        const { createRoot } = window.ReactDOM;

        const CustomNodeComponent = this.getCustomNodeComponent();

        const nodeTypes = {
            input: CustomNodeComponent,
            default: CustomNodeComponent,
            output: CustomNodeComponent,
            decision: CustomNodeComponent
        };

        const onConnect = (connection) => {
            const newEdge = {
                id: `e${connection.source}-${connection.target}`,
                source: connection.source,
                target: connection.target,
                animated: true
            };
            this.state.edges = [...this.state.edges, newEdge];
            this.saveFlowState(); // Save state after connecting
        };

        // 2. FIX FOR DYNAMIC CONNECTIONS: Use applyNodeChanges to correctly update nodes on drag/change
        const onNodesChange = (changes) => {
            const newNodes = applyNodeChanges(changes, this.state.nodes);
            this.state.nodes = newNodes;
            this.saveFlowState(); // Save state after node change (e.g., position update)
        };

        const onEdgesChange = (changes) => {
            // Use React Flow's utility to correctly update edges (e.g., on selection/removal)
            const newEdges = applyEdgeChanges(changes, this.state.edges);
            this.state.edges = newEdges;
            this.saveFlowState(); // Save state after edge change
        };

        const onInit = (instance) => {
            this.reactFlowInstance = instance;
        };

        const flowComponent = createElement(ReactFlow, {
            nodes: this.state.nodes,
            edges: this.state.edges,
            onConnect,
            onNodesChange,
            onEdgesChange,
            onInit,
            nodesDraggable: true,
            fitView: true,
            nodeTypes
        }, [
            createElement(Controls, { key: 'controls' }),
            createElement(Background, { key: 'bg', variant: 'dots' })
        ]);

        if (!this.root) this.root = createRoot(container);
        this.root.render(flowComponent);
    }

    onDragStart(event) {
        this.dragType = event.currentTarget.dataset.nodeType;
        event.dataTransfer.effectAllowed = 'move';
    }

    onDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    onDrop(event) {
        event.preventDefault();
        if (!this.dragType || !this.reactFlowInstance) return;

        const bounds = this.flowContainerRef.el.getBoundingClientRect();
        const position = this.reactFlowInstance.project({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top
        });

        const labels = { input: 'Start', default: 'Process', output: 'End', decision: 'Decision' };
        const newNode = {
            id: `node_${this.nodeId++}`,
            type: this.dragType,
            position,
            data: { label: `${labels[this.dragType]} ${this.nodeId}` }
        };

        this.state.nodes = [...this.state.nodes, newNode];
        this.dragType = null;
        this.saveFlowState(); // Save state after dropping a new node
        this.renderFlow(this.flowContainerRef.el.firstChild);
    }

    clearFlow() {
        if (confirm("Clear all?")) {
            this.state.nodes = [];
            this.state.edges = [];
            this.nodeId = 0;
            localStorage.removeItem(storageKey); // Clear persistence data
            this.renderFlow(this.flowContainerRef.el.firstChild);
        }
    }

    saveFlow() {
        this.saveFlowState();
        console.log({ nodes: this.state.nodes, edges: this.state.edges });
        alert(`Flow saved and persisted to local storage!\nNodes: ${this.state.nodes.length}\nConnections: ${this.state.edges.length}`);
    }
}

ReactFlowBoard.template = "reactflow_demo.ReactFlowBoard";
registry.category("actions").add("reactflow_demo.board", ReactFlowBoard);

export default ReactFlowBoard;