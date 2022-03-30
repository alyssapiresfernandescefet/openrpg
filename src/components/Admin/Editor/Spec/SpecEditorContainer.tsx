import DataContainer from '../../../DataContainer';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AdminTable from '../../AdminTable';
import SpecEditorField from './SpecEditorField';
import { useContext, useState } from 'react';
import { Spec } from '@prisma/client';
import api from '../../../../utils/api';
import { ErrorLogger } from '../../../../contexts';
import CreateSpecModal from '../../../Modals/CreateSpecModal';

type SpecEditorContainerProps = {
    specs: Spec[];
    disabled?: boolean;
}

export default function SpecEditorContainer(props: SpecEditorContainerProps) {
    const logError = useContext(ErrorLogger);
    const [showSpecModal, setShowSpecModal] = useState(false);
    const [spec, setSpec] = useState(props.specs);

    function createSpec(name: string) {
        api.put('/sheet/spec', { name }).then(res => {
            const id = res.data.id;
            setSpec([...spec, { id, name }]);
        }).catch(logError);
    }

    function deleteSpec(id: number) {
        if (!confirm('Tem certeza de que deseja apagar esse item?')) return;
        api.delete('/sheet/spec', { data: { id } }).then(() => {
            const newSpec = [...spec];
            const index = newSpec.findIndex(spec => spec.id === id);
            if (index > -1) {
                newSpec.splice(index, 1);
                setSpec(newSpec);
            }
        }).catch(logError);
    }

    return (
        <>
            <DataContainer outline title='Especificações de Personagem'
                addButton={{ onAdd: () => setShowSpecModal(true), disabled: props.disabled }}>
                <Row>
                    <Col>
                        <AdminTable>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th title='Nome da Especificação de Personagem.'>Nome</th>
                                </tr>
                            </thead>
                            <tbody>
                                {spec.map(spec =>
                                    <SpecEditorField key={spec.id} deleteDisabled={props.disabled}
                                        spec={spec} onDelete={deleteSpec} />
                                )}
                            </tbody>
                        </AdminTable>
                    </Col>
                </Row>
            </DataContainer>
            <CreateSpecModal show={showSpecModal} onHide={() => setShowSpecModal(false)}
                onCreate={createSpec} />
        </>
    );
}