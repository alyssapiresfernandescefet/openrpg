import type { PortraitAttribute } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../utils/database';
import { sessionAPI } from '../../../../utils/session';

function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'POST') return handlePost(req, res);
	res.status(404).end();
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
	const player = req.session.player;

	if (!player || !player.admin) {
		res.status(401).end();
		return;
	}

	type Attribute = { id: number; portrait: PortraitAttribute | null };

	const primary: Attribute[] | undefined = req.body.primary;
	const secondary: Attribute | null | undefined = req.body.secondary;

	if (primary === undefined || secondary === undefined) {
		res.status(400).send({ message: 'Atributo primário ou secundário estão vazios.' });
		return;
	}

	const primaryIds = primary.map((p) => p.id);

	await prisma.attribute.updateMany({ data: { portrait: null } });
	await prisma.attribute.updateMany({
		where: { id: { in: primaryIds } },
		data: { portrait: 'PRIMARY' },
	});
	if (secondary !== null)
		await prisma.attribute.update({
			where: { id: secondary.id },
			data: { portrait: 'SECONDARY' },
		});

	res.end();
}

export default sessionAPI(handler);
