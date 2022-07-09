import type { Equipment, PlayerEquipment } from '@prisma/client';
import type { FormEvent } from 'react';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import { BsTrash } from 'react-icons/bs';
import { FaHandHolding, FaHandsHelping } from 'react-icons/fa';
import { ErrorLogger, Socket } from '../../contexts';
import type { DiceRollEvent } from '../../hooks/useDiceRoll';
import useDiceRoll from '../../hooks/useDiceRoll';
import useExtendedState from '../../hooks/useExtendedState';
import api from '../../utils/api';
import { resolveDices } from '../../utils/dice';
import type {
	EquipmentAddEvent,
	EquipmentChangeEvent,
	EquipmentRemoveEvent,
	PlayerTradeRequestEvent,
	PlayerTradeResponseEvent,
} from '../../utils/socket';
import BottomTextInput from '../BottomTextInput';
import CustomSpinner from '../CustomSpinner';
import DataContainer from '../DataContainer';
import AddDataModal from '../Modals/AddDataModal';
import DiceRollModal from '../Modals/DiceRollModal';
import PlayerTradeModal from '../Modals/PlayerTradeModal';
import type { Trade } from '../Modals/PlayerTradeModal';

type PlayerEquipmentContainerProps = {
	playerEquipments: {
		currentAmmo: number;
		Equipment: Equipment;
	}[];
	availableEquipments: Equipment[];
	title: string;
	npcId?: number;
	partners?: {
		id: number;
		name: string;
	}[];
};

const tradeInitialValue: Trade<Equipment> = {
	type: 'equipment',
	show: false,
	offer: { id: 0, name: '' } as Equipment,
	donation: true,
};

const tradeTimeLimit = 10000;

export default function PlayerEquipmentContainer(props: PlayerEquipmentContainerProps) {
	const [diceRollResultModalProps, onDiceRoll] = useDiceRoll(props.npcId);

	const [addEquipmentShow, setAddEquipmentShow] = useState(false);
	const [loading, setLoading] = useState(false);
	const [availableEquipments, setAvailableEquipments] = useState<
		{ id: number; name: string }[]
	>(props.availableEquipments);
	const [playerEquipments, setPlayerEquipments] = useState(props.playerEquipments);
	const [trade, setTrade] = useState<Trade<Equipment>>(tradeInitialValue);
	const currentTradeId = useRef<number | null>(null);
	const tradeTimeout = useRef<NodeJS.Timeout | null>(null);

	const socket = useContext(Socket);
	const logError = useContext(ErrorLogger);

	const socket_equipmentAdd = useRef<EquipmentAddEvent>(() => {});
	const socket_equipmentRemove = useRef<EquipmentRemoveEvent>(() => {});
	const socket_equipmentChange = useRef<EquipmentChangeEvent>(() => {});
	const socket_requestReceived = useRef<PlayerTradeRequestEvent>(() => {});
	const socket_responseReceived = useRef<PlayerTradeResponseEvent>(() => {});

	useEffect(() => {
		socket_equipmentAdd.current = (id, name) => {
			if (availableEquipments.findIndex((eq) => eq.id === id) > -1) return;
			setAvailableEquipments((equipments) => [...equipments, { id, name }]);
		};

		socket_equipmentRemove.current = (id) => {
			const index = playerEquipments.findIndex((eq) => eq.Equipment.id === id);
			if (index === -1) return;

			setPlayerEquipments((equipments) => {
				const newEquipments = [...equipments];
				newEquipments.splice(index, 1);
				return newEquipments;
			});
		};

		socket_equipmentChange.current = (eq) => {
			const availableIndex = availableEquipments.findIndex((_eq) => _eq.id === eq.id);
			const playerIndex = playerEquipments.findIndex((_eq) => _eq.Equipment.id === eq.id);

			if (eq.visible) {
				if (availableIndex === -1 && playerIndex === -1)
					return setAvailableEquipments((equipments) => [...equipments, eq]);
			} else if (availableIndex > -1) {
				return setAvailableEquipments((equipments) => {
					const newEquipments = [...equipments];
					newEquipments.splice(availableIndex, 1);
					return newEquipments;
				});
			}

			if (availableIndex > -1) {
				setAvailableEquipments((equipments) => {
					const newEquipments = [...equipments];
					newEquipments[availableIndex] = {
						id: eq.id,
						name: eq.name,
					};
					return newEquipments;
				});
				return;
			}

			if (playerIndex === -1) return;

			setPlayerEquipments((equipments) => {
				const newEquipments = [...equipments];
				newEquipments[playerIndex].Equipment = eq;
				return newEquipments;
			});
		};

		socket_requestReceived.current = (
			type,
			tradeId,
			receiverObjectId,
			senderName,
			equipmentName
		) => {
			if (type !== 'equipment') return;

			currentTradeId.current = tradeId;

			const equip = playerEquipments.find((eq) => eq.Equipment.id === receiverObjectId);

			const accept = confirm(
				`${senderName} te ofereceu ${equipmentName}${
					receiverObjectId ? ` em troca de ${equip?.Equipment.name}.` : '.'
				}` + ' Você deseja aceitar essa proposta?'
			);

			api
				.post('/sheet/player/trade/equipment', {
					tradeId,
					accept,
				})
				.then((res) => {
					if (!accept) return;

					const newEquip: PlayerEquipment & { Equipment: Equipment } = res.data.equipment;

					if (receiverObjectId) {
						const index = playerEquipments.findIndex(
							(eq) => eq.Equipment.id === receiverObjectId
						);
						if (index === -1) return;
						const oldEq = playerEquipments[index];

						availableEquipments.push(oldEq.Equipment);
						playerEquipments[index] = newEquip;
					} else {
						playerEquipments.push(newEquip);
					}
					availableEquipments.splice(
						availableEquipments.findIndex((e) => e.id === newEquip.Equipment.id),
						1
					);

					setPlayerEquipments([...playerEquipments]);
					setAvailableEquipments([...availableEquipments]);
				})
				.catch(logError)
				.finally(() => (currentTradeId.current = null));
		};

		socket_responseReceived.current = (accept, tradeRes) => {
			if (!currentTradeId.current) return;

			currentTradeId.current = null;
			if (tradeTimeout.current) {
				clearTimeout(tradeTimeout.current);
				tradeTimeout.current = null;
			}

			if (accept) {
				const index = playerEquipments.findIndex(
					(e) => e.Equipment.id === trade.offer.id
				);
				if (index === -1) return;

				if (tradeRes) {
					if (tradeRes.type !== 'equipment')
						return logError(new Error('Expected Equipment'));
					const oldEq = playerEquipments[index];

					availableEquipments.push(oldEq.Equipment);
					availableEquipments.splice(
						availableEquipments.findIndex((e) => e.id === tradeRes.obj.Equipment.id),
						1
					);
					setAvailableEquipments([...availableEquipments]);

					playerEquipments[index] = tradeRes.obj;
				} else {
					const eq = playerEquipments.splice(index, 1)[0];
					setAvailableEquipments((e) => [...e, eq.Equipment]);
				}

				setPlayerEquipments([...playerEquipments]);
			} else {
				alert('O jogador rejeitou sua proposta.');
			}
			setLoading(false);
			setTrade(tradeInitialValue);
		};
	});

	useEffect(() => {
		socket.on('equipmentAdd', (id, name) => socket_equipmentAdd.current(id, name));
		socket.on('equipmentRemove', (id) => socket_equipmentRemove.current(id));
		socket.on('equipmentChange', (eq) => socket_equipmentChange.current(eq));
		socket.on(
			'playerTradeRequest',
			(type, tradeId, receiverObjectId, senderName, senderObjectName) =>
				socket_requestReceived.current(
					type,
					tradeId,
					receiverObjectId,
					senderName,
					senderObjectName
				)
		);
		socket.on('playerTradeResponse', (accept, eq) =>
			socket_responseReceived.current(accept, eq)
		);
		return () => {
			socket.off('equipmentAdd');
			socket.off('equipmentRemove');
			socket.off('equipmentChange');
			socket.off('playerTradeRequest');
			socket.off('playerTradeResponse');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function onAddEquipment(id: number) {
		setLoading(true);
		api
			.put('/sheet/player/equipment', { id, npcId: props.npcId })
			.then((res) => {
				const equipment = res.data.equipment;
				setPlayerEquipments([...playerEquipments, equipment]);

				const newEquipments = [...availableEquipments];
				newEquipments.splice(
					newEquipments.findIndex((eq) => eq.id === id),
					1
				);
				setAvailableEquipments(newEquipments);
			})
			.catch(logError)
			.finally(() => {
				setAddEquipmentShow(false);
				setLoading(false);
			});
	}

	function onDeleteEquipment(id: number) {
		const newPlayerEquipments = [...playerEquipments];
		const index = newPlayerEquipments.findIndex((eq) => eq.Equipment.id === id);

		if (index === -1) return;

		newPlayerEquipments.splice(index, 1);
		setPlayerEquipments(newPlayerEquipments);

		const modalEquipment = { id, name: playerEquipments[index].Equipment.name };
		setAvailableEquipments([...availableEquipments, modalEquipment]);
	}

	function onTradeShow(id: number, donation: boolean) {
		if (currentTradeId.current) {
			return alert(
				'Você ainda está em uma troca. ' +
					'Por favor, espere esta troca concluir antes de começar uma nova.'
			);
		}

		const equipment = playerEquipments.find((eq) => eq.Equipment.id === id);
		if (!equipment) return;

		return setTrade({
			type: 'equipment',
			show: true,
			offer: equipment.Equipment,
			donation,
		});
	}

	function onTradeSubmit(playerId: number, tradeId?: number) {
		setLoading(true);
		api
			.put('/sheet/player/trade/equipment', {
				offerId: trade.offer.id,
				playerId,
				tradeId,
			})
			.then((res) => {
				currentTradeId.current = res.data.id;
				tradeTimeout.current = setTimeout(() => {
					onTradeHide();
					alert(`A troca excedeu o tempo limite (${tradeTimeLimit}ms) e foi cancelada.`);
				}, tradeTimeLimit);
			})
			.catch((err) => {
				logError(err);
				setLoading(false);
				setTrade(tradeInitialValue);
			});
	}

	function onTradeHide() {
		if (currentTradeId.current) {
			api
				.delete('/sheet/player/trade/equipment', {
					data: {
						tradeId: currentTradeId.current,
					},
				})
				.catch(logError)
				.finally(() => (currentTradeId.current = null));
		}

		setTrade(tradeInitialValue);
		setLoading(false);

		if (tradeTimeout.current) {
			clearTimeout(tradeTimeout.current);
			tradeTimeout.current = null;
		}
	}

	const equipments = useMemo(
		() => playerEquipments.sort((a, b) => a.Equipment.id - b.Equipment.id),
		[playerEquipments]
	);

	return (
		<>
			<DataContainer
				outline
				title={props.title}
				addButton={{ onAdd: () => setAddEquipmentShow(true), disabled: loading }}>
				<Row className='text-center'>
					<Col>
						<Table responsive className='align-middle'>
							<thead>
								<tr>
									<th></th>
									{props.partners && props.partners.length > 0 && (
										<>
											<th></th>
											<th></th>
										</>
									)}
									<th>Nome</th>
									<th>Tipo</th>
									<th>Dano</th>
									<th></th>
									<th>Alcance</th>
									<th>Ataques</th>
									<th>Mun. Atual</th>
									<th>Mun. Máxima</th>
								</tr>
							</thead>
							<tbody>
								{equipments.map((eq) => (
									<PlayerEquipmentField
										key={eq.Equipment.id}
										equipment={eq.Equipment}
										currentAmmo={eq.currentAmmo}
										onDelete={() => onDeleteEquipment(eq.Equipment.id)}
										onTrade={(donation) => onTradeShow(eq.Equipment.id, donation)}
										showDiceRollResult={onDiceRoll}
										disableTrades={props.partners?.length === 0}
										npcId={props.npcId}
									/>
								))}
							</tbody>
						</Table>
					</Col>
				</Row>
			</DataContainer>
			<AddDataModal
				title={`Adicionar em ${props.title}`}
				show={addEquipmentShow}
				onHide={() => setAddEquipmentShow(false)}
				data={availableEquipments}
				onAddData={onAddEquipment}
				disabled={loading}
			/>
			{props.partners && props.partners.length > 0 && (
				<PlayerTradeModal
					{...trade}
					partners={props.partners}
					onHide={onTradeHide}
					onSubmit={onTradeSubmit}
					disabled={loading}
				/>
			)}
			<DiceRollModal {...diceRollResultModalProps} />
		</>
	);
}

type PlayerEquipmentFieldProps = {
	currentAmmo: number;
	equipment: {
		id: number;
		ammo: number | null;
		attacks: string;
		damage: string;
		name: string;
		range: string;
		type: string;
	};
	disableTrades?: boolean;
	onDelete: () => void;
	onTrade: (donation: boolean) => void;
	showDiceRollResult: DiceRollEvent;
	npcId?: number;
};

function PlayerEquipmentField(props: PlayerEquipmentFieldProps) {
	const [currentAmmo, setCurrentAmmo, isClean] = useExtendedState(props.currentAmmo);
	const [loading, setLoading] = useState(false);

	const logError = useContext(ErrorLogger);
	const equipmentID = props.equipment.id;

	function onAmmoChange(ev: FormEvent<HTMLInputElement>) {
		const aux = ev.currentTarget.value;
		let newAmmo = parseInt(aux);

		if (aux.length === 0) newAmmo = 0;
		else if (isNaN(newAmmo)) return;

		setCurrentAmmo(newAmmo);
	}

	function onAmmoBlur() {
		if (isClean()) return;
		let newAmmo = currentAmmo;

		if (props.equipment.ammo && currentAmmo > props.equipment.ammo)
			newAmmo = props.equipment.ammo;

		setCurrentAmmo(newAmmo);
		api
			.post('/sheet/player/equipment', {
				id: equipmentID,
				currentAmmo: newAmmo,
				npcId: props.npcId,
			})
			.catch(logError);
	}

	function diceRoll() {
		if (props.equipment.ammo && currentAmmo === 0)
			return alert('Você não tem munição suficiente.');
		const aux = resolveDices(props.equipment.damage);
		if (!aux) return;
		props.showDiceRollResult({ dices: aux });
		const ammo = currentAmmo - 1;
		setCurrentAmmo(ammo);
		api
			.post('/sheet/player/equipment', {
				id: equipmentID,
				currentAmmo: ammo,
				npcId: props.npcId,
			})
			.catch((err) => {
				logError(err);
				setCurrentAmmo(currentAmmo);
			});
	}

	function deleteEquipment() {
		if (!confirm('Você realmente deseja excluir esse equipamento?')) return;
		setLoading(true);
		api
			.delete('/sheet/player/equipment', {
				data: { id: equipmentID, npcId: props.npcId },
			})
			.then(props.onDelete)
			.catch((err) => {
				logError(err);
				setLoading(false);
			});
	}

	return (
		<tr>
			<td>
				<Button
					aria-label='Apagar'
					onClick={deleteEquipment}
					size='sm'
					variant='secondary'
					disabled={loading}>
					{loading ? <CustomSpinner /> : <BsTrash color='white' size='1.5rem' />}
				</Button>
			</td>
			{!props.disableTrades && (
				<>
					<td>
						<Button
							aria-label='Oferecer'
							onClick={() => props.onTrade(true)}
							size='sm'
							variant='secondary'
							disabled={loading}>
							{loading ? (
								<CustomSpinner />
							) : (
								<FaHandHolding color='white' size='1.5rem' />
							)}
						</Button>
					</td>
					<td>
						<Button
							aria-label='Trocar'
							onClick={() => props.onTrade(false)}
							size='sm'
							variant='secondary'
							disabled={loading}>
							{loading ? (
								<CustomSpinner />
							) : (
								<FaHandsHelping color='white' size='1.5rem' />
							)}
						</Button>
					</td>
				</>
			)}
			<td>{props.equipment.name}</td>
			<td>{props.equipment.type}</td>
			<td>{props.equipment.damage}</td>
			<td>
				{props.equipment.damage !== '-' && (
					<Image
						alt='Dado'
						src='/dice20.webp'
						className='clickable'
						onClick={diceRoll}
						style={{ maxHeight: '2rem' }}
					/>
				)}
			</td>
			<td>{props.equipment.range}</td>
			<td>{props.equipment.attacks}</td>
			<td>
				{props.equipment.ammo ? (
					<BottomTextInput
						disabled={loading}
						className='text-center'
						value={currentAmmo}
						onChange={onAmmoChange}
						onBlur={onAmmoBlur}
						style={{ maxWidth: '3rem' }}
					/>
				) : (
					'-'
				)}
			</td>
			<td>{props.equipment.ammo || '-'}</td>
		</tr>
	);
}
