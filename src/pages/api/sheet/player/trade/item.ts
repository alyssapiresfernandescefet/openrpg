import type { NextApiRequest } from 'next';
import database from '../../../../../utils/database';
import { sessionAPI } from '../../../../../utils/session';
import type { NextApiResponseServerIO } from '../../../../../utils/socket';

function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
	if (req.method === 'PUT') return handlePut(req, res);
	if (req.method === 'POST') return handlePost(req, res);
	if (req.method === 'DELETE') return handleDelete(req, res);
	res.status(404).end();
}

async function handlePut(req: NextApiRequest, res: NextApiResponseServerIO) {
	const player = req.session.player;

	if (!player) {
		res.status(401).end();
		return;
	}

	const senderId = player.id;
	const senderItemId: number | undefined = req.body.offerId;

	const receiverId: number | undefined = req.body.playerId;
	const receiverItemId: number | undefined = req.body.tradeId;

	if (!senderItemId || !receiverId) {
		res.status(400).send({ message: 'ID da oferta ou ID do jogador estão em branco.' });
		return;
	}

	const existingTrade = await database.trade.findFirst({
		where: {
			OR: [{ sender_id: receiverId }, { receiver_id: receiverId }],
		},
	});

	if (existingTrade) {
		res.status(400).send({
			message:
				'Esse jogador já está em uma troca. Por favor, aguarde até sua troca terminar.',
		});
		return;
	}

	if (receiverItemId) {
		if (senderItemId === receiverItemId) {
			res.status(400).send({ message: 'Não é possível trocar dois itens iguais.' });
			return;
		}

		const senderTradeItem = await database.playerItem.findUnique({
			where: {
				player_id_item_id: {
					player_id: senderId,
					item_id: receiverItemId,
				},
			},
		});

		if (senderTradeItem) {
			res.status(400).send({
				message: 'Você já possui esse item.',
			});
			return;
		}

		const receiverItem = await database.playerItem.findUnique({
			where: {
				player_id_item_id: {
					player_id: receiverId,
					item_id: receiverItemId,
				},
			},
		});

		if (receiverItem === null) {
			res.status(400).send({
				message: 'Essa troca não pode ser criada porque o ofertado não possui esse item.',
			});
			return;
		}
	} else {
		const receiverItem = await database.playerItem.findUnique({
			where: {
				player_id_item_id: {
					player_id: receiverId,
					item_id: senderItemId,
				},
			},
		});

		if (receiverItem !== null) {
			res.status(400).send({
				message:
					'Essa proposta não pode ser feita porque o seu ofertado já possui esse item.',
			});
			return;
		}
	}

	const trade = await database.trade.create({
		data: {
			sender_id: senderId,
			sender_object_id: senderItemId,
			receiver_id: receiverId,
			receiver_object_id: receiverItemId,
		},
	});

	const senderItem = await database.playerItem.findUnique({
		where: {
			player_id_item_id: {
				player_id: senderId,
				item_id: senderItemId,
			},
		},
		select: {
			Player: { select: { name: true } },
			Item: { select: { name: true } },
		},
	});

	if (!senderItem) {
		res.status(400).send({
			message: 'Essa troca não pode ser criada porque você não possui esse item.',
		});
		return;
	}

	res.send({ id: trade.id });

	res.socket.server.io
		?.to(`player${receiverId}`)
		.emit(
			'playerTradeRequest',
			'item',
			trade.id,
			trade.receiver_object_id,
			senderItem.Player.name,
			senderItem.Item.name
		);
}

async function handlePost(req: NextApiRequest, res: NextApiResponseServerIO) {
	const player = req.session.player;

	if (!player) {
		res.status(401).end();
		return;
	}

	const tradeId: number | undefined = req.body.tradeId;
	const accept: boolean | undefined = req.body.accept;

	if (accept === undefined || !tradeId) {
		res.status(400).send({ message: 'Aceite ou ID da troca estão em branco.' });
		return;
	}

	const trade = await database.trade.findUnique({ where: { id: tradeId } });

	if (trade === null) {
		res.status(400).send({ message: 'Essa troca não existe.' });
		return;
	}

	if (trade.receiver_id !== player.id) {
		res.status(401).end();
		return;
	}

	await database.trade.delete({ where: { id: tradeId } });

	if (!accept) {
		res.end();
		res.socket.server.io
			?.to(`player${trade.sender_id}`)
			.emit('playerTradeResponse', false);
		return;
	}

	if (trade.receiver_object_id) {
		const results = await database.$transaction([
			database.playerItem.update({
				where: {
					player_id_item_id: {
						player_id: trade.sender_id,
						item_id: trade.sender_object_id,
					},
				},
				data: { player_id: trade.receiver_id },
				include: { Item: true },
			}),
			database.playerItem.update({
				where: {
					player_id_item_id: {
						player_id: trade.receiver_id,
						item_id: trade.receiver_object_id,
					},
				},
				data: { player_id: trade.sender_id },
				include: { Item: true },
			}),
		]);

		const newSenderItem = results[0];
		const newReceiverItem = results[1];

		res.send({ item: newSenderItem });

		res.socket.server.io
			?.to(`player${trade.sender_id}`)
			.emit('playerTradeResponse', accept, {
				type: 'item',
				obj: results[1],
			});

		res.socket.server.io
			?.to('admin')
			.emit('playerItemRemove', trade.sender_id, trade.sender_object_id);
		res.socket.server.io
			?.to('admin')
			.emit('playerItemRemove', trade.receiver_id, trade.receiver_object_id);
		res.socket.server.io
			?.to('admin')
			.emit(
				'playerItemAdd',
				trade.sender_id,
				newSenderItem.Item,
				newSenderItem.currentDescription,
				newSenderItem.quantity
			);
		res.socket.server.io
			?.to('admin')
			.emit(
				'playerItemAdd',
				trade.receiver_id,
				newReceiverItem.Item,
				newReceiverItem.currentDescription,
				newReceiverItem.quantity
			);
	} else {
		const item = await database.playerItem.update({
			where: {
				player_id_item_id: {
					player_id: trade.sender_id,
					item_id: trade.sender_object_id,
				},
			},
			data: { player_id: trade.receiver_id },
			include: { Item: true },
		});

		res.send({ item });

		res.socket.server.io
			?.to(`player${trade.sender_id}`)
			.emit('playerTradeResponse', accept);

		res.socket.server.io
			?.to('admin')
			.emit('playerItemRemove', trade.sender_id, trade.sender_object_id);
		res.socket.server.io
			?.to('admin')
			.emit(
				'playerItemAdd',
				trade.receiver_id,
				item.Item,
				item.currentDescription,
				item.quantity
			);
	}

	res.end();
}

async function handleDelete(req: NextApiRequest, res: NextApiResponseServerIO) {
	if (!req.session.player) {
		res.status(401).end();
		return;
	}

	const tradeId: number | undefined = req.body.tradeId;

	if (!tradeId) {
		res.status(400).send({ message: 'ID da troca está em branco.' });
		return;
	}

	const existingTrade = await database.trade.findUnique({
		where: { id: tradeId },
		select: { id: true, receiver_id: true },
	});

	if (!existingTrade) {
		res.status(400).send({
			message: 'Você não possui nenhuma troca para cancelar.',
		});
		return;
	}

	await database.trade.delete({ where: { id: existingTrade.id } });

	res.end();
}

export default sessionAPI(handler);
