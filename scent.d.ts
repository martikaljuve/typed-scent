// Type definitions for Scent v0.8.3
// Project: https://github.com/BlackDice/scent
// Definitions by: Marti Kaljuve <https://github.com/martikaljuve>

declare module Scent {
	// Action

	interface ActionStatic {
		new(name: any) : ActionType;
	}

	interface ActionType {
		trigger(data, meta);
		each(iterator: (action: ActionType) => void, ctx: any);

		time: number;
		data: any;
		meta: any;
	}

	export var Action : ActionStatic;

	// Engine

	type SystemFunction = (...args: any[]) => void;

	export class Engine {
		constructor(
			initializer?: (
				engine: Engine,
				provide: (name: string, injection: any) => void
			) => void
		);

		registerComponent(componentType: ComponentType, componentId?: any) : void;
		accessComponent(componentId: any) : BaseComponent;
		createComponent(componentId: any) : ComponentType;

		/**
		 * Adds existing entity to engine.
		 */
		addEntity(entity: Entity);

		/**
		 * Builds entity from array of components.
		 */
		buildEntity(components: (string | Component | ComponentType)[]);

		/**
		 * Number of entities in the engine.
		 */
		size: number;

		/**
		 * Adds a system to the engine.
		 */
		addSystem(system: System | SystemFunction);

		/**
		 * Adds multiple systems to the engine.
		 */
		addSystems(systems: (System | SystemFunction)[]);

		/**
		 * Starts the engine.
		 */
		start(done?: (err) => void) : Engine;

		/**
		 * Updates the engine. Actions are processed, node types are updated
		 * and onUpdate callbacks are called.
		 */
		update(...args: any[]);

		/**
		 * Registers a callback that is called when update() method is invoked.
		 */
		onUpdate(callback: (...args: any[]) => void);

		getActionType(actionName: any, noCreate: boolean) : ActionType;
		triggerAction(actionName: string, data?: any, meta?: any) : Engine;
		onAction(actionName: string, callback: (action: ActionType) => void) : Engine;

		getNodeType(componentTypes: (string | Component | ComponentType)[]) : Node;
	}

	// Entity

	export class Entity {
		/**
		 * Accepts optional array of component instances that are about to be
		 * added to entity right away.
		 */
		constructor(
			components?: (string|BaseComponent|ComponentType)[],
			componentProvider?: (componentName) => ComponentType
		);

		/**
		 * Adds component instance to entity. Only a single instance of one
		 * component type can be added. Trying to add component of same type
		 * preserves the previous one while issuing a log message to notify
		 * about a possible logic error.
		 */
		add(component: BaseComponent) : Entity;
		add(component: ComponentType) : Entity;
		add(component: string) : Entity;

		/**
		 * Removes component type from the entity; removed component is marked
		 * for disposal.
		 */
		remove(component: ComponentType) : Entity;

		/**
		 * Similar to add method, but disposes component of same type before
		 * adding new one.
		 */
		replace(component: ComponentType) : Entity;

		/**
		 * Returns whether the component type exists in entity. Passing true
		 * in second argument will consider currently disposed components.
		 */
		has(component: ComponentType, allowDisposed?: boolean) : boolean;

		/**
		 * Retrieves component instance by specified type. Returns null if no
		 * component of such type is present. Passing true in the second
		 * argument will consider currently disposed elements.
		 */
		get(component: ComponentType, allowDisposed?: boolean) : BaseComponent;

		/**
		 * Number of components in entity.
		 */
		size: number;

		/**
		 * Timestamp of the latest change in entity.
		 */
		changed: number;

		/**
		 * Retrieves list of components within entity. Optionally an array for
		 * storing results can be supplied.
		 * Expected to be called in context of entity instance.
		 */
		getAll(result?: any[]): ComponentType[];

		dispose() : void;

		/**
		 * Returns entity from pool of disposed ones or creates a new entity.
		 * Accepts array of components, same as Entity constructor.
		 */
		static pooled(components: ComponentType[]);
	}

	// Component

	// e.g. var cBuilding = new Component('building', 'floors');
	interface Component {
		new(name: string, definition?: string) : ComponentType;
	}

	// e.g. var building = new cBuilding([3]);
	interface ComponentType {
		new(data?: any[]) : BaseComponent;

		typeName: string;
		typeFields: string[];
		typeIdentity: number;
		typeDefinition: string;

		pooled(): ComponentType;
	}

	interface BaseComponent {
		inspect() : Object;
		toString() : string;
	}

	export var Component : Component;

	// Node
	export class Node {
		constructor(
			componentTypes : (string | ComponentType)[],
			componentProvider?: (type: any) => ComponentType
		);

		head: Node;
		tail: Node;
		size: number;
		types: ComponentType[];

		/**
		 * Checks if entity fulfills component type constraints defined for
		 * node type.
		 */
		entityFits(entity: Entity) : boolean;

		/**
		 * Adds a new entity to the list. It rejects entities that are already
		 * on the list or if required components are missing.
		 */
		addEntity(entity: Entity) : Node;

		/**
		 * Removes entity from the node type if it no longer fits in the node
		 * type constraints.
		 */
		removeEntity(entity: Entity) : Node;

		/**
		 * An entity that is not part of the node type will be checked against
		 * component type constraints and added if valid; Otherwise, entity is
		 * removed from node type forcefully.
		 */
		updateEntity(entity: Entity) : Node;

		/**
		 * Loops over node items.
		 */
		each(loopNodes: (node, ...args: any[]) => Node, ...args: any[]);

		/**
		 * Finds the first node item matching a predicate.
		 */
		find(findPredicate: (node, ...args: any[]) => boolean) : Node;

		/**
		 * Registers a callback function that will be called whenever a new
		 * entity is added to the node type. Callbacks will be executed when
		 * finish() method is invoked.
		 */
		onAdded(callback: (node: Node) => void);

		/**
		 * Similar to onAdded; invokes callbacks for each removed entity when
		 * finish() method is invoked.
		 */
		onRemoved(callback: (node: Node) => void);

		/**
		 * Used to invoke registered onAdded and onRemoved callbacks.
		 */
		finish();

		inspect(metaOnly?: boolean) : Object;
	}

	// System

	export class System {
		static define(name: string, initializer: (...args: any[]) => void);
	}
}

declare module 'scent' {
    export = Scent;
}
