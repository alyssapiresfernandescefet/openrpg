import type { Attribute, PortraitAttribute } from '@prisma/client';
import type { GetServerSidePropsContext } from 'next';
import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import DropdownButton from 'react-bootstrap/DropdownButton';
import DropdownItem from 'react-bootstrap/DropdownItem';
import FormCheck from 'react-bootstrap/FormCheck';
import FormControl from 'react-bootstrap/FormControl';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ApplicationHead from '../../components/ApplicationHead';
import BottomTextInput from '../../components/BottomTextInput';
import DataContainer from '../../components/DataContainer';
import ErrorToastContainer from '../../components/ErrorToastContainer';
import useToast from '../../hooks/useToast';
import type { InferSSRProps } from '../../utils/next';
import api from '../../utils/api';
import type { DiceConfig, PortraitFontConfig } from '../../utils/config';
import prisma from '../../utils/database';
import type { DiceResolverKeyNum } from '../../utils/dice';
import { sessionSSR } from '../../utils/session';

export default function Configurations(props: InferSSRProps<typeof getSSP>) {
	const [toasts, addToast] = useToast();

	return (
		<>
			<ApplicationHead title='Configurações' />
			<Container>
				<Row>
					<Col className='mt-5 mt-sm-0'>
						<Tabs defaultActiveKey='general' className='mb-3' transition={false}>
							<Tab eventKey='general' title='Geral'>
								<GeneralEditor adminKey={props.adminKey} logError={addToast} />
							</Tab>
							<Tab eventKey='dice' title='Dado'>
								<DiceEditor
									enableAutomaticMarking={props.automaticMarking}
									successTypeEnabled={props.enableSuccessTypes}
									diceConfig={props.dice}
									logError={addToast}
								/>
							</Tab>
							<Tab eventKey='portrait' title='Retrato'>
								<PortraitEditor
									portrait={props.portrait}
									attributes={props.attributes}
									portraitFont={props.portraitFont}
									logError={addToast}
								/>
							</Tab>
						</Tabs>
					</Col>
				</Row>
			</Container>
			<ErrorToastContainer toasts={toasts} />
		</>
	);
}

function DiceEditor(props: {
	successTypeEnabled: boolean;
	enableAutomaticMarking: boolean;
	diceConfig: DiceConfig;
	logError: (err: any) => void;
}) {
	const [loading, setLoading] = useState(false);
	const [successTypeEnabled, setSuccessTypeEnabled] = useState(props.successTypeEnabled);
	const [characteristicDiceNum, setCharacteristicDiceNum] = useState(
		props.diceConfig.characteristic?.value || props.diceConfig.base?.value
	);
	const [characteristicDiceBranched, setCharacteristicDiceBranched] = useState(
		props.diceConfig.characteristic?.branched || props.diceConfig.base?.branched
	);
	const [characteristicDiceModifier, setCharacteristicDiceModifier] = useState(
		props.diceConfig.characteristic?.enable_modifiers || false
	);
	const [skillDiceNum, setSkillDiceNum] = useState(
		props.diceConfig.skill?.value || props.diceConfig.base?.value
	);
	const [skillDiceBranched, setSkillDiceBranched] = useState(
		props.diceConfig.skill?.branched || props.diceConfig.base?.branched
	);
	const [skillDiceModifier, setSkillDiceModifier] = useState(
		props.diceConfig.skill?.enable_modifiers || false
	);
	const [automaticMarking, setAutomaticMarking] = useState(props.enableAutomaticMarking);
	const [attributeDiceNum, setAttributeDiceNum] = useState(
		props.diceConfig.attribute.value
	);
	const [attributeDiceBranched, setAttributeDiceBranched] = useState(
		props.diceConfig.attribute.branched
	);

	function onApply() {
		setLoading(true);
		Promise.all([
			api.post('/config', { name: 'enable_success_types', value: successTypeEnabled }),
			api.post('/config', { name: 'enable_automatic_markers', value: automaticMarking }),
			api.post('/config', {
				name: 'dice',
				value: {
					characteristic: {
						value: characteristicDiceNum,
						branched: characteristicDiceBranched,
						enable_modifiers: characteristicDiceModifier,
					},
					skill: {
						value: skillDiceNum,
						branched: skillDiceBranched,
						enable_modifiers: skillDiceModifier,
					},
					attribute: {
						value: attributeDiceNum,
						branched: attributeDiceBranched,
					},
				},
			}),
		])
			.then(() => alert('Configurações de dado aplicadas com sucesso.'))
			.catch(props.logError)
			.finally(() => setLoading(false));
	}

	return (
		<>
			<Row className='text-center'>
				<Col className='h5'>
					<FormCheck
						inline
						checked={successTypeEnabled}
						onChange={() => setSuccessTypeEnabled((e) => !e)}
						id='diceSuccessTypeEnabled'
						label='Ativar Tipos de Sucesso'
					/>
				</Col>
			</Row>
			<Row className='text-center mb-2'>
				<DataContainer
					title='Rolagem de Atributo'
					outline
					className='mx-3'
					hidden={!successTypeEnabled}>
					<Row className='mb-1'>
						<Col>
							<label className='me-2' htmlFor='attributeDiceValue'>
								Dado:
							</label>
							<select
								id='attributeDiceValue'
								className='theme-element'
								value={attributeDiceNum}
								onChange={(ev) =>
									setAttributeDiceNum(
										parseInt(ev.currentTarget.value) as DiceResolverKeyNum
									)
								}>
								<option value={20}>d20</option>
								<option value={100}>d100</option>
							</select>
						</Col>
					</Row>
					<Row className='mb-1'>
						<Col>
							<FormCheck
								inline
								checked={attributeDiceBranched}
								onChange={() => setAttributeDiceBranched((b) => !b)}
								id='attributeDiceBranched'
								label='Ativar Ramificações'
							/>
						</Col>
					</Row>
				</DataContainer>
			</Row>
			<Row className='text-center mb-2'>
				<DataContainer title='Rolagem de Característica' outline className='mx-3'>
					{successTypeEnabled && (
						<>
							<Row className='mb-1'>
								<Col>
									<label htmlFor='characteristicDiceValue' className='me-2'>
										Dado:
									</label>
									<select
										id='characteristicDiceValue'
										className='theme-element'
										value={characteristicDiceNum}
										onChange={(ev) =>
											setCharacteristicDiceNum(
												parseInt(ev.currentTarget.value) as DiceResolverKeyNum
											)
										}>
										<option value={20}>d20</option>
										<option value={100}>d100</option>
									</select>
								</Col>
							</Row>
							<Row className='mb-1'>
								<Col>
									<FormCheck
										inline
										checked={characteristicDiceBranched}
										onChange={(ev) =>
											setCharacteristicDiceBranched(ev.currentTarget.checked)
										}
										id='characteristicDiceBranched'
										label='Ativar Ramificações'
									/>
								</Col>
							</Row>
						</>
					)}
					<Row className='mb-1'>
						<Col>
							<FormCheck
								inline
								checked={characteristicDiceModifier}
								onChange={(ev) => setCharacteristicDiceModifier(ev.currentTarget.checked)}
								id='characteristicDiceModifiers'
								label='Ativar Modificadores'
							/>
						</Col>
					</Row>
				</DataContainer>
			</Row>
			<Row className='text-center mb-2'>
				<DataContainer title='Rolagem de Perícia' outline className='mx-3'>
					{successTypeEnabled && (
						<>
							<Row className='mb-1'>
								<Col>
									<label htmlFor='skillDiceValue' className='me-2'>
										Dado:
									</label>
									<select
										id='skillDiceValue'
										className='theme-element'
										value={skillDiceNum}
										onChange={(ev) =>
											setSkillDiceNum(
												parseInt(ev.currentTarget.value) as DiceResolverKeyNum
											)
										}>
										<option value={20}>d20</option>
										<option value={100}>d100</option>
									</select>
								</Col>
							</Row>
							<Row className='mb-1'>
								<Col>
									<FormCheck
										inline
										checked={skillDiceBranched}
										onChange={() => setSkillDiceBranched((b) => !b)}
										id='skillDiceBranched'
										label='Ativar Ramificações'
									/>
								</Col>
							</Row>
						</>
					)}
					<Row className='mb-1'>
						<Col>
							<FormCheck
								inline
								checked={skillDiceModifier}
								onChange={(ev) => setSkillDiceModifier(ev.currentTarget.checked)}
								id='skillDiceModifiers'
								label='Ativar Modificadores'
							/>
						</Col>
					</Row>
					<Row className='mb-1'>
						<Col>
							<FormCheck
								inline
								checked={automaticMarking}
								onChange={(ev) => setAutomaticMarking(ev.currentTarget.checked)}
								id='skillDiceAutomaticMarking'
								title='Marca a Perícia automaticamente ao tirar um Sucesso ou maior no teste.'
								label='Ativar Marcação Automática?'
							/>
						</Col>
					</Row>
				</DataContainer>
			</Row>
			<Row className='mb-3'>
				<Col className='text-center'>
					<Button size='sm' variant='secondary' onClick={onApply} disabled={loading}>
						Aplicar
					</Button>
				</Col>
			</Row>
		</>
	);
}

function GeneralEditor(props: { adminKey: string; logError: (err: any) => void }) {
	const [loading, setLoading] = useState(false);
	const [adminKey, setAdminKey] = useState(props.adminKey);

	function onApply() {
		setLoading(true);
		api
			.post('/config', { name: 'admin_key', value: adminKey })
			.then(() => alert('Configurações gerais aplicadas com sucesso.'))
			.catch(props.logError)
			.finally(() => setLoading(false));
	}

	return (
		<>
			<Row className='mb-3 text-center'>
				<Col className='h5'>
					<label htmlFor='adminKeyField' className='me-2'>
						Chave do Mestre:
					</label>
					<BottomTextInput
						id='adminKeyField'
						value={adminKey}
						onChange={(ev) => setAdminKey(ev.currentTarget.value)}
					/>
				</Col>
			</Row>
			<Row className='my-2 text-center'>
				<Col>
					<Button size='sm' variant='secondary' onClick={onApply} disabled={loading}>
						Aplicar
					</Button>
				</Col>
			</Row>
		</>
	);
}

type PortraitEditorAttribute = {
	id: number;
	name: string;
	portrait: PortraitAttribute | null;
};

type PortraitContainerProps = {
	portrait: {
		attributes: Attribute[];
		side_attribute: Attribute | null;
	};
	attributes: Attribute[];
	portraitFont: PortraitFontConfig;
	logError: (err: any) => void;
};

function PortraitEditor(props: PortraitContainerProps) {
	const [loading, setLoading] = useState(false);
	const [attributes, setAttributes] = useState<PortraitEditorAttribute[]>(
		props.portrait.attributes
	);
	const [sideAttribute, setSideAttribute] = useState<PortraitEditorAttribute | null>(
		props.portrait.side_attribute
	);
	const availableAttributes = props.attributes.filter(
		(attr) => !attributes.find((at) => at.id === attr.id) && attr.id !== sideAttribute?.id
	);
	const [font, setFont] = useState<PortraitFontConfig | null>(props.portraitFont);
	const fontRef = useRef<HTMLInputElement | null>(null);
	
	function onApply() {
		setLoading(true);
		Promise.all([
			api.post('/config', {
				name: 'portrait_font',
				value: font,
			}),
			api.post('/sheet/attribute/portrait', {
				primary: attributes,
				secondary: sideAttribute,
			}),
		])
			.then(() => alert('Configurações de retrato aplicadas com sucesso.'))
			.catch(props.logError)
			.finally(() => setLoading(false));
	}

	function addAttribute(attr: Attribute) {
		setAttributes([...attributes, attr]);
	}

	function removeAttribute(id: number) {
		const newAttr = [...attributes];
		newAttr.splice(
			attributes.findIndex((attr) => attr.id === id),
			1
		);
		setAttributes(newAttr);
	}

	function onSideAttributeChange(ev: ChangeEvent<HTMLSelectElement>) {
		const id = parseInt(ev.currentTarget.value);
		setSideAttribute(availableAttributes.find((attr) => attr.id === id) || null);
	}

	function onPortraitFontChange(ev: ChangeEvent<HTMLInputElement>) {
		if (!ev.currentTarget.files) return;
		const file = ev.currentTarget.files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
			if (!e.target) return;
			const base64 = e.target.result;
			setFont({
				name: file.name,
				data: String(base64),
			});
		};
		reader.readAsDataURL(file);
	}

	return (
		<>
			<Row className='mt-2 justify-content-center align-items-center'>
				<Col xs='auto' className='h5' style={{ margin: 0 }}>
					Atributos Primários
				</Col>
				<Col xs={1}>
					<DropdownButton
						title='+'
						variant='secondary'
						size='sm'
						menuVariant='dark'
						disabled={loading || availableAttributes.length === 0}>
						{availableAttributes.map((attr) => (
							<DropdownItem key={attr.id} onClick={() => addAttribute(attr)}>
								{attr.name}
							</DropdownItem>
						))}
					</DropdownButton>
				</Col>
			</Row>
			<Row className='text-center justify-content-center'>
				<Col xs={8}>
					<ListGroup variant='flush' className='rounded my-3'>
						{attributes.map((attr) => (
							<ListGroup.Item key={attr.id}>
								{attr.name}
								<Button
									size='sm'
									variant='secondary'
									className='ms-2'
									onClick={() => removeAttribute(attr.id)}>
									-
								</Button>
							</ListGroup.Item>
						))}
					</ListGroup>
				</Col>
			</Row>
			<Row className='my-2 text-center justify-content-center'>
				<Col className='h5'>
					<label htmlFor='portraitSideAttribute' className='me-2'>
						Atributo Secundário:
					</label>
					<select
						id='portraitSideAttribute'
						className='theme-element'
						value={sideAttribute?.id || 0}
						onChange={onSideAttributeChange}>
						<option value={0} key={0}>
							Nenhum
						</option>
						{props.attributes.map((attr) => {
							if (attributes.find((at) => at.id === attr.id)) return null;
							return (
								<option value={attr.id} key={attr.id}>
									{attr.name}
								</option>
							);
						})}
					</select>
				</Col>
			</Row>
			<hr />
			<Row className='my-2 text-center justify-content-center'>
				<Col className='h5'>
					<label htmlFor='portraitCustomFont' className='me-2'>
						Fonte personalizada:
					</label>
					<div className='my-3'>Atual: {font?.name || 'Nenhuma'}</div>
					<FormControl
						ref={fontRef}
						id='portraitCustomFont'
						type='file'
						accept='.ttf,.woff'
						className='theme-element'
						onChange={onPortraitFontChange}
					/>
					<Button
						className='mt-2'
						size='sm'
						variant='secondary'
						onClick={() => {
							setFont(null);
							if (fontRef.current) fontRef.current.value = '';
						}}
						disabled={loading}>
						Remover Fonte
					</Button>
				</Col>
			</Row>
			<hr />
			<Row className='my-3 text-center'>
				<Col>
					<Button size='sm' variant='secondary' onClick={onApply} disabled={loading}>
						Aplicar
					</Button>
				</Col>
			</Row>
		</>
	);
}

async function getSSP(ctx: GetServerSidePropsContext) {
	const player = ctx.req.session.player;

	if (!player || !player.admin) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		};
	}

	const results = await prisma.$transaction([
		prisma.config.findUnique({ where: { name: 'admin_key' }, select: { value: true } }),
		prisma.config.findUnique({
			where: { name: 'enable_success_types' },
			select: { value: true },
		}),
		prisma.config.findUnique({ where: { name: 'dice' }, select: { value: true } }),
		prisma.attribute.findMany({ where: { portrait: 'PRIMARY' } }),
		prisma.attribute.findFirst({ where: { portrait: 'SECONDARY' } }),
		prisma.attribute.findMany(),
		prisma.config.findUnique({
			where: { name: 'enable_automatic_markers' },
			select: { value: true },
		}),
		prisma.config.findUnique({
			where: { name: 'portrait_font' },
			select: { value: true },
		}),
	]);

	return {
		props: {
			adminKey: results[0]?.value || '',
			enableSuccessTypes: results[1]?.value === 'true',
			dice: JSON.parse(results[2]?.value || 'null') as DiceConfig,
			portrait: {
				attributes: results[3],
				side_attribute: results[4],
			},
			attributes: results[5],
			automaticMarking: results[6]?.value === 'true' ? true : false,
			portraitFont: JSON.parse(results[7]?.value || 'null') as PortraitFontConfig,
		},
	};
}

export const getServerSideProps = sessionSSR(getSSP);
