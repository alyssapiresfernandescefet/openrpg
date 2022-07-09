import type { NextApiRequest, NextApiResponse } from 'next';
import presets from '../../utils/presets.json';
import prisma from '../../utils/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(404).end();

	const config = await prisma.config.findUnique({ where: { name: 'init' } });

	if (config && config.value === 'true') return res.status(400).end();

	const presetId = req.body.presetId || presets[0].preset_id;

	const preset = presets.find((p) => p.preset_id === presetId);

	if (!preset) return res.status(400).end();

	await prisma.$transaction([
		prisma.config.createMany({ data: getDefaultConfig() }),
		prisma.info.createMany({ data: preset.info }),
		prisma.extraInfo.createMany({ data: preset.extraInfo }),
		prisma.attribute.createMany({ data: preset.attribute }),
		prisma.spec.createMany({ data: preset.spec }),
		prisma.characteristic.createMany({ data: preset.characteristic }),
		prisma.currency.createMany({ data: preset.currency }),
		prisma.specialization.createMany({ data: preset.specialization }),
		prisma.equipment.createMany({ data: preset.equipment }),
		prisma.item.createMany({ data: preset.item }),
		prisma.spell.createMany({ data: preset.spell }),
	]);

	await prisma.$transaction([
		prisma.attributeStatus.createMany({ data: preset.attribute_status }),
		prisma.skill.createMany({ data: preset.skill }),
	]);

	res.end();
}

function getDefaultConfig() {
	return [
		{
			name: 'init',
			value: 'true',
		},
		{
			name: 'environment',
			value: 'idle',
		},
		{
			name: 'admin_key',
			value: '123456',
		},
		{
			name: 'enable_success_types',
			value: 'false',
		},
		{
			name: 'enable_automatic_markers',
			value: 'true',
		},
		{
			name: 'portrait_font',
			value: 'null',
		},
		{
			name: 'dice',
			value: JSON.stringify({
				characteristic: {
					value: 20,
					branched: false,
					enable_modifiers: false,
				},
				skill: {
					value: 20,
					branched: false,
					enable_modifiers: false,
				},
				attribute: {
					value: 100,
					branched: false,
				},
			}),
		},
	];
}
