import type { GetServerSidePropsContext } from 'next';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import AttributeEditorContainer from '../../components/Admin/Editor/AttributeEditorContainer';
import CharacteristicEditorContainer from '../../components/Admin/Editor/CharacteristicEditorContainer';
import CurrencyEditorContainer from '../../components/Admin/Editor/CurrencyEditorContainer';
import EquipmentEditorContainer from '../../components/Admin/Editor/EquipmentEditorContainer';
import ExtraInfoEditorContainer from '../../components/Admin/Editor/ExtraInfoEditorContainer';
import InfoEditorContainer from '../../components/Admin/Editor/InfoEditorContainer';
import ItemEditorContainer from '../../components/Admin/Editor/ItemEditorContainer';
import SpecializationEditorContainer from '../../components/Admin/Editor/SkillEditorContainer';
import SpecEditorContainer from '../../components/Admin/Editor/SpecEditorContainer';
import SpellEditorContainer from '../../components/Admin/Editor/SpellEditorContainer';
import ApplicationHead from '../../components/ApplicationHead';
import ErrorToastContainer from '../../components/ErrorToastContainer';
import { ErrorLogger } from '../../contexts';
import useToast from '../../hooks/useToast';
import type { InferSSRProps } from '../../utils/next';
import prisma from '../../utils/database';
import { sessionSSR } from '../../utils/session';

export default function Admin2(props: InferSSRProps<typeof getSSP>) {
	const [toasts, addToast] = useToast();

	return (
		<>
			<ApplicationHead title='Editor' />
			<Container className='px-5'>
				<ErrorLogger.Provider value={addToast}>
					<Row className='gx-5 gy-4 mb-3'>
						<InfoEditorContainer info={props.info} title='Detalhes Pessoais' />
						<ExtraInfoEditorContainer
							extraInfo={props.extraInfo}
							title='Detalhes Pessoais'
						/>
						<AttributeEditorContainer
							attributes={props.attribute}
							attributeStatus={props.attributeStatus}
						/>
						<SpecEditorContainer specs={props.spec} />
						<CharacteristicEditorContainer
							characteristics={props.characteristic}
							title='Características'
						/>
						<CurrencyEditorContainer currencies={props.currency} />
						<SpecializationEditorContainer
							skills={props.skill}
							specializations={props.specialization}
						/>
						<EquipmentEditorContainer equipments={props.equipment} title='Combate' />
						<ItemEditorContainer items={props.item} title='Itens' />
						<SpellEditorContainer spells={props.spell} title='Magias' />
					</Row>
				</ErrorLogger.Provider>
			</Container>
			<ErrorToastContainer toasts={toasts} />
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
		prisma.player.findMany({ where: { role: 'PLAYER' } }),
		prisma.info.findMany(),
		prisma.extraInfo.findMany(),
		prisma.attribute.findMany(),
		prisma.attributeStatus.findMany(),
		prisma.spec.findMany(),
		prisma.characteristic.findMany(),
		prisma.equipment.findMany(),
		prisma.skill.findMany(),
		prisma.item.findMany(),
		prisma.specialization.findMany(),
		prisma.spell.findMany(),
		prisma.currency.findMany(),
	]);

	return {
		props: {
			players: results[0],
			info: results[1],
			extraInfo: results[2],
			attribute: results[3],
			attributeStatus: results[4],
			spec: results[5],
			characteristic: results[6],
			equipment: results[7],
			skill: results[8],
			item: results[9],
			specialization: results[10],
			spell: results[11],
			currency: results[12],
		},
	};
}

export const getServerSideProps = sessionSSR(getSSP);
