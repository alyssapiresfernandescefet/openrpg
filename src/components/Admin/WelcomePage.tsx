import Router from 'next/router';
import { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import FormSelect from 'react-bootstrap/FormSelect';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import api from '../../utils/api';
import _presets from '../../utils/presets.json';
import type { BootResponse } from '../../pages/api/boot';

const presets = _presets.map((p) => ({ id: p.preset_id, name: p.preset_name }));

type Preset = typeof presets[number];

export default function WelcomePage() {
	const [booting, setBooting] = useState(false);
	const [error, setError] = useState<string>();
	const [selectedPreset, setSelectedPreset] = useState(presets[0]);

	function boot() {
		setBooting(true);
		api
			.post<BootResponse>('/boot', { presetId: selectedPreset.id })
			.then(({ data }) => {
				if (data.status === 'success') {
					Router.reload();
					return;
				}

				switch (data.reason) {
					case 'already_booted':
						return setError(
							'Não foi possível aplicar as configurações iniciais.' +
								' Tente recarregar a página'
						);
					case 'invalid_preset_id':
						return setError('A predefinição selecionada não existe.');
					default:
						break;
				}
			})
			.catch(console.error);
	}

	if (error)
		return (
			<Container className='text-center'>
				<Row>
					<Col className='h1 mt-3'>
						Algo de errado aconteceu. O Open RPG não pôde concluir a configuração inicial
						do sistema. Confira se o banco de dados está corretamente vinculado na Heroku
						e faça o redeploy. Caso esse erro persista, contate o(a) administrador(a) do
						Open RPG no{' '}
						<a
							href='https://github.com/alyssapiresfernandescefet/openrpg/issues'
							target='_blank'
							rel='noreferrer'>
							GitHub
						</a>
						.
					</Col>
				</Row>
				<Row>
					<Col className='h4 mt-3'>Motivo: {error}</Col>
				</Row>
			</Container>
		);

	if (booting)
		return (
			<Container className='text-center'>
				<Row>
					<Col className='h1 mt-3'>
						Aplicando as predefinições de {selectedPreset.name}...
					</Col>
				</Row>
				<Row>
					<Col className='mt-3'>
						<Spinner animation='border' variant='secondary' />
					</Col>
				</Row>
			</Container>
		);

	return (
		<Container className='text-center'>
			<Row>
				<Col className='h1 mt-3'>Seja bem-vindo ao Open RPG!</Col>
			</Row>
			<Row>
				<Col className='h4 mt-3'>
					Para começar, selecione uma predefinição de ficha abaixo:
				</Col>
			</Row>
			<Row className='justify-content-center'>
				<Col xs={12} md={8} className='mt-3'>
					<FormSelect
						value={selectedPreset.id}
						onChange={(ev) =>
							setSelectedPreset(presets.find((p) => p.id === ev.target.value) as Preset)
						}
						className='theme-element'>
						{presets.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</FormSelect>
				</Col>
			</Row>
			<Row>
				<Col className='mt-3'>
					<Button variant='secondary' onClick={boot}>
						Aplicar
					</Button>
				</Col>
			</Row>
		</Container>
	);
}
