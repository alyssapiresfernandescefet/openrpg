import copyToClipboard from 'copy-to-clipboard';
import { useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import FormCheck from 'react-bootstrap/FormCheck';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import FormSelect from 'react-bootstrap/FormSelect';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { RiFileCopyLine } from 'react-icons/ri';

type GetPortraitModalProps = {
	show: boolean;
	onHide: () => void;
	playerId: number;
};

const SETTINGS_ORIENTATIONS = ['Esquerda', 'Direita'];

export type PortraitEnvironmentOrientation = 'Esquerda' | 'Direita';

export default function GetPortraitModal(props: GetPortraitModalProps) {
	const [diceColor, setDiceColor] = useState('#ddaf0f');
	const [nameOrientation, setNameOrientation] =
		useState<PortraitEnvironmentOrientation>('Direita');
	const [showDiceRoll, setShowDiceRoll] = useState(true);
	const hostName = useRef('');

	const fieldValue =
		`${hostName.current}/portrait/${props.playerId}` +
		`?dicecolor=${diceColor.substring(1)}` +
		`&showdiceroll=${showDiceRoll}` +
		`&orientation=${nameOrientation}`;

	useEffect(() => {
		hostName.current = window.location.host;
	}, []);

	return (
		<Modal show={props.show} onHide={props.onHide}>
			<Modal.Header>
				<Modal.Title>Retrato de Jogador</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Container fluid>
					<Row className='mb-3'>
						<Col xs='auto' className='align-self-center'>
							<label htmlFor={`portraitColor${props.playerId}`}>Cor dos dados:</label>
						</Col>
						<Col xs={2}>
							<FormControl
								id={`portraitColor${props.playerId}`}
								type='color'
								value={diceColor}
								onChange={(ev) => setDiceColor(ev.currentTarget.value)}
								className='theme-element'
							/>
						</Col>
					</Row>
					<Row className='mb-3'>
						<Col>
							<FormCheck
								inline
								label='Rolagem dos dados vis??vel?'
								checked={showDiceRoll}
								onChange={(ev) => setShowDiceRoll(ev.currentTarget.checked)}
							/>
						</Col>
					</Row>
					<Row>
						<Col>
							<FormGroup className='mb-3' controlId='portraitSettingsOrientation'>
								<FormLabel>Orienta????o do Retrato</FormLabel>
								<FormSelect
									value={nameOrientation}
									className='theme-element'
									onChange={(ev) =>
										setNameOrientation(ev.target.value as PortraitEnvironmentOrientation)
									}>
									{SETTINGS_ORIENTATIONS.map((or) => (
										<option key={or} value={or}>
											{or}
										</option>
									))}
								</FormSelect>
							</FormGroup>
						</Col>
					</Row>
					<Row>
						<hr />
						<Col>
							<FormControl className='theme-element' disabled value={fieldValue} />
						</Col>
						<Col xs='auto'>
							<Button
								variant='secondary'
								onClick={() => {
									const copied = copyToClipboard(fieldValue);
									if (copied) {
										alert('Link copiado para a sua ??rea de transfer??ncia.');
										props.onHide();
									} else
										alert(
											'O link n??o p??de ser copiado para sua ??rea de transfer??ncia.' +
												' Por favor, copie o link manualmente.'
										);
								}}>
								<RiFileCopyLine />
							</Button>
						</Col>
					</Row>
				</Container>
			</Modal.Body>
			<Modal.Footer>
				<Button variant='secondary' onClick={props.onHide}>
					OK
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
