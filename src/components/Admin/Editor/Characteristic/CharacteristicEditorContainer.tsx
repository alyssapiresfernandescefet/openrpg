import DataContainer from '../../../DataContainer';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AdminTable from '../../AdminTable';
import CharacteristicEditorField from './CharacteristicEditorField';
import { useContext, useState } from 'react';
import { Characteristic } from '@prisma/client';
import api from '../../../../utils/api';
import { ErrorLogger } from '../../../../contexts';
import CreateCharacteristicModal from '../../../Modals/CreateCharacteristicModal';

type CharacteristicEditorContainerProps = {
    characteristics: Characteristic[];
    disabled?: boolean;
}

export default function CharacteristicEditorContainer(props: CharacteristicEditorContainerProps) {
    const logError = useContext(ErrorLogger);
    const [showCharacteristicModal, setShowCharacteristicModal] = useState(false);
    const [characteristic, setCharacteristic] = useState(props.characteristics);

    function createCharacteristic(name: string) {
        api.put('/sheet/characteristic', { name }).then(res => {
            const id = res.data.id;
            setCharacteristic([...characteristic, { id, name }]);
        }).catch(logError);
    }

    function deleteCharacteristic(id: number) {
        if (!confirm('Tem certeza de que deseja apagar esse item?')) return;
        api.delete('/sheet/characteristic', { data: { id } }).then(() => {
            const newCharacteristic = [...characteristic];
            const index = newCharacteristic.findIndex(char => char.id === id);
            if (index > -1) {
                newCharacteristic.splice(index, 1);
                setCharacteristic(newCharacteristic);
            }
        }).catch(logError);
    }

    return (
        <>
            <DataContainer outline title='Características'
                addButton={{ onAdd: () => setShowCharacteristicModal(true), disabled: props.disabled }}>
                <Row>
                    <Col>
                        <AdminTable>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th title='Nome da Característica.'>Nome</th>
                                </tr>
                            </thead>
                            <tbody>
                                {characteristic.map(characteristic =>
                                    <CharacteristicEditorField key={characteristic.id} deleteDisabled={props.disabled}
                                        characteristic={characteristic} onDelete={deleteCharacteristic} />
                                )}
                            </tbody>
                        </AdminTable>
                    </Col>
                </Row>
            </DataContainer>
            <CreateCharacteristicModal show={showCharacteristicModal} onHide={() => setShowCharacteristicModal(false)}
                onCreate={createCharacteristic} />
        </>
    );
}