import {
	BlockComponentEntityFallOnEvent,
	BlockComponentOnPlaceEvent,
	BlockComponentPlayerDestroyEvent,
	BlockComponentPlayerInteractEvent,
	BlockComponentPlayerPlaceBeforeEvent,
	BlockComponentRandomTickEvent,
	BlockComponentStepOffEvent,
	BlockComponentStepOnEvent,
	BlockComponentTickEvent,
	BlockCustomComponent,
	Entity
} from "@minecraft/server";

/**
 * # Damage Emitter Components
 * A `DamageEmitterComponent` is an abstract superclass for custom components that deal damage to entities
 * when they interact with a block. This class is intended to be extended by custom components that deal
 * damage to entities in different ways.
 *
 * ---
 *
 * ## States
 * `DamageEmitterComponent` provides one state property that can be used to configure the custom component:
 * - `triggered` - a boolean that identifies if the emitter has been triggered
 *
 * **Usage Example:**
 * ```json
 * "states": {
 * 	"dm:damage_on_step_triggered": [ false, true ]
 * }
 * ```
 * As seen in the example above, the `triggered` property is a boolean state that is set to `false` by default
 * and can be switched to `true` if the emitter has been triggered.
 *
 * ---
 *
 * ## Tag Parameters
 * Then there's the tag parameters that can be used to configure the custom component:
 * - `damage` - a positive integer that identifies the amount of damage that the emitter will deal
 * - `continuous` - a boolean that identifies if the emitter deals continuous damage
 *
 * **Usage Example:**
 * ```json
 * "components": {
 * 	"tag:dm:damage_on_step_damage:2": {},
 * 	"tag:dm:damage_on_step_continuous": {}
 * }
 * ```
 * As for the tag parameters, there are two types of tag parameters that can be used to configure the custom component.
 * One is a tag parameter with a value, such as `tag:dm:damage_on_step_damage:2`, and the other is a tag parameter
 * only needs to be present, such as `tag:dm:damage_on_step_continuous`.
 *
 * Usually, tag parameters with values are used to set a value for a property in the custom component, while tag
 * parameters without values are used to set a boolean property wherein the presence of the tag parameter sets the
 * property to `true` and the absence of the tag parameter sets the property to `false`.
 *
 * ### State Properties and Tag Parameters Postfix
 * All state properties and tag parameters have a postfix that is appended to the subclass's unique identifier.
 * An example of a state property is `dm:damage_on_step_damage` for the `damage` property in the
 * `DamageOnStepComponent` class.
 *
 * ---
 *
 * ## Event Handlers
 * Lastly, the `DamageEmitterComponent` class provides a set of optional event handlers that can be implemented
 * by subclasses to handle different events that occur when an entity interacts with a block. The event handlers
 * are from the `BlockCustomComponent` interface and are as follows:
 * - `beforeOnPlayerPlace` - called before a player places the block
 * - `onEntityFallOn` - called when an entity falls on the block
 * - `onPlace` - called when the block is placed
 * - `onPlayerDestroy` - called when a player destroys the block
 * - `onPlayerInteract` - called when a player interacts with the block
 * - `onRandomTick` - called on a random tick
 * - `onStepOff` - called when an entity steps off the block
 * - `onStepOn` - called when an entity steps on the block
 * - `onTick` - called on every tick
 *
 * These event handlers are all optional and can be implemented by subclasses to handle the respective events. These
 * event handlers are re-added despite the redundancy with the `BlockCustomComponent` interface to provide a clear
 * overview of the available event handlers for the `DamageEmitterComponent` class, and to allow for easy implementation
 * without the need to reference the `BlockCustomComponent` interface.
 *
 * ---
 *
 * @abstract
 * @class DamageEmitterComponent
 * @implements BlockCustomComponent
 *
 * @see BlockCustomComponent
 */
export default abstract class DamageEmitterComponent implements BlockCustomComponent {

	/**
	 * The identifier for the custom component. It has two parts: the namespace and the name.
	 * The namespace is the name or shorthand name of a plugin (i.e.: "dm" for "Defensive Measures")
	 * and the name is the name of the custom component (i.e.: "damage_on_step").
	 *
	 * @example "dm:damage_on_step"
	 */
	protected identifier: string|undefined = undefined;

	/**
	 * Identifies if the emitter has been triggered. The `triggered` property is a boolean that is set to
	 * `false` by default and can be set to `true` if the emitter has been triggered.
	 *
	 * **STATE POSTFIX:** `_triggered`
	 *
	 * @default false
	 */
	protected triggered: boolean = false;

	/**
	 * Identifies the amount of damage that the emitter will deal. The provided value must be a positive integer.
	 * Any non-integer value will be rounded down and any negative value will be set to 1.
	 *
	 * **STATE POSTFIX:** `_damage`
	 *
	 * @default 1
	 */
	protected damage: number = 1;

	/**
	 * Identifies if the emitter deals continuous damage. The `continuous` property is a boolean that is set to
	 * `false` by default and can be set to `true` if the emitter deals continuous damage.
	 *
	 * **STATE POSTFIX:** `_continuous`
	 *
	 * @default false
	 */
	protected continuous: boolean = false;

	/**
	 * Creates an instance of the `DamageEmitterComponent` class. The constructor ensures that the `identifier`
	 * property is defined and that the `damage` property is a positive integer. If the `identifier` property is
	 * not defined, an error will be thrown. On the other hand, if the `damage` property is not a positive integer,
	 * it will be set to 1 and if it is a non-integer value, it will be rounded down.
	 *
	 * @param {string} identifier The identifier for the custom component.
	 *
	 * @throws {Error} Throws an error if the `identifier` property is not defined.
	 */
	constructor(identifier: string) {
		// Ensure that the identifier property is defined.
		if ((this.identifier === undefined && identifier == undefined)
			|| (this.identifier === null && identifier == null))
			throw new Error(`The identifier property must be defined by ${this.constructor.name}.`);

		this.identifier = identifier ?? this.identifier;

		// Ensure that the damage is a positive integer.
		this.damage = Math.max(1, Math.floor(this.damage));
	}

	/**
	 * A helper function/method that fetches the value of a parameter from a list of tags. The
	 * `getParamValue` method is a static method that can be used to fetch the value of a
	 * parameter from a list of tags.
	 *
	 * @param paramTag The tag of the parameter to get the value of.
	 * @param tags The tags to search for the parameter tag.
	 *
	 * @returns {string | undefined} The value of the parameter tag or `undefined` if it is not found.
	 */
	public static getParamValue(paramTag: string, tags: string[]): string | undefined {
		return tags.filter((str, i) => {
			return str.includes(paramTag);
		})[0].replace(`${paramTag}:`, '');
	}

	/**
	 * A helper function/method that checks if a parameter tag exists in a list of tags. The
	 * `hasParam` method is a static method that can be used to check if a parameter tag exists
	 * in a list of tags.
	 *
	 * @param paramTag The parameter tag to check for.
	 * @param tags The tags to search for the parameter tag.
	 *
	 * @returns {boolean} `true` if the parameter tag is found in the tags, otherwise `false`.
	 */
	public static hasParam(paramTag: string, tags: string[]): boolean {
		return tags.includes(paramTag);
	}

	/**
	 * The identifier for the custom component. It has two parts: the namespace and the name.
	 * The namespace is the name or shorthand name of a plugin (i.e.: "dm" for "Defensive Measures")
	 * and the name is the name of the custom component (i.e.: "damage_on_step").
	 *
	 * The `getIdentifier` method returns the identifier for the custom component.
	 *
	 * @returns {string} The identifier for the custom component.
	 * @throws {Error} Throws an error if the `identifier` property is not defined.
	 * @readonly
	 */
	get getIdentifier(): string {
		if (this.identifier === undefined)
			throw new Error(`The identifier property must be defined by ${this.constructor.name}.`);

		return this.identifier;
	}

	/**
	 * Fetches the parameter tags for the custom component. The parameter tags are used to identify the custom
	 * component's parameters by utilizing tag components within a behavior file.
	 *
	 * The `parameterTags` property returns an object containing a key-value pair whereas the key
	 * is the parameter name and the value is the tag name.
	 *
	 * @returns {object} The parameter tags for the custom component.
	 */
	get parameterTags(): { [key: string]: string } {
		return {
			"damage": `${this.identifier}_damage`,
			"continuous": `${this.identifier}_continuous`
		}
	}

    beforeOnPlayerPlace?: (arg: BlockComponentPlayerPlaceBeforeEvent) => void;
    onEntityFallOn?: (arg: BlockComponentEntityFallOnEvent) => void;
    onPlace?: (arg: BlockComponentOnPlaceEvent) => void;
    onPlayerDestroy?: (arg: BlockComponentPlayerDestroyEvent) => void;
    onPlayerInteract?: (arg: BlockComponentPlayerInteractEvent) => void;
    onRandomTick?: (arg: BlockComponentRandomTickEvent) => void;
    onStepOff?: (arg: BlockComponentStepOffEvent) => void;
    onStepOn?: (arg: BlockComponentStepOnEvent) => void;
    onTick?: (arg: BlockComponentTickEvent) => void;
}

/**
 * The `DamageOnStepComponent` class is a subclass of the `DamageEmitterComponent` class that deals damage to
 * entities when they step on the block. The `DamageOnStepComponent` class is intended to be used for blocks
 * that deal damage to entities when they step on them.
 *
 * The `DamageOnStepComponent` class provides an `init` property that is set to `false` by default and is set to
 * `true` manually by the developer when the custom component has been deemed initialized. The `init` property is
 * used to mark the custom component as initialized after fetching some data from the block's state.
 */
export class DamageOnStepComponent extends DamageEmitterComponent {
	/**
	 * Identifies if the custom component has been initialized. The `init` property is a boolean that is set to
	 * `false` by default and is set to `true` manually by the developer when the custom component has been
	 * deemed initialized.
	 *
	 * @default false
	 */
	protected init: boolean = false;

	constructor() {
		super('dm:damage_on_step');
	}

	onStepOn = (event: BlockComponentStepOnEvent) => {
		const { block } = event;
		const PERMUTATION = block.permutation;

		this.triggered = true;
		block.setPermutation(PERMUTATION.withState(`${this.identifier}_triggered`, this.triggered));
	};

	onStepOff = (event: BlockComponentStepOffEvent) => {
		const { block } = event;
		const PERMUTATION = block.permutation;

		const entities = block.dimension.getEntities({
			location: {
				x: block.location.x + 0.5,
				y: block.location.y,
				z: block.location.z + 0.5
			},
			volume: {
				x: 0.5,
				y: 1,
				z: 0.5
			}
		});
		const stillHasEntity: boolean = entities.length > 0;

		entities.forEach((entity: Entity) => {
			entity.applyDamage(this.damage);
		});

		if (!stillHasEntity) {
			this.triggered = false;
			block.setPermutation(PERMUTATION.withState(`${this.identifier}_triggered`, this.triggered));
		}
	};

	onTick = (event: BlockComponentTickEvent) => {

		// Marks the custom component as initialized after fetching some data from the block's state.
		if (!this.init) {
			const { block } = event;
			const PERMUTATION = block.permutation;
			const TAGS = block.getTags();

			// Sets the trigger state to `false` if it is not defined.
			PERMUTATION.withState(`${this.identifier}_triggered`, false);

			// Fetch assigned damage via `tag:dm:damage_on_step_damage` state or use default damage.
			let damage: any = DamageEmitterComponent.getParamValue(this.parameterTags.damage, TAGS) ?? this.damage;
			damage = parseInt(damage.toString());
			this.damage = Math.max(1, Math.floor(damage));

			// Identify if the block does continuous damage or not via `dm:damage_on_step_continuous` state.
			this.continuous = DamageEmitterComponent.hasParam(this.parameterTags.continuous, TAGS) ?? this.continuous;

			// Marks the custom component as initialized.
			this.init = true;
			return;
		}

		// Runs the damage logic if the emitter has been triggered.
		if (this.triggered) {
			const { block } = event;

			const entities = block.dimension.getEntities({
				location: {
					x: block.location.x + 0.5,
					y: block.location.y,
					z: block.location.z + 0.5
				},
				volume: {
					x: 0.5,
					y: 1,
					z: 0.5
				}
			});

			if (entities.length === 0) {
				this.triggered = false;
				block.setPermutation(block.permutation.withState(`${this.identifier}_triggered`, this.triggered));
				return;
			}

			entities.forEach((entity: Entity) => {
				entity.applyDamage(this.damage);
			});
		}
	};
}

/**
 * An array of custom components that deal damage to entities when they interact with a block. The `DamageEmitters`
 * array is intended to be used to store custom components that deal damage to entities in different ways.
 *
 * If you want to add a custom component that deals damage to entities when they interact with a block, you can
 * add it to the `DamageEmitters` array by importing this array and adding into your file and then adding the
 * custom component to the array before finally exporting it again to be used in the main file.
 *
 * @example
 * ```typescript
 * import { DamageEmitters } from './DamageEmitters';
 * import { DamageOnStepComponent } from './DamageEmitters';
 *
 * DamageEmitters.push(new DamageOnStepComponent());
 *
 * export { DamageEmitters };
 * ```
 *
 * ***OR***
 *
 * @example
 * ```typescript
 * import { DamageEmitters as DE } from './DamageEmitters';
 * import { DamageOnStepComponent } from './DamageEmitters';
 *
 * export const DamageEmitters = [
 *   ...DE,
 *    new DamageOnStepComponent()
 * ];
 * ```
 *
 * @type {BlockCustomComponent[]}
 * @see DamageEmitterComponent
 * @see BlockCustomComponent
 */
export const DamageEmitters = [
	new DamageOnStepComponent()
];
