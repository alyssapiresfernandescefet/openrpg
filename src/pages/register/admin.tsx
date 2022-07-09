import type { InferGetServerSidePropsType } from 'next';
import Link from 'next/link';
import Router from 'next/router';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import FormControl from 'react-bootstrap/FormControl';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import ApplicationHead from '../../components/ApplicationHead';
import ErrorToastContainer from '../../components/ErrorToastContainer';
import useAuthentication from '../../hooks/useAuthentication';
import useToast from '../../hooks/useToast';
import homeStyles from '../../styles/modules/Home.module.scss';
import api from '../../utils/api';
import prisma from '../../utils/database';

export default function Register(
	props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
	const [loading, setLoading] = useState(true);
	const [toasts, addToast] = useToast();

	useAuthentication((player) => {
		if (player) {
			if (player.admin) {
				return Router.push('/admin/main');
			}
			return Router.push('/sheet/player/1');
		}
		setLoading(false);
	});

	async function onFormSubmit(
		username: string,
		password: string,
		confirmPassword: string,
		adminKey: string
	) {
		setLoading(true);

		try {
			if (
				username.length === 0 ||
				password.length === 0 ||
				confirmPassword.length === 0 ||
				adminKey.length === 0
			)
				throw new Error('Todos os campos devem ser preenchidos.');
			if (password !== confirmPassword) throw new Error('As senhas não coincidem.');
			await api.post('/register', { username, password, adminKey });
			Router.push('/admin/main');
		} catch (err) {
			addToast(err);
			setLoading(false);
		}
	}

	if (loading)
		return (
			<Container className='text-center'>
				<Row className='align-items-center' style={{ height: '90vh' }}>
					<Col>
						<Spinner animation='border' variant='secondary' />
					</Col>
				</Row>
			</Container>
		);

	return (
		<div>
			<ApplicationHead title='Cadastro de Mestre' />
			<Container className='text-center mt-2'>
				<Row>
					<Col>
						<h1>
							<label htmlFor='username'>Cadastro de Mestre</label>
						</h1>
					</Col>
				</Row>
				<RegisterForm onSubmit={onFormSubmit} disableKey={props.firstAdmin} />
				<Row>
					<Col>
						<Row className='my-3'>
							<Col>
								Já possui cadastro?{' '}
								<Link href='/'>
									<a className={homeStyles.link}>Entrar</a>
								</Link>
							</Col>
						</Row>
						<Row className='my-3'>
							<Col>
								É um jogador?{' '}
								<Link href='/register'>
									<a className={homeStyles.link}>Cadastrar-se como jogador</a>
								</Link>
							</Col>
						</Row>
					</Col>
				</Row>
			</Container>
			<ErrorToastContainer toasts={toasts} />
		</div>
	);
}

function RegisterForm(props: {
	onSubmit: (
		username: string,
		password: string,
		confirmPassword: string,
		adminKey: string
	) => void;
	disableKey: boolean;
}) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [adminKey, setAdminKey] = useState(props.disableKey ? 'disabled' : '');

	return (
		<form
			onSubmit={(ev) => {
				ev.preventDefault();
				setPassword('');
				setConfirmPassword('');
				if (!props.disableKey) setAdminKey('');
				props.onSubmit(username, password, confirmPassword, adminKey);
			}}>
			<Row className='my-3 justify-content-center'>
				<Col md={6}>
					<FormControl
						className='text-center theme-element'
						placeholder='Login'
						id='username'
						name='username'
						value={username}
						onChange={(e) => setUsername(e.currentTarget.value)}
					/>
				</Col>
			</Row>
			<Row className='my-3 justify-content-center'>
				<Col md={6}>
					<FormControl
						type='password'
						className='text-center theme-element'
						placeholder='Senha'
						id='password'
						name='password'
						value={password}
						onChange={(e) => setPassword(e.currentTarget.value)}
					/>
				</Col>
			</Row>
			<Row className='my-3 justify-content-center'>
				<Col md={6}>
					<FormControl
						type='password'
						className='text-center theme-element'
						placeholder='Confirmar Senha'
						id='confirmPassword'
						name='confirmPassword'
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.currentTarget.value)}
					/>
				</Col>
			</Row>
			{props.disableKey ? (
				<label>
					Chave do mestre desabilitada para o primeiro cadastro de mestre.
				</label>
			) : (
				<Row className='my-3 justify-content-center'>
					<Col md={6}>
						<FormControl
							type='password'
							className='text-center theme-element'
							placeholder='Chave do Mestre'
							id='adminKey'
							name='adminKey'
							value={adminKey}
							onChange={(e) => setAdminKey(e.currentTarget.value)}
						/>
					</Col>
				</Row>
			)}
			<Row className='my-3 justify-content-center'>
				<Col md={6}>
					<Button type='submit' variant='secondary'>
						Cadastrar-se
					</Button>
				</Col>
			</Row>
		</form>
	);
}

export async function getServerSideProps() {
	const admins = await prisma.player.findMany({ where: { role: 'ADMIN' } });

	return {
		props: {
			firstAdmin: admins.length === 0,
		},
	};
}
