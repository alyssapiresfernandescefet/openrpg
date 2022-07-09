import type { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import Router from 'next/router';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import FormControl from 'react-bootstrap/FormControl';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import WelcomePage from '../components/Admin/WelcomePage';
import ApplicationHead from '../components/ApplicationHead';
import ErrorToastContainer from '../components/ErrorToastContainer';
import useToast from '../hooks/useToast';
import styles from '../styles/modules/Home.module.scss';
import type { InferSSRProps } from '../utils/next';
import api from '../utils/api';
import prisma from '../utils/database';
import { sessionSSR } from '../utils/session';

export default function Page({ init, error }: InferSSRProps<typeof getSSP>) {
	if (error)
		return (
			<>
				<ApplicationHead title='Erro de Execução' />
				<Container className='text-center'>
					<Row>
						<Col className='h1 mt-3' style={{ color: 'red' }}>
							O banco de dados não foi inicializado corretamente.
						</Col>
					</Row>
					<Row>
						<Col className='h3 mt-2'>
							Certifique-se de ter integrado um banco de dados ao aplicativo, criado a
							variável de ambiente <b>CLEARDB_DATABASE_URL</b> e preenchido seu valor
							corretamente.
						</Col>
					</Row>
				</Container>
			</>
		);

	if (!init)
		return (
			<>
				<ApplicationHead title='Inicialização' />
				<WelcomePage />
			</>
		);

	return (
		<>
			<ApplicationHead title='Entrar' />
			<HomePage />
		</>
	);
}

function HomePage() {
	const [loading, setLoading] = useState(false);
	const [toasts, addToast] = useToast();

	async function onFormSubmit(username: string, password: string) {
		setLoading(true);

		try {
			if (username.length === 0 || password.length === 0)
				throw new Error('Você deve preencher tanto o usuário como a senha.');
			const res = await api.post('/login', { username, password });
			if (res.data.admin) return Router.push('/admin/main');
			Router.push('/sheet/player/1');
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
		<>
			<Container className='text-center mt-2'>
				<Row>
					<Col>
						<h1>
							<label htmlFor='username'>Login</label>
						</h1>
					</Col>
				</Row>
				<LoginForm onSubmit={onFormSubmit} />
				<Row>
					<Col>
						<span className='me-2'>Não possui cadastro?</span>
						<Link href='/register' passHref>
							<a className={styles.link}>Cadastrar-se</a>
						</Link>
					</Col>
				</Row>
			</Container>
			<ErrorToastContainer toasts={toasts} />
		</>
	);
}

function LoginForm(props: { onSubmit: (username: string, password: string) => void }) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	return (
		<form
			onSubmit={(ev) => {
				ev.preventDefault();
				setPassword('');
				props.onSubmit(username, password);
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
					<Button type='submit' variant='secondary'>
						Entrar
					</Button>
				</Col>
			</Row>
		</form>
	);
}

async function getSSP(ctx: GetServerSidePropsContext) {
	const player = ctx.req.session.player;

	if (player) {
		if (player.admin) {
			return {
				redirect: {
					destination: '/admin/main',
					permanent: false,
				},
			};
		}
		return {
			redirect: {
				destination: '/sheet/player/1',
				permanent: false,
			},
		};
	}

	try {
		const init = await prisma.config.findUnique({ where: { name: 'init' } });
		return {
			props: {
				init: init === null ? false : true,
			},
		};
	} catch (err) {
		console.error(err);
		return {
			props: {
				init: false,
				error: true,
			},
		};
	}
}

export const getServerSideProps = sessionSSR(getSSP);
