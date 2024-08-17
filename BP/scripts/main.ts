import { world } from '@minecraft/server';
import { DamageEmitters } from './custom_components/blocks/DamageEmitters';

world.beforeEvents.worldInitialize.subscribe((initEvent) => {
	// Registers All Damage Emitter Custom Components
	DamageEmitters.forEach((emitter) => {
		initEvent.blockComponentRegistry.registerCustomComponent(emitter.getIdentifier, emitter);
	});
});
