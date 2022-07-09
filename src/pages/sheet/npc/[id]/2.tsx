import type { GetServerSidePropsContext } from 'next';
import Router from 'next/router';
import { useEffect } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import ApplicationHead from '../../../../components/ApplicationHead';
import DataContainer from '../../../../components/DataContainer';
import ErrorToastContainer from '../../../../components/ErrorToastContainer';
import PlayerAnnotationsField from '../../../../components/Player/PlayerAnnotationField';
import PlayerExtraInfoField from '../../../../components/Player/PlayerExtraInfoField';
import useSocket from '../../../../hooks/useSocket';
import useToast from '../../../../hooks/useToast';
import type { InferSSRProps } from '../../../../utils';
import api from '../../../../utils/api';
import prisma from '../../../../utils/database';
import { sessionSSR } from '../../../../utils/session';

type PageProps = InferSSRProps<typeof getSSP>;

export default function Page(props: PageProps) {
	return (
		<>
			<ApplicationHead title='Ficha do Personagem' />
			<PlayerSheet {...props} />
		</>
	);
}

function PlayerSheet(props: PageProps) {
	const [toasts, addToast] = useToast();
	const socket = useSocket(`player${props.player.id}`);

	useEffect(() => {
		if (!socket) return;
		socket.on('playerDelete', () => api.delete('/player').then(() => Router.push('/')));
		return () => {
			socket.off('playerDelete');
		};
	}, [socket]);

	if (!socket)
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
			<Container>
				<Row className='display-5 text-center'>
					<Col>Ficha do Personagem</Col>
				</Row>
				<Row>
					<DataContainer title='Anotações' htmlFor='playerAnnotations' outline>
						<PlayerAnnotationsField
							value={props.player.PlayerNote?.value}
							npcId={props.player.id}
						/>
					</DataContainer>
				</Row>
				<Row>
					<DataContainer title='Detalhes Pessoais' outline>
						{props.player.PlayerExtraInfo.map((extraInfo) => (
							<Row className='mb-4' key={extraInfo.ExtraInfo.id}>
								<Col>
									<FormGroup controlId={`extraInfo${extraInfo.ExtraInfo.id}`}>
										<Row>
											<Col className='h4' style={{ margin: 0 }}>
												<FormLabel>{extraInfo.ExtraInfo.name}</FormLabel>
											</Col>
										</Row>
										<Row>
											<Col>
												<PlayerExtraInfoField
													npcId={props.player.id}
													value={extraInfo.value}
													extraInfoId={extraInfo.ExtraInfo.id}
													logError={addToast}
												/>
											</Col>
										</Row>
									</FormGroup>
								</Col>
							</Row>
						))}
					</DataContainer>
				</Row>
			</Container>
			<ErrorToastContainer toasts={toasts} />
		</>
	);
}

async function getSSP(ctx: GetServerSidePropsContext) {
	const playerSession = ctx.req.session.player;

	if (!playerSession || !playerSession.admin) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		};
	}

	const npcId = parseInt(ctx.query.id as string);

	const player = await prisma.player.findUnique({
		where: { id: npcId },
		select: {
			id: true,
			PlayerNote: { select: { value: true } },
			PlayerExtraInfo: { select: { ExtraInfo: true, value: true } },
		},
	});

	if (!player) {
		ctx.req.session.destroy();
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		};
	}

	return {
		props: {
			player,
		},
	};
}
export const getServerSideProps = sessionSSR(getSSP);
