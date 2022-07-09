import type { Info } from '@prisma/client';
import { MouseEvent, useContext, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { ErrorLogger } from '../../contexts';
import useExtendedState from '../../hooks/useExtendedState';
import api from '../../utils/api';
import DataContainer from '../DataContainer';

type PlayerInfoContainerProps = {
	title: string;
	playerName: string;
	playerNameShow: boolean;
	playerInfo: {
		Info: Info;
		value: string;
	}[];
	npcId?: number;
};

export default function PlayerInfoContainer(props: PlayerInfoContainerProps) {
	return (
		<DataContainer xs={12} sm={6} outline title={props.title}>
			<PlayerNameField
				value={props.playerName}
				show={props.playerNameShow}
				npcId={props.npcId}
			/>
			{props.playerInfo.map((info) => (
				<Row className='mb-4' key={info.Info.id}>
					<Col>
						<div>
							<label className='h5' htmlFor={`info${info.Info.id}`} style={{ margin: 0 }}>
								{info.Info.name}
							</label>
						</div>
						<PlayerInfoField
							infoId={info.Info.id}
							value={info.value}
							npcId={props.npcId}
						/>
					</Col>
				</Row>
			))}
		</DataContainer>
	);
}

type PlayerNameFieldProps = {
	show: boolean;
	value: string;
	npcId?: number;
};

function PlayerNameField(props: PlayerNameFieldProps) {
	const [show, setShow] = useState(props.show);
	const [value, setValue, isClean] = useExtendedState(props.value);
	const [isDefined, setDefined] = useState(props.value.length > 0);
	const inputRef = useRef<HTMLInputElement>(null);
	const componentDidMount = useRef(false);

	const logError = useContext(ErrorLogger);

	useEffect(() => {
		if (componentDidMount.current) {
			if (!isDefined && inputRef.current) inputRef.current.focus();
			return;
		}
		componentDidMount.current = true;
	}, [isDefined]);

	function onShowChange(ev: MouseEvent<HTMLButtonElement>) {
		ev.currentTarget.blur();
		setShow((s) => {
			const newShow = !s;
			api
				.post('/sheet/player', {
					showName: newShow,
					npcId: props.npcId,
				})
				.catch(logError);
			return newShow;
		});
	}

	function onValueBlur() {
		if (value.length > 0) setDefined(true);
		if (isClean()) return;
		api.post('/sheet/player', { name: value, npcId: props.npcId }).catch(logError);
	}

	return (
		<Row className='mb-4'>
			<Col>
				<Row>
					<Col>
						<label className='h5' htmlFor='playerName' style={{ margin: 0 }}>
							Nome
						</label>
					</Col>
				</Row>
				<Row>
					<Col xs='auto' style={{ paddingRight: 0 }}>
						<Button
							aria-label={show ? 'Esconder' : 'Mostrar'}
							size='sm'
							variant={show ? 'primary' : 'secondary'}
							onClick={onShowChange}>
							{show ? <AiFillEye /> : <AiFillEyeInvisible />}
						</Button>
					</Col>
					<Col className='align-self-center'>
						{isDefined ? (
							<label onDoubleClick={() => setDefined(false)}>{value}</label>
						) : (
							<input
								className='theme-element bottom-text w-100'
								id='playerName'
								autoComplete='off'
								value={value}
								onChange={(ev) => setValue(ev.currentTarget.value)}
								onBlur={onValueBlur}
								ref={inputRef}
							/>
						)}
					</Col>
				</Row>
			</Col>
		</Row>
	);
}

type PlayerInfoFieldProps = {
	infoId: number;
	value: string;
	npcId?: number;
};

function PlayerInfoField(props: PlayerInfoFieldProps) {
	const [value, setValue, isClean] = useExtendedState(props.value);
	const [isDefined, setDefined] = useState(props.value.length > 0);
	const inputRef = useRef<HTMLInputElement>(null);
	const componentDidMount = useRef(false);

	const logError = useContext(ErrorLogger);

	useEffect(() => {
		if (componentDidMount.current) {
			if (!isDefined && inputRef.current) inputRef.current.focus();
			return;
		}
		componentDidMount.current = true;
	}, [isDefined]);

	function onValueBlur() {
		if (value.length > 0) setDefined(true);
		if (isClean()) return;
		api
			.post('/sheet/player/info', { id: props.infoId, value, npcId: props.npcId })
			.catch(logError);
	}

	if (isDefined) return <label onDoubleClick={() => setDefined(false)}>{value}</label>;

	return (
		<input
			className='theme-element bottom-text w-100'
			id={`info${props.infoId}`}
			autoComplete='off'
			value={value}
			onChange={(ev) => setValue(ev.currentTarget.value)}
			onBlur={onValueBlur}
			ref={inputRef}
		/>
	);
}
